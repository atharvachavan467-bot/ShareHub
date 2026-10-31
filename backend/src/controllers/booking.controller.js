import { asyncHandler } from "../utils/asyncHandler.js";
import { Booking } from "../models/booking.model.js"
import { Resource } from "../models/resource.model.js"
import { Incident } from "../models/IncidentReport.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiRespoce.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { logAudit } from "../utils/auditLogger.js";

const advanceWaitlistForResource = async (resourceId, actorId) => {
    try {
        const nextWaitlist = await Booking.findOne({
            resouceId: resourceId,
            status: "WAITLISTED"
        }).sort({ waitlistPosition: 1, createdAt: 1 });

        if (!nextWaitlist) return;

        const activeBooking = await Booking.findOne({
            resouceId: resourceId,
            status: { $in: ["APPROVED", "CHECKED_IN"] }
        }).sort({ endDate: -1 });

        const now = new Date();
        const duration = new Date(nextWaitlist.endDate).getTime() - new Date(nextWaitlist.startDate).getTime();
        let newStart = now;
        if (activeBooking && new Date(activeBooking.endDate) > now) {
            newStart = new Date(activeBooking.endDate);
        }
        const newEnd = new Date(newStart.getTime() + duration);

        await Booking.findByIdAndUpdate(nextWaitlist._id, {
            status: "PENDING_APPROVAL",
            isWaitlisted: false,
            waitlistPosition: 0,
            startDate: newStart,
            endDate: newEnd
        });

        await Booking.updateMany(
            { resouceId: resourceId, status: "WAITLISTED" },
            { $inc: { waitlistPosition: -1 } }
        );

        await logAudit({
            actorId: actorId || nextWaitlist.owner,
            action: "WAITLIST_ADVANCED",
            bookingId: nextWaitlist._id,
            resourceId: resourceId,
            notes: `Waitlisted booking automatically promoted to PENDING_APPROVAL. Scheduled from ${newStart.toLocaleDateString()} to ${newEnd.toLocaleDateString()}.`
        });
    } catch (err) {
        console.error("Error advancing waitlist:", err);
    }
};

const bookRequestResource = asyncHandler(async(req,res) => {
    const { resouceId, purpose, startDate, endDate } = req.body;
    const owner = req.user._id;

    if (
        [resouceId, purpose].some((field) => !field || field?.trim?.() === "")
    ) {
        throw new ApiError(400, "All fields are required");
    }

    if (!startDate || !endDate) {
        throw new ApiError(400, "startDate and endDate are required");
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
        throw new ApiError(400, "Valid startDate and endDate are required, with endDate after startDate");
    }

    const durationMs = end.getTime() - start.getTime();

    // Find any existing active, pending, or waitlisted bookings for this resource
    const existingBookings = await Booking.find({
        resouceId: resouceId,
        status: { $in: ["APPROVED", "CHECKED_IN", "PENDING_APPROVAL", "WAITLISTED"] }
    }).sort({ endDate: -1 });

    // Check if any booking overlaps with requested window
    const overlapping = existingBookings.filter(b => {
        const bStart = new Date(b.startDate);
        const bEnd = new Date(b.endDate);
        return bStart < end && bEnd > start;
    });

    if (overlapping.length > 0) {
        // Sequential waitlist: Find latest scheduled end date among all bookings
        const maxEnd = existingBookings.reduce((latest, b) => {
            const bEnd = new Date(b.endDate);
            return bEnd > latest ? bEnd : latest;
        }, end);

        // Schedule next borrower right after person 1 completes
        const queuedStart = new Date(maxEnd.getTime());
        const queuedEnd = new Date(queuedStart.getTime() + durationMs);

        const currentWaitlistCount = await Booking.countDocuments({
            resouceId: resouceId,
            status: "WAITLISTED"
        });
        const waitlistPos = currentWaitlistCount + 1;
        const priorBooking = overlapping[0];

        const bookedItem = await Booking.create({
            resouceId,
            purpose,
            owner,
            startDate: queuedStart,
            endDate: queuedEnd,
            originalRequestedStartDate: start,
            originalRequestedEndDate: end,
            status: "WAITLISTED",
            isWaitlisted: true,
            waitlistPosition: waitlistPos,
            queuedAfterBookingId: priorBooking?._id
        });

        await logAudit({
            actorId: owner,
            action: "WAITLISTED",
            bookingId: bookedItem._id,
            resourceId: resouceId,
            notes: `Resource occupied during requested dates. Placed in Waiting List #Position ${waitlistPos}. Scheduled from ${queuedStart.toLocaleDateString()} to ${queuedEnd.toLocaleDateString()} following prior borrower.`
        });

        return res.status(201).json(
            new ApiResponce(
                200,
                `Resource has an overlapping reservation. You have been placed on the Waiting List (Position #${waitlistPos}). Scheduled to start sequentially on ${queuedStart.toLocaleDateString()}.`,
                bookedItem
            )
        );
    }

    // No overlap - regular booking request
    const bookedItem = await Booking.create({
        resouceId,
        purpose,
        owner,
        startDate: start,
        endDate: end,
        status: "PENDING_APPROVAL",
        isWaitlisted: false,
        waitlistPosition: 0
    });

    if (!bookedItem) {
        throw new ApiError(500, "Something went wrong while booking request this resource");
    }

    await logAudit({
        actorId: owner,
        action: "BOOKING_REQUESTED",
        bookingId: bookedItem._id,
        resourceId: resouceId,
        notes: `Booking requested from ${start.toISOString()} to ${end.toISOString()}. Purpose: ${purpose}`
    });

    return res.status(201).json(
        new ApiResponce(200, "Request sent successfully", bookedItem)
    );
});

const confirmBooking = asyncHandler(async(req,res) => {
    const { resouceId, status, bookingId } = req.body
    if (
        [resouceId, status].some((field) => !field || field?.trim?.() === "")
    ) {
        throw new ApiError(400, "All fields are required");
    }

    if (!["APPROVED", "REJECTED"].includes(status)) {
        throw new ApiError(400, "Status must be APPROVED or REJECTED");
    }

    const resource = await Resource.findById(resouceId);
    if (!resource) {
        throw new ApiError(400, "Wrong resource id");
    }

    const userid = req.user._id;
    if (resource.ownerId.toString() !== userid.toString()) {
        throw new ApiError(403, "Owner of this resource can only confirm this booking");
    }

    const fieldToUpdate = {}
    fieldToUpdate.status = status
    if (status === "REJECTED") {
        const { rejectionReason } = req.body
        if (!rejectionReason || rejectionReason.trim() === "") {
            throw new ApiError(400, "Rejection reason is required when rejecting");
        }
        fieldToUpdate.rejectionReason = rejectionReason;
    } else {
        const { totalPrice } = req.body
        fieldToUpdate.totalPrice = totalPrice;
    }

    const bookedItem = await Booking.findByIdAndUpdate(
        bookingId,
        { $set: fieldToUpdate },
        { new: true }
    )

    if (!bookedItem) {
        throw new ApiError(400, "Wrong booking id");
    }

    await logAudit({
        actorId: userid,
        action: status === "APPROVED" ? "BOOKING_APPROVED" : "BOOKING_REJECTED",
        bookingId: bookingId,
        resourceId: resouceId,
        notes: status === "REJECTED"
            ? `Rejected. Reason: ${fieldToUpdate.rejectionReason}`
            : `Approved. Total price: ${fieldToUpdate.totalPrice}`
    });

    if (status === "REJECTED") {
        await advanceWaitlistForResource(resouceId, userid);
    }

    return res.status(200).json(
        new ApiResponce(200, "Booking confirmation done", bookedItem)
    );
})

const pickUpBooking = asyncHandler(async(req,res) => {
    const { actualCheckInDate, bookingId, conditionRating, conditionNote } = req.body

    if (!bookingId) {
        throw new ApiError(400, "bookingId is required");
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
        throw new ApiError(404, "Booking not found");
    }

    if (booking.status !== "APPROVED") {
        throw new ApiError(400, "Booking must be APPROVED before check-in");
    }

    const status = "CHECKED_IN"

    const imageLocalFiles = req.files?.images;
    if (!imageLocalFiles || imageLocalFiles.length === 0) {
        throw new ApiError(400, "At least one resource image is required");
    }
    const uploadPromises = imageLocalFiles.map((file) => uploadOnCloudinary(file.path));
    const uploadResults = await Promise.all(uploadPromises);
    const imageUrls = uploadResults
        .filter((result) => result !== null)
        .map((result) => result.secure_url || result.url);

    const fieldToUpdate = {}
    fieldToUpdate.actualCheckInDate = actualCheckInDate || new Date();
    fieldToUpdate.status = status;
    fieldToUpdate.beforePhotoURI = imageUrls;
    if (conditionRating) {
        fieldToUpdate.conditionRating = conditionRating;
    }
    if (conditionNote) {
        fieldToUpdate.conditionNote = conditionNote;
    }

    const bookedItem = await Booking.findByIdAndUpdate(
        bookingId,
        { $set: fieldToUpdate },
        { new: true }
    )

    await Resource.findByIdAndUpdate(
        booking.resouceId,
        { $set: { status: "IN_USE" } }
    );

    await logAudit({
        actorId: req.user._id,
        action: "CHECKED_IN",
        bookingId: bookingId,
        resourceId: booking.resouceId,
        notes: `Check-in completed. Condition: ${conditionRating || "GOOD"}. ${imageUrls.length} photo(s) uploaded.`
    });

    return res.status(200).json(
        new ApiResponce(200, "Booking Check In confirmed", bookedItem)
    );
})

const checkoutBooking = asyncHandler(async (req, res) => {
    const { bookingId, conditionRating, conditionNote } = req.body;

    if (!bookingId) {
        throw new ApiError(400, "bookingId is required");
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
        throw new ApiError(404, "Booking not found");
    }

    const userId = req.user._id;
    const resource = await Resource.findById(booking.resouceId);
    if (!resource) {
        throw new ApiError(404, "Resource not found");
    }

    const isBorrower = booking.owner.toString() === userId.toString();
    const isOwner = resource.ownerId.toString() === userId.toString();

    if (!isBorrower && !isOwner) {
        throw new ApiError(403, "Only the borrower or resource owner can checkout this booking");
    }

    if (booking.status !== "CHECKED_IN") {
        throw new ApiError(400, "Booking must be in CHECKED_IN status to checkout");
    }

    const imageLocalFiles = req.files?.images;
    if (!imageLocalFiles || imageLocalFiles.length === 0) {
        throw new ApiError(400, "At least one return condition photo is required");
    }

    const uploadPromises = imageLocalFiles.map((file) => uploadOnCloudinary(file.path));
    const uploadResults = await Promise.all(uploadPromises);
    const imageUrls = uploadResults
        .filter((result) => result !== null)
        .map((result) => result.secure_url || result.url);

    const now = new Date();
    const isLate = now > new Date(booking.endDate);

    const fieldToUpdate = {};
    fieldToUpdate.actualReturnDate = now;
    fieldToUpdate.afterPhotoURI = imageUrls;
    fieldToUpdate.status = isLate ? "OVERDUE" : "RETURNED";

    if (conditionRating) {
        fieldToUpdate.conditionRating = conditionRating;
    }
    if (conditionNote) {
        fieldToUpdate.conditionNote = conditionNote;
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
        bookingId,
        { $set: fieldToUpdate },
        { new: true }
    );

    await Resource.findByIdAndUpdate(
        booking.resouceId,
        { $set: { status: "AVAILABLE" } }
    );

    await User.findByIdAndUpdate(
        booking.owner,
        { $addToSet: { history: booking._id } }
    );

    if (isLate) {
        const lateHours = Math.round((now - new Date(booking.endDate)) / (1000 * 60 * 60));
        const incident = await Incident.create({
            bookingId: booking._id,
            resourceId: booking.resouceId,
            reportedBy: userId,
            type: "LATE_RETURN",
            severity: lateHours > 48 ? "HIGH" : lateHours > 24 ? "MEDIUM" : "LOW",
            description: `Item returned ${lateHours} hour(s) late. Scheduled end: ${booking.endDate}. Actual return: ${now}.`
        });

        await Booking.findByIdAndUpdate(
            bookingId,
            { $push: { incidents: incident._id } }
        );

        const deduction = lateHours > 48 ? 15 : lateHours > 24 ? 10 : 5;
        await User.findByIdAndUpdate(
            booking.owner,
            { $inc: { trustScore: -deduction } }
        );

        await logAudit({
            actorId: userId,
            action: "LATE_RETURN_DETECTED",
            bookingId: bookingId,
            resourceId: booking.resouceId,
            notes: `Returned ${lateHours}h late. Trust score deducted by ${deduction}.`
        });
    }

    if (conditionRating === "DAMAGED") {
        const incident = await Incident.create({
            bookingId: booking._id,
            resourceId: booking.resouceId,
            reportedBy: userId,
            type: "DAMAGE",
            severity: "HIGH",
            description: conditionNote || "Item returned in damaged condition.",
            image: imageUrls
        });

        await Booking.findByIdAndUpdate(
            bookingId,
            { $push: { incidents: incident._id } }
        );

        await User.findByIdAndUpdate(
            booking.owner,
            { $inc: { trustScore: -15 } }
        );

        await logAudit({
            actorId: userId,
            action: "DAMAGE_REPORTED",
            bookingId: bookingId,
            resourceId: booking.resouceId,
            notes: `Returned damaged. Trust score deducted by 15.`
        });
    }

    if (!isLate && conditionRating !== "DAMAGED") {
        const bonus = 5;
        const borrower = await User.findById(booking.owner);
        if (borrower) {
            const currentScore = borrower.trustScore !== undefined ? borrower.trustScore : 100;
            const newScore = Math.min(150, currentScore + bonus);
            await User.findByIdAndUpdate(booking.owner, { trustScore: newScore });
        }

        await logAudit({
            actorId: userId,
            action: "ON_TIME_BONUS_AWARDED",
            bookingId: bookingId,
            resourceId: booking.resouceId,
            notes: `Resource returned on time in ${conditionRating || "GOOD"} condition! +${bonus} bonus trust score points awarded to borrower.`
        });
    }

    await advanceWaitlistForResource(booking.resouceId, userId);

    await logAudit({
        actorId: userId,
        action: isLate ? "RETURNED_LATE" : "RETURNED",
        bookingId: bookingId,
        resourceId: booking.resouceId,
        notes: `Item returned. Condition: ${conditionRating || "GOOD"}. ${imageUrls.length} photo(s).`
    });

    return res.status(200).json(
        new ApiResponce(200, isLate ? "Booking returned (LATE)" : "Booking returned successfully (On-Time Bonus Awarded)", updatedBooking)
    );
})

const getBookingTimeline = asyncHandler(async (req, res) => {
    const { bookingId } = req.params;
    const { AuditLog } = await import("../models/auditlog.model.js");

    const booking = await Booking.findById(bookingId)
        .populate("owner", "fullname username avatar")
        .populate("resouceId", "title image ownerId")
        .populate("incidents");

    if (!booking) {
        throw new ApiError(404, "Booking not found");
    }

    const timeline = await AuditLog.find({ bookingId })
        .populate("actorId", "fullname username avatar")
        .sort({ createdAt: 1 });

    return res.status(200).json(
        new ApiResponce(200, "Booking timeline fetched", { booking, timeline })
    );
})

const getMyBookings = asyncHandler(async (req, res) => {
    const { status } = req.query;
    const filter = { owner: req.user._id };
    if (status) {
        filter.status = status;
    }

    const bookings = await Booking.find(filter)
        .populate("resouceId", "title image pricingType pricePerUnit")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponce(200, "Your bookings fetched", bookings)
    );
})

const getBookingsForOwner = asyncHandler(async (req, res) => {
    const { status } = req.query;

    const myResources = await Resource.find({ ownerId: req.user._id }).select("_id");
    const resourceIds = myResources.map(r => r._id);

    const filter = { resouceId: { $in: resourceIds } };
    if (status) {
        filter.status = status;
    }

    const bookings = await Booking.find(filter)
        .populate("owner", "fullname username avatar trustScore email IdentityNumber isIdentityVerified")
        .populate("resouceId", "title image")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponce(200, "Bookings for your resources fetched", bookings)
    );
})

export {
    bookRequestResource,
    confirmBooking,
    pickUpBooking,
    checkoutBooking,
    getBookingTimeline,
    getMyBookings,
    getBookingsForOwner
}
