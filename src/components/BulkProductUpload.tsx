"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import {
  Upload, Download, CheckCircle2, XCircle, AlertTriangle,
  FileSpreadsheet, Loader2, Eye, EyeOff, ChevronDown, ChevronUp,
  ArrowRight, Trash2,
} from "lucide-react";

// ─── CSV Template ──────────────────────────────────────────────────────────────
const CSV_HEADERS = [
  "name", "slug", "description", "price", "compareAtPrice",
  "sku", "stockQuantity", "categoryId", "brandId", "vendorId",
  "ingredients", "benefits", "howToUse",
  "isFeatured", "isBestSeller", "isNew", "tags", "imageUrls",
];

const CSV_SAMPLE_ROWS = [
  [
    "Vitamin C Serum", "vitamin-c-serum", "Brightening serum with 20% Vitamin C",
    "1500", "2000", "VC-SERUM-001", "50",
    "CATEGORY_OBJECT_ID_HERE", "BRAND_OBJECT_ID_HERE", "VENDOR_OBJECT_ID_HERE",
    "Vitamin C Ascorbic Acid", "Brightens skin tone", "Apply 2-3 drops morning",
    "false", "true", "false", "serum,vitamin-c,brightening", "https://image-url-1.jpg,https://image-url-2.jpg",
  ],
  [
    "Hyaluronic Acid Moisturizer", "ha-moisturizer", "Deep hydration moisturizer with HA",
    "1200", "", "HA-MOIST-001", "30",
    "CATEGORY_OBJECT_ID_HERE", "", "VENDOR_OBJECT_ID_HERE",
    "Hyaluronic Acid", "Intense hydration", "Apply on damp skin",
    "false", "false", "true", "moisturizer,hyaluronic", "https://image-url-3.jpg",
  ],
];

function generateCSVTemplate(): string {
  const rows = [CSV_HEADERS, ...CSV_SAMPLE_ROWS];
  return rows.map((r) => r.map((cell) => `"${cell}"`).join(",")).join("\n");
}

function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

// ─── CSV Parser ────────────────────────────────────────────────────────────────
function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.replace(/^"|"$/g, "").trim());
  return lines.slice(1).map((line) => {
    // Handle quoted fields with commas inside
    const values: string[] = [];
    let inQuotes = false;
    let current = "";
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = values[i] ?? ""; });
    return obj;
  });
}

// ─── Row Validator ─────────────────────────────────────────────────────────────
function validateRow(row: Record<string, string>): string[] {
  const errs: string[] = [];
  if (!row.name?.trim()) errs.push("name required");
  if (!row.slug?.trim()) errs.push("slug required");
  if (!row.description?.trim()) errs.push("description required");
  if (!row.sku?.trim()) errs.push("sku required");
  if (!row.categoryId?.trim() || row.categoryId === "CATEGORY_OBJECT_ID_HERE") errs.push("valid categoryId required");
  if (!row.price || isNaN(Number(row.price)) || Number(row.price) < 0) errs.push("valid price required");
  if (row.stockQuantity && isNaN(Number(row.stockQuantity))) errs.push("stockQuantity must be a number");
  // vendorId is optional, imageUrls is optional
  return errs;
}

// ─── Types ─────────────────────────────────────────────────────────────────────
type ParsedRow = Record<string, string> & { _errors: string[]; _index: number };
type UploadResult = { row: number; status: "success" | "failed"; name?: string; sku?: string; error?: string };

const STEPS = ["upload", "preview", "result"] as const;
type Step = typeof STEPS[number];

type Props = {
  onSubmit: (products: Record<string, string>[]) => Promise<{ success: number; failed: number; results: UploadResult[] }>;
};

// ─── Main Component ────────────────────────────────────────────────────────────
export default function BulkProductUpload({ onSubmit }: Props) {
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [step, setStep] = useState<Step>("upload");
  const [uploadResults, setUploadResults] = useState<{ success: number; failed: number; results: UploadResult[] } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.name.endsWith(".csv")) {
      alert("Please upload a CSV file.");
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseCSV(text);
      const withValidation = parsed.map((row, i) => ({
        ...row,
        _errors: validateRow(row),
        _index: i,
      })) as ParsedRow[];
      setRows(withValidation);
      setStep("preview");
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const { validRows, invalidRows } = useMemo(
    () => rows.reduce<{ validRows: ParsedRow[]; invalidRows: ParsedRow[] }>(
      (acc, r) => {
        (r._errors.length === 0 ? acc.validRows : acc.invalidRows).push(r);
        return acc;
      },
      { validRows: [], invalidRows: [] }
    ),
    [rows]
  );

  const handleSubmit = async () => {
    if (validRows.length === 0) return;
    setIsUploading(true);
    try {
      const payload = validRows.map(({ _errors, _index, ...rest }) => rest);
      const result = await onSubmit(payload);
      setUploadResults(result);
      setStep("result");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const reset = () => {
    setRows([]);
    setFileName("");
    setStep("upload");
    setUploadResults(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeRow = (index: number) => {
    setRows((prev) => prev.filter((r) => r._index !== index));
  };

  return (
    <div className="space-y-6">
      {/* ─── Step Indicator ─── */}
      <div className="flex items-center gap-3">
        {STEPS.map((s, i) => {
          const currentIdx = STEPS.indexOf(step);
          const done = currentIdx > i;
          return (
            <div key={s} className="flex items-center gap-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-all ${
                step === s ? "bg-primary-600 text-white shadow-md" :
                done ? "bg-emerald-500 text-white" :
                "bg-gray-100 text-gray-400"
              }`}>
                {done ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
              </div>
              <span className={`text-sm font-semibold capitalize hidden sm:block ${step === s ? "text-secondary-900" : "text-gray-400"}`}>{s}</span>
              {i < 2 && <div className="h-px w-8 bg-gray-200 sm:w-12" />}
            </div>
          );
        })}
      </div>

      {/* ─── STEP 1: Upload ─── */}
      {step === "upload" && (
        <div className="space-y-4">
          {/* Template download */}
          <div className="flex items-center justify-between rounded-2xl border border-blue-100 bg-blue-50 p-4">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm font-bold text-blue-900">Download CSV Template</p>
                <p className="text-xs text-blue-600">Fill in the template and upload it back.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => downloadCSV(generateCSVTemplate(), "glovia-products-template.csv")}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow transition hover:bg-blue-700"
            >
              <Download className="h-4 w-4" /> Template
            </button>
          </div>

          {/* Important notes */}
          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">
            <p className="mb-2 flex items-center gap-2 font-bold"><AlertTriangle className="h-4 w-4" /> Before uploading:</p>
            <ul className="space-y-1 pl-6 text-xs list-disc">
              <li>Replace <code className="rounded bg-amber-100 px-1">CATEGORY_OBJECT_ID_HERE</code> with real MongoDB category IDs from your database.</li>
              <li>Replace <code className="rounded bg-amber-100 px-1">BRAND_OBJECT_ID_HERE</code> with real brand IDs (or leave blank if no brand).</li>
              <li>SKU and slug must be unique across all products.</li>
              <li>Boolean fields: use <code className="rounded bg-amber-100 px-1">true</code> or <code className="rounded bg-amber-100 px-1">false</code>.</li>
              <li>Tags: comma-separated values within the cell (e.g. serum,vitamin-c).</li>
            </ul>
          </div>

          {/* Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onClick={() => fileInputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed p-12 text-center transition-all ${
              isDragging
                ? "border-primary-500 bg-primary-50 scale-[1.01]"
                : "border-gray-200 bg-gray-50 hover:border-primary-400 hover:bg-primary-50/50"
            }`}
          >
            <Upload className={`h-12 w-12 mb-4 transition-colors ${isDragging ? "text-primary-600" : "text-gray-300"}`} />
            <p className="text-base font-bold text-secondary-900">Drop your CSV file here</p>
            <p className="mt-1 text-sm text-gray-500">or click to browse files</p>
            <p className="mt-3 rounded-full bg-white border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-500">
              .csv files only
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
          </div>
        </div>
      )}

      {/* ─── STEP 2: Preview ─── */}
      {step === "preview" && (
        <div className="space-y-4">
          {/* Summary bar */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-gray-100 bg-white p-4 text-center shadow-sm">
              <p className="text-2xl font-black text-secondary-900">{rows.length}</p>
              <p className="text-xs font-semibold text-gray-500 mt-0.5">Total Rows</p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-center">
              <p className="text-2xl font-black text-emerald-700">{validRows.length}</p>
              <p className="text-xs font-semibold text-emerald-600 mt-0.5">Valid</p>
            </div>
            <div className={`rounded-2xl border p-4 text-center ${invalidRows.length > 0 ? "border-red-100 bg-red-50" : "border-gray-100 bg-white"}`}>
              <p className={`text-2xl font-black ${invalidRows.length > 0 ? "text-red-700" : "text-gray-300"}`}>{invalidRows.length}</p>
              <p className={`text-xs font-semibold mt-0.5 ${invalidRows.length > 0 ? "text-red-500" : "text-gray-400"}`}>Errors</p>
            </div>
          </div>

          {/* File name + reset */}
          <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-primary-500" />
              <span className="text-sm font-semibold text-secondary-800">{fileName}</span>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setShowPreview(!showPreview)} className="text-xs font-semibold text-gray-500 hover:text-primary-600 flex items-center gap-1">
                {showPreview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                {showPreview ? "Hide" : "Show"} preview
              </button>
              <button type="button" onClick={reset} className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-700">
                <Trash2 className="h-3.5 w-3.5" /> Change file
              </button>
            </div>
          </div>

          {/* Preview table */}
          {showPreview && (
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-max text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Row</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">SKU</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Price</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Stock</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Issues</th>
                      <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-500"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {rows.map((row) => {
                      const isExpanded = expandedRows.has(row._index);
                      const hasErrors = row._errors.length > 0;
                      return (
                        <>
                          <tr key={row._index} className={`transition-colors ${hasErrors ? "bg-red-50/60" : "hover:bg-gray-50/60"}`}>
                            <td className="px-4 py-3 text-xs font-mono text-gray-400">#{row._index + 1}</td>
                            <td className="px-4 py-3">
                              {hasErrors ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
                                  <XCircle className="h-3 w-3" /> Error
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                                  <CheckCircle2 className="h-3 w-3" /> Ready
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 font-medium text-secondary-800 max-w-[160px] truncate">{row.name || "—"}</td>
                            <td className="px-4 py-3 font-mono text-xs text-gray-600">{row.sku || "—"}</td>
                            <td className="px-4 py-3 text-secondary-700">NPR {row.price || "—"}</td>
                            <td className="px-4 py-3 text-secondary-700">{row.stockQuantity || "0"}</td>
                            <td className="px-4 py-3 text-xs text-red-600">{hasErrors ? row._errors.join("; ") : "—"}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => setExpandedRows(prev => {
                                    const next = new Set(prev);
                                    if (next.has(row._index)) {
                                      next.delete(row._index);
                                    } else {
                                      next.add(row._index);
                                    }
                                    return next;
                                  })}
                                  className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"
                                >
                                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeRow(row._index)}
                                  className="rounded-lg p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr key={`${row._index}-expanded`} className="bg-gray-50/80">
                              <td colSpan={8} className="px-4 pb-3 pt-1">
                                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs sm:grid-cols-3 lg:grid-cols-4">
                                  {CSV_HEADERS.map((h) => (
                                    <div key={h}>
                                      <span className="font-semibold text-gray-500">{h}: </span>
                                      <span className="text-secondary-700 break-all">{row[h] || <em className="text-gray-300">empty</em>}</span>
                                    </div>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button type="button" onClick={reset} className="btn-outline rounded-xl px-5 py-2.5 text-sm">
              ← Back
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={validRows.length === 0 || isUploading}
              className="btn-primary flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm disabled:opacity-50"
            >
              {isUploading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Uploading {validRows.length} products…</>
              ) : (
                <><Upload className="h-4 w-4" /> Upload {validRows.length} valid product{validRows.length !== 1 ? "s" : ""} <ArrowRight className="h-4 w-4" /></>
              )}
            </button>
            {invalidRows.length > 0 && (
              <p className="text-xs text-red-600 font-medium">
                {invalidRows.length} row{invalidRows.length !== 1 ? "s" : ""} with errors will be skipped.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ─── STEP 3: Result ─── */}
      {step === "result" && uploadResults && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center">
              <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500 mb-2" />
              <p className="text-3xl font-black text-emerald-700">{uploadResults.success}</p>
              <p className="text-sm font-semibold text-emerald-600">Uploaded</p>
            </div>
            <div className={`rounded-2xl border p-5 text-center ${uploadResults.failed > 0 ? "border-red-100 bg-red-50" : "border-gray-100 bg-white"}`}>
              <XCircle className={`mx-auto h-8 w-8 mb-2 ${uploadResults.failed > 0 ? "text-red-500" : "text-gray-300"}`} />
              <p className={`text-3xl font-black ${uploadResults.failed > 0 ? "text-red-700" : "text-gray-300"}`}>{uploadResults.failed}</p>
              <p className={`text-sm font-semibold ${uploadResults.failed > 0 ? "text-red-500" : "text-gray-400"}`}>Failed</p>
            </div>
            <div className="col-span-2 sm:col-span-1 rounded-2xl border border-gray-100 bg-white p-5 text-center shadow-sm">
              <p className="text-3xl font-black text-secondary-900">{uploadResults.success + uploadResults.failed}</p>
              <p className="text-sm font-semibold text-gray-500">Total Processed</p>
            </div>
          </div>

          {/* Result rows */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 bg-gray-50 px-4 py-3">
              <p className="text-sm font-bold text-secondary-900">Upload Results</p>
            </div>
            <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
              {uploadResults.results.map((r) => (
                <div key={r.row} className={`flex items-center gap-3 px-4 py-3 ${r.status === "failed" ? "bg-red-50/40" : ""}`}>
                  {r.status === "success" ? (
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-500" />
                  ) : (
                    <XCircle className="h-4 w-4 flex-shrink-0 text-red-500" />
                  )}
                  <span className="text-xs font-mono text-gray-400 w-8">#{r.row}</span>
                  <span className="flex-1 text-sm font-medium text-secondary-800 truncate">
                    {r.name || "Unknown"} <span className="text-gray-400 font-normal">({r.sku})</span>
                  </span>
                  {r.status === "failed" && (
                    <span className="text-xs text-red-600 font-medium">{r.error}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button type="button" onClick={reset} className="btn-primary rounded-xl px-6 py-2.5 text-sm">
              Upload More Products
            </button>
            {uploadResults.failed > 0 && (
              <button
                type="button"
                onClick={() => downloadCSV(
                  [CSV_HEADERS.join(","), ...uploadResults.results.filter(r => r.status === "failed").map(r => `"${r.name}","${r.sku}","${r.error}"`)].join("\n"),
                  "failed-products.csv"
                )}
                className="btn-outline rounded-xl px-5 py-2.5 text-sm flex items-center gap-2"
              >
                <Download className="h-4 w-4" /> Export Failed Rows
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
