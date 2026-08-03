import { Customer } from "@/types/customer";

function escapeCsvField(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function exportCustomersToCsv(customers: Customer[], filename = "customers.csv") {
  const headers = ["Name", "Email", "Phone", "Company", "Status", "Last Contact", "Notes"];
  const rows = customers.map((c) => [
    c.name,
    c.email,
    c.phone,
    c.company,
    c.status,
    c.lastContactDate.slice(0, 10),
    c.notes,
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((field) => escapeCsvField(String(field ?? ""))).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
