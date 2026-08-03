export type CustomerStatus = "active" | "inactive";

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: CustomerStatus;
  lastContactDate: string; // ISO date
  notes: string;
  createdAt: string; // ISO date
  photoUrl?: string; // base64 data URL or remote URL, optional profile photo
}

/**
 * Shape stored in MongoDB. Same as `Customer` but keeps `_id` (Mongo's
 * internal ObjectId) out of the API contract — routes strip it before
 * responding so the client only ever sees `Customer`.
 */
export type CustomerDoc = Customer;

/** Payload for creating/editing a customer via the form. */
export interface CustomerInput {
  name: string;
  email: string;
  phone: string;
  company: string;
  status: CustomerStatus;
  lastContactDate: string;
  notes: string;
  photoUrl?: string;
}

export type SortField = "name" | "email" | "lastContactDate";
export type SortDirection = "asc" | "desc";

export interface SortState {
  field: SortField;
  direction: SortDirection;
}

/** The shape of an in-progress or applied filter set. */
export interface CustomerFilters {
  status: CustomerStatus[];
  companies: string[];
  dateFrom: string | null;
  dateTo: string | null;
  phone: string;
  email: string;
}

export const EMPTY_FILTERS: CustomerFilters = {
  status: [],
  companies: [],
  dateFrom: null,
  dateTo: null,
  phone: "",
  email: "",
};

/** A named, saved combination of filters the user can re-apply. */
export interface SavedFilter {
  id: string;
  name: string;
  filters: CustomerFilters;
  isTemplate?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CustomerListParams {
  search?: string;
  status?: CustomerStatus[];
  companies?: string[];
  dateFrom?: string | null;
  dateTo?: string | null;
  phone?: string;
  email?: string;
  sortField?: SortField;
  sortDirection?: SortDirection;
  page?: number;
  pageSize?: number;
}
