import { Customer } from "@/types/customer";

/**
 * In-memory "database" backing the mock API routes in app/api/customers.
 * Starts empty — use the Add Customer form, or POST to /api/customers,
 * to populate it. Data resets whenever the server restarts.
 */
export const customersDB: Customer[] = [];

/**
 * Options shown in the Company filter dropdown. Since there's no seed data
 * to derive these from, list the companies you expect to see here — or
 * compute this dynamically from customersDB once you have real records.
 */
export const ALL_COMPANIES: string[] = [];
