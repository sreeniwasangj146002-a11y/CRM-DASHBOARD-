import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/** Exports tabular data (headers + string rows) to a downloadable PDF. */
export function exportRowsToPdf(
  title: string,
  headers: string[],
  rows: (string | number)[][],
  filename: string
) {
  const doc = new jsPDF({ orientation: rows.length && headers.length > 5 ? "landscape" : "portrait" });

  doc.setFontSize(14);
  doc.text(title, 14, 15);
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(new Date().toLocaleString(), 14, 21);

  autoTable(doc, {
    startY: 26,
    head: [headers],
    body: rows,
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [16, 185, 129] },
    theme: "striped",
  });

  doc.save(filename);
}
