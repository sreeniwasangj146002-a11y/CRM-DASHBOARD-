import {
  Customer,
  CustomerInput,
  CustomerListParams,
  PaginatedResponse,
} from "@/types/customer";
import { Deal, DealInput } from "@/types/deal";
import { Task, TaskInput } from "@/types/task";

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function parseOrThrow(res: Response) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new ApiError(body.message ?? "Request failed", res.status);
  }
  return res.json();
}

function buildQuery(params: CustomerListParams): string {
  const qs = new URLSearchParams();
  if (params.search) qs.set("search", params.search);
  params.status?.forEach((s) => qs.append("status", s));
  params.companies?.forEach((c) => qs.append("company", c));
  if (params.dateFrom) qs.set("dateFrom", params.dateFrom);
  if (params.dateTo) qs.set("dateTo", params.dateTo);
  if (params.phone) qs.set("phone", params.phone);
  if (params.email) qs.set("email", params.email);
  if (params.sortField) qs.set("sortField", params.sortField);
  if (params.sortDirection) qs.set("sortDirection", params.sortDirection);
  qs.set("page", String(params.page ?? 1));
  qs.set("pageSize", String(params.pageSize ?? 10));
  return qs.toString();
}

export const api = {
  async listCustomers(
    params: CustomerListParams
  ): Promise<PaginatedResponse<Customer>> {
    const res = await fetch(`/api/customers?${buildQuery(params)}`);
    return parseOrThrow(res);
  },

  /** Lightweight lookup list (all customers, sorted by name) for select dropdowns. */
  async listCustomersForLookup(): Promise<Customer[]> {
    const res = await fetch(
      `/api/customers?${buildQuery({
        sortField: "name",
        sortDirection: "asc",
        page: 1,
        pageSize: 500,
      })}`
    );
    const data: PaginatedResponse<Customer> = await parseOrThrow(res);
    return data.data;
  },

  async getCustomer(id: string): Promise<Customer> {
    const res = await fetch(`/api/customers/${id}`);
    return parseOrThrow(res);
  },

  async createCustomer(input: CustomerInput): Promise<Customer> {
    const res = await fetch(`/api/customers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    return parseOrThrow(res);
  },

  async updateCustomer(id: string, input: Partial<CustomerInput>): Promise<Customer> {
    const res = await fetch(`/api/customers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    return parseOrThrow(res);
  },

  async deleteCustomer(id: string): Promise<Customer> {
    const res = await fetch(`/api/customers/${id}`, { method: "DELETE" });
    return parseOrThrow(res);
  },
};

export const dealsApi = {
  async listDeals(params: { stage?: string[]; search?: string } = {}): Promise<Deal[]> {
    const qs = new URLSearchParams();
    params.stage?.forEach((s) => qs.append("stage", s));
    if (params.search) qs.set("search", params.search);
    const res = await fetch(`/api/deals?${qs.toString()}`);
    const body: { data: Deal[] } = await parseOrThrow(res);
    return body.data;
  },

  async createDeal(input: DealInput): Promise<Deal> {
    const res = await fetch(`/api/deals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    return parseOrThrow(res);
  },

  async updateDeal(id: string, input: Partial<DealInput>): Promise<Deal> {
    const res = await fetch(`/api/deals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    return parseOrThrow(res);
  },

  async deleteDeal(id: string): Promise<Deal> {
    const res = await fetch(`/api/deals/${id}`, { method: "DELETE" });
    return parseOrThrow(res);
  },
};

export const tasksApi = {
  async listTasks(params: { status?: string[]; search?: string } = {}): Promise<Task[]> {
    const qs = new URLSearchParams();
    params.status?.forEach((s) => qs.append("status", s));
    if (params.search) qs.set("search", params.search);
    const res = await fetch(`/api/tasks?${qs.toString()}`);
    const body: { data: Task[] } = await parseOrThrow(res);
    return body.data;
  },

  async createTask(input: TaskInput): Promise<Task> {
    const res = await fetch(`/api/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    return parseOrThrow(res);
  },

  async updateTask(id: string, input: Partial<TaskInput>): Promise<Task> {
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    return parseOrThrow(res);
  },

  async deleteTask(id: string): Promise<Task> {
    const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    return parseOrThrow(res);
  },
};

export { ApiError };
