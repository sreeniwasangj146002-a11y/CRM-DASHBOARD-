"use client";

import { useRef } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { importCustomersFromExcel } from "@/lib/customer-export";
import { useBulkImportCustomers } from "@/hooks/use-customer-mutations";

export function ImportExcelButton() {
  const inputRef = useRef<HTMLInputElement>(null);
  const bulkImport = useBulkImportCustomers();

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const rows = await importCustomersFromExcel(file);
      if (rows.length === 0) {
        toast.error("No valid rows found. Make sure the sheet has Name and Email columns.");
        return;
      }
      bulkImport.mutate(rows);
    } catch {
      toast.error("Could not read that file. Please upload a valid .xlsx/.csv file.");
    }
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={() => inputRef.current?.click()}
        disabled={bulkImport.isPending}
      >
        <Upload className="h-4 w-4" />
        {bulkImport.isPending ? "Importing..." : "Import Excel"}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleFile}
        className="hidden"
      />
    </>
  );
}
