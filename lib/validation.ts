import { z } from "zod";

export const customerFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name is too long"),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .regex(/^[+()\-.\s\d]{7,20}$/, "Enter a valid phone number")
    .or(z.literal("")),
  company: z.string().trim().max(80, "Company name is too long").or(z.literal("")),
  status: z.enum(["active", "inactive"]),
  lastContactDate: z.string().min(1, "Last contact date is required"),
  notes: z.string().max(1000, "Notes are too long").or(z.literal("")),
  photoUrl: z.string().optional().or(z.literal("")),
});

export type CustomerFormValues = z.infer<typeof customerFormSchema>;

export const dealFormSchema = z.object({
  title: z.string().trim().min(2, "Title must be at least 2 characters").max(120, "Title is too long"),
  customerId: z.string().min(1, "Select a customer"),
  value: z
    .number({ message: "Enter a valid amount" })
    .min(0, "Value must be 0 or more")
    .max(1_000_000_000, "Value is too large"),
  stage: z.enum(["lead", "qualified", "proposal", "negotiation", "won", "lost"]),
  owner: z.string().trim().max(80, "Owner name is too long").or(z.literal("")),
  expectedCloseDate: z.string().min(1, "Expected close date is required"),
  notes: z.string().max(1000, "Notes are too long").or(z.literal("")),
});

export type DealFormValues = z.infer<typeof dealFormSchema>;

export const taskFormSchema = z.object({
  title: z.string().trim().min(2, "Title must be at least 2 characters").max(120, "Title is too long"),
  description: z.string().max(1000, "Description is too long").or(z.literal("")),
  dueDate: z.string().min(1, "Due date is required"),
  priority: z.enum(["low", "medium", "high"]),
  status: z.enum(["todo", "in_progress", "done"]),
  relatedCustomerId: z.string().nullable(),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;

export const loginFormSchema = z.object({
  username: z.string().trim().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;
