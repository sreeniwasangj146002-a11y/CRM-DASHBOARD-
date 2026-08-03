export type TaskPriority = "low" | "medium" | "high";
export type TaskStatus = "todo" | "in_progress" | "done";

export const TASK_STATUSES: TaskStatus[] = ["todo", "in_progress", "done"];

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
};

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string; // ISO date
  priority: TaskPriority;
  status: TaskStatus;
  relatedCustomerId: string | null;
  relatedCustomerName: string;
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
}

export type TaskDoc = Task;

/** Payload for creating/editing a task via the form. */
export interface TaskInput {
  title: string;
  description: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  relatedCustomerId: string | null;
}
