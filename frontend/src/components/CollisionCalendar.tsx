import React, { useState } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isBefore,
  isWithinInterval,
  startOfDay,
} from "date-fns";
import { ActiveBooking } from "@/types";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, AlertCircle } from "lucide-react";

interface CollisionCalendarProps {
  activeBookings?: ActiveBooking[];
  startDate: Date | null;
  endDate: Date | null;
  maxBookingDays?: number;
  onSelectRange: (start: Date | null, end: Date | null) => void;
}

export const CollisionCalendar: React.FC<CollisionCalendarProps> = ({
  activeBookings = [],
  startDate,
  endDate,
  maxBookingDays,
  onSelectRange,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const today = startOfDay(new Date());

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  // Determine if a given date is booked in any approved or checked-in booking
  const isDateBooked = (date: Date) => {
    return activeBookings.some((booking) => {
      const bStart = startOfDay(new Date(booking.startDate));
      const bEnd = startOfDay(new Date(booking.endDate));
      return isWithinInterval(date, { start: bStart, end: bEnd });
    });
  };

  // Determine if selecting [startDate, candidateDate] would collide with an existing booking
  const wouldRangeCollide = (start: Date, end: Date) => {
    return activeBookings.some((booking) => {
      const bStart = startOfDay(new Date(booking.startDate));
      const bEnd = startOfDay(new Date(booking.endDate));
      return (
        (isWithinInterval(bStart, { start, end }) ||
         isWithinInterval(bEnd, { start, end }) ||
         (isBefore(bStart, start) && isBefore(end, bEnd)))
      );
    });
  };

  const handleDateClick = (day: Date) => {
    if (isBefore(day, today)) return;

    if (!startDate || (startDate && endDate)) {
      // Start a fresh selection
      onSelectRange(day, null);
    } else {
      // Attempting to set end date
      if (isBefore(day, startDate)) {
        // Clicked a date before start date, restart start date
        onSelectRange(day, null);
      } else {
        // Check max booking days if specified
        if (maxBookingDays) {
          const diffDays = Math.ceil((day.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          if (diffDays > maxBookingDays) {
            alert(`Maximum allowed reservation duration for this resource is ${maxBookingDays} day(s).`);
            return;
          }
        }

        onSelectRange(startDate, day);
      }
    }
  };

  // Build grid days
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  return (
    <div className="p-4 sm:p-5 glass-card rounded-2xl border border-slate-700/80 select-none">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-brand-400" />
          <h3 className="font-bold text-base text-white">
            {format(currentMonth, "MMMM yyyy")}
          </h3>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={prevMonth}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Days of week */}
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {weekDays.map((wd) => (
          <div key={wd} className="text-xs font-mono font-semibold text-slate-400 py-1">
            {wd}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isPast = isBefore(day, today);
          const isBooked = isDateBooked(day);
          const isStart = startDate && isSameDay(day, startDate);
          const isEnd = endDate && isSameDay(day, endDate);
          const inRange =
            startDate &&
            endDate &&
            isWithinInterval(day, { start: startDate, end: endDate });

          let dayClasses = "relative h-10 w-full flex items-center justify-center text-xs font-mono rounded-lg transition-all ";

          if (!isCurrentMonth) {
            dayClasses += "text-slate-600 pointer-events-none ";
          } else if (isPast) {
            dayClasses += "text-slate-600 line-through opacity-40 cursor-not-allowed ";
          } else if (isStart || isEnd) {
            dayClasses += "bg-brand-600 text-white font-bold shadow-glow-brand ring-2 ring-brand-400 z-10 ";
          } else if (inRange) {
            dayClasses += isBooked
              ? "bg-amber-500/30 text-amber-200 border-y border-amber-500/50 "
              : "bg-brand-500/25 text-brand-200 border-y border-brand-500/40 ";
          } else if (isBooked) {
            dayClasses += "bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 cursor-pointer font-medium ";
          } else {
            dayClasses += "text-slate-200 hover:bg-slate-800 hover:text-white cursor-pointer ";
          }

          return (
            <button
              type="button"
              key={day.toISOString()}
              disabled={!isCurrentMonth || isPast}
              onClick={() => handleDateClick(day)}
              className={dayClasses}
              title={
                isBooked
                  ? "Active Reservation (Waitlist Queue Available)"
                  : isPast
                  ? "Past date"
                  : format(day, "MMM dd, yyyy")
              }
            >
              <span>{format(day, "d")}</span>
              {isBooked && (
                <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* Overlapping Range Banner */}
      {startDate && endDate && wouldRangeCollide(startDate, endDate) && (
        <div className="mt-3 p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-300">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold text-white">Overlapping Booking (Waitlist Mode Active)</p>
            <p className="text-[11px] text-amber-200/90 leading-relaxed">
              This slot is currently occupied. Submitting this request will automatically place you on the <strong>Waiting List</strong> to receive the equipment immediately after person 1 completes!
            </p>
          </div>
        </div>
      )}

      {/* Legend & Collision Helper */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-brand-500" />
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-amber-500/30 border border-amber-500/60" />
            <span className="text-amber-400">Reserved (Waitlist Available)</span>
          </div>
        </div>

        {startDate && (
          <div className="font-mono text-brand-300">
            {format(startDate, "MMM dd")} {endDate ? `→ ${format(endDate, "MMM dd")}` : "(pick end date)"}
          </div>
        )}
      </div>

      {activeBookings.length > 0 && (
        <div className="mt-3 p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
          <span>
            {activeBookings.length} existing booking(s) on file. Overlapping dates are queued into the sequential Waiting List.
          </span>
        </div>
      )}
    </div>
  );
};
