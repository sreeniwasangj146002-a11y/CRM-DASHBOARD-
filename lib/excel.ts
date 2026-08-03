import * as XLSX from "xlsx";

/** Exports an array of plain row objects to an .xlsx file and triggers a download. */
export function exportRowsToExcel(
  rows: Record<string, string | number>[],
  filename: string,
  sheetName = "Sheet1"
) {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, filename);
}

/** Reads the first sheet of an uploaded .xlsx/.xls/.csv file into an array of row objects. */
export function readRowsFromExcel(file: File): Promise<Record<string, unknown>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read file."));
    reader.onload = () => {
      try {
        const data = reader.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const firstSheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[firstSheetName];
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
          defval: "",
        });
        resolve(rows);
      } catch (err) {
        reject(err instanceof Error ? err : new Error("Could not parse spreadsheet."));
      }
    };
    reader.readAsBinaryString(file);
  });
}
