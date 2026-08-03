"use client";

import { Download, FileSpreadsheet, FileText, FileType } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Customer } from "@/types/customer";
import { exportCustomersToCsv } from "@/lib/csv-export";
import { exportCustomersToExcel, exportCustomersToPdf } from "@/lib/customer-export";

interface ExportMenuProps {
  customers: Customer[];
  disabled?: boolean;
}

export function ExportMenu({ customers, disabled }: ExportMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={disabled}>
          <Download className="h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => exportCustomersToCsv(customers)}>
          <FileText className="h-4 w-4" /> Export CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => exportCustomersToExcel(customers)}>
          <FileSpreadsheet className="h-4 w-4" /> Export Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => exportCustomersToPdf(customers)}>
          <FileType className="h-4 w-4" /> Export PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
