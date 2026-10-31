// Strict Global Enums matching Backend
export type UserRole = "USER" | "OWNER" | "ADMIN";
export type ResourceCategory = "SERVICE" | "PRODUCT";
export type PricingType = "PER_DAY" | "PER_HOUR";
export type ResourceStatus = "AVAILABLE" | "IN_USE" | "MAINTENANCE";
export type BookingStatus =
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "CHECKED_IN"
  | "RETURNED"
  | "OVERDUE"
  | "REJECTED"
  | "CANCELLED"
  | "WAITLISTED";
export type ConditionRating = "GOOD" | "FAIR" | "DAMAGED";
export type DepositStatus = "NOT_PAID" | "PENDING" | "COMPLETED";
export type IncidentType = "DAMAGE" | "LATE_RETURN" | "MISSING_PARTS" | "SAFETY_VIOLATION";
export type IncidentSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type IncidentStatus = "OPEN" | "RESOLVED" | "DISPUTED";
export type QualificationStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface UserSummary {
  _id: string;
  username: string;
  fullname: string;
  avatar: string;
  email?: string;
  trustScore?: number;
  role?: UserRole;
  IdentityNumber?: number;
  isIdentityVerified?: boolean;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  fullname: string;
  avatar: string;
  coverImage?: string;
  trustScore: number;
  IdentityNumber: number;
  isIdentityVerified: boolean;
  role: UserRole;
  resources?: string[];
  history?: string[];
  qualification?: (string | Qualification)[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ResourceLocation {
  firstLine: string;
  secondLine?: string;
  country: string;
  state: string;
}

export interface Resource {
  _id: string;
  ownerId: string | UserSummary;
  title: string;
  description: string;
  category: ResourceCategory;
  image: string[];
  location: ResourceLocation;
  pricingType: PricingType;
  pricePerUnit: number;
  securityDeposit: number;
  termsAndCondition: string;
  termsDocs?: string;
  requiredQualification: string[];
  requireSupervision: boolean;
  status: ResourceStatus;
  maxBookingDays: number;
  createdAt: string;
  updatedAt: string;
}

export interface ActiveBooking {
  _id?: string;
  startDate: string;
  endDate: string;
  status: BookingStatus;
}

export interface Booking {
  _id: string;
  resouceId: string | Resource;
  owner: string | UserSummary;
  purpose: string;
  startDate: string;
  endDate: string;
  totalPrice?: number;
  actualCheckInDate?: string;
  actualReturnDate?: string;
  beforePhotoURI?: string[];
  afterPhotoURI?: string[];
  conditionRating?: ConditionRating;
  conditionNote?: string;
  depositStatus?: DepositStatus;
  status: BookingStatus;
  rejectionReason?: string;
  isWaitlisted?: boolean;
  waitlistPosition?: number;
  originalRequestedStartDate?: string;
  originalRequestedEndDate?: string;
  queuedAfterBookingId?: string;
  incidents?: (string | Incident)[];
  createdAt: string;
  updatedAt: string;
}

export interface BorrowerInspectionData {
  user: User;
  stats: {
    totalBookings: number;
    completedBookings: number;
    overdueBookings: number;
    activeBookings: number;
    totalPenalties: number;
    totalPenaltyAmount: number;
  };
  qualifications: Qualification[];
  bookings: Booking[];
  incidents: Incident[];
  penalties: Incident[];
}

export interface AuditLog {
  _id: string;
  actorId: {
    _id?: string;
    fullname?: string;
    username?: string;
    avatar?: string;
  };
  action: string;
  bookingId: string;
  resourceId?: string;
  notes: string;
  createdAt: string;
}

export interface Incident {
  _id: string;
  bookingId: string | Booking;
  resourceId: string | Resource;
  reportedBy: string | UserSummary;
  type: IncidentType;
  severity: IncidentSeverity;
  description: string;
  image?: string[];
  status: IncidentStatus;
  resolutionNote?: string;
  penaltyAmount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Qualification {
  _id: string;
  userid: string;
  qualificationName: string;
  certificateNumber?: string;
  proofDocument: string;
  status: QualificationStatus;
  verifiedBy?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResources {
  resources: Resource[];
  pagination: Pagination;
}

export interface ApiResponse<T = any> {
  statusCode: number;
  message: string | any;
  data: T;
  success: boolean;
}

export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  errors?: any[];
  success: boolean;
}
