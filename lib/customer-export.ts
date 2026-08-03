import { Customer, CustomerInput } from "@/types/customer";
import { exportRowsToExcel, readRowsFromExcel } from "@/lib/excel";
import { exportRowsToPdf } from "@/lib/pdf-export";

const HEADERS = ["Name", "Email", "Phone", "Company", "Status", "Last Contact", "Notes"];

function toRow(c: Customer) {
  return {
    Name: c.name,
    Email: c.email,
    Phone: c.phone,
    Company: c.company,
    Status: c.status,
    "Last Contact": c.lastContactDate.slice(0, 10),
    Notes: c.notes,
  };
}

export function exportCustomersToExcel(customers: Customer[], filename = "customers.xlsx") {
  exportRowsToExcel(customers.map(toRow), filename, "Customers");
}

export function exportCustomersToPdf(customers: Customer[], filename = "customers.pdf") {
  const rows = customers.map((c) => [
    c.name,
    c.email,
    c.phone || "—",
    c.company || "—",
    c.status,
    c.lastContactDate.slice(0, 10),
  ]);
  exportRowsToPdf("Customers", HEADERS.slice(0, 6), rows, filename);
}

/** Parses an uploaded spreadsheet into customer input payloads, tolerant of common header casings. */
export async function importCustomersFromExcel(file: File): Promise<CustomerInput[]> {
  const rows = await readRowsFromExcel(file);
  const pick = (row: Record<string, unknown>, keys: string[]) => {
    for (const key of Object.keys(row)) {
      if (keys.includes(key.trim().toLowerCase())) {
        const v = row[key];
        return v === undefined || v === null ? "" : String(v).trim();
      }
    }
    return "";
  };

  const results: CustomerInput[] = [];
  for (const row of rows) {
    const name = pick(row, ["name", "full name", "customer name"]);
    const email = pick(row, ["email", "email address"]);
    if (!name || !email) continue; // skip incomplete rows

    const statusRaw = pick(row, ["status"]).toLowerCase();
    results.push({
      name,
      email,
      phone: pick(row, ["phone", "phone number"]),
      company: pick(row, ["company", "company name"]),
      status: statusRaw === "inactive" ? "inactive" : "active",
      lastContactDate: pick(row, ["last contact", "lastcontactdate", "last contact date"]) || new Date().toISOString(),
      notes: pick(row, ["notes"]),
      photoUrl: "",
    });
  }
  return results;
}
