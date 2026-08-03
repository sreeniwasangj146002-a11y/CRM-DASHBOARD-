import { Customer, CustomerDoc } from "@/types/customer";
import { Deal, DealDoc } from "@/types/deal";
import { Task, TaskDoc } from "@/types/task";

/** Strips MongoDB's internal `_id` field, returning the public `Customer` shape. */
export function serializeCustomer(doc: CustomerDoc & { _id?: unknown }): Customer {
  return {
    id: doc.id,
    name: doc.name,
    email: doc.email,
    phone: doc.phone,
    company: doc.company,
    status: doc.status,
    lastContactDate: doc.lastContactDate,
    notes: doc.notes,
    createdAt: doc.createdAt,
    photoUrl: doc.photoUrl ?? "",
  };
}

/** Strips MongoDB's internal `_id` field, returning the public `Deal` shape. */
export function serializeDeal(doc: DealDoc & { _id?: unknown }): Deal {
  return {
    id: doc.id,
    title: doc.title,
    customerId: doc.customerId,
    customerName: doc.customerName,
    company: doc.company,
    value: doc.value,
    stage: doc.stage,
    owner: doc.owner,
    expectedCloseDate: doc.expectedCloseDate,
    notes: doc.notes,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

/** Strips MongoDB's internal `_id` field, returning the public `Task` shape. */
export function serializeTask(doc: TaskDoc & { _id?: unknown }): Task {
  return {
    id: doc.id,
    title: doc.title,
    description: doc.description,
    dueDate: doc.dueDate,
    priority: doc.priority,
    status: doc.status,
    relatedCustomerId: doc.relatedCustomerId,
    relatedCustomerName: doc.relatedCustomerName,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}
