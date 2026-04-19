"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import {
  Upload, Download, CheckCircle2, XCircle, AlertTriangle,
  FileSpreadsheet, Loader2, Eye, EyeOff, ChevronDown, ChevronUp,
  ArrowRight, Trash2, ImagePlus, X, Image as ImageIcon,
} from "lucide-react";
import { uploadAPI } from "@/lib/api";

// ─── CSV Template ──────────────────────────────────────────────────────────────
const CSV_HEADERS = [
  "Product Name", "Slug", "Description", "Price(NRP)", "Discount(%)",
  "Stock Quantity", "SKU", "Category", "Brand", "Vendor",
  "Product Images", "Featured Product", "New Arrival",
];

const CSV_SAMPLE_ROWS = [
  [
    "COSRX Snail Mucin Essence", "cosrx-snail-mucin-essence",
    "Hydrating essence with snail mucin for skin repair",
    "1800", "10", "50", "COSRX-SNAIL-100ML",
    "Beauty", "COSRX", "",
    "https://example.com/snail1.jpg", "false", "true",
  ],
  [
    "Wai Wai Instant Noodles", "waiwai-instant-noodles",
    "Popular instant noodles snack in Nepal",
    "20", "5", "500", "WAI-NOODLE-75",
    "Groceries", "Wai Wai", "",
    "https://example.com/waiwai.jpg", "true", "false",
  ],
];

function normalizeRow(raw: Record<string, string>): Record<string, string> {
  const clean: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw)) {
    clean[k.replace(/^\uFEFF/, "").trim()] = v;
  }
  const get = (...keys: string[]) => {
    for (const k of keys) {
      if (clean[k] !== undefined && clean[k] !== "") return clean[k];
    }
    return "";
  };
  const parseBool = (v: string) => (v.toLowerCase() === "true" || v.toUpperCase() === "TRUE" ? "true" : "false");
  return {
    name:               get("Product Name", "name"),
    slug:               get("Slug", "slug"),
    description:        get("Description", "description"),
    price:              get("Price(NRP)", "Price", "price"),
    discountPercentage: get("Discount(%)", "Discount", "discountPercentage"),
    stockQuantity:      get("Stock Quantity", "stockQuantity"),
    sku:                get("SKU", "sku"),
    category:           get("Category", "category", "categoryId"),
    brand:              get("Brand", "brand", "brandId"),
    vendor:             get("Vendor", "vendor", "vendorId"),
    imageUrls:          get("Product Images", "imageUrls", "images"),
    isFeatured:         parseBool(get("Featured Product", "isFeatured")),
    isBestSeller:       parseBool(get("isBestSeller")),
    isNew:              parseBool(get("New Arrival", "isNew")),
    tags:               get("tags"),
    ingredients:        get("ingredients"),
    benefits:           get("benefits"),
    howToUse:           get("howToUse"),
    compareAtPrice:     get("compareAtPrice"),
  };
}

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

function splitCSVLine(line: string): string[] {
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
  return values;
}

function parseCSV(text: string): Record<string, string>[] {
  const cleaned = text.replace(/^\uFEFF/, "").trim();
  const lines = cleaned.split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = splitCSVLine(lines[0]).map((h) => h.replace(/^"|"$/g, "").trim());
  return lines.slice(1).filter((l) => l.trim()).map((line) => {
    const values = splitCSVLine(line);
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = (values[i] ?? "").replace(/^"|"$/g, "").trim(); });
    return obj;
  });
}

function validateRow(row: Record<string, string>): string[] {
  const errs: string[] = [];
  if (!row.name?.trim()) errs.push("Product Name required");
  if (!row.slug?.trim()) errs.push("Slug required");
  if (!row.description?.trim()) errs.push("Description required");
  if (!row.sku?.trim()) errs.push("SKU required");
  if (!row.category?.trim()) errs.push("Category required (name or ID)");
  if (!row.price || isNaN(Number(row.price)) || Number(row.price) < 0) errs.push("valid Price required");
  if (row.stockQuantity && isNaN(Number(row.stockQuantity))) errs.push("Stock Quantity must be a number");
  if (row.discountPercentage && (isNaN(Number(row.discountPercentage)) || Number(row.discountPercentage) < 0 || Number(row.discountPercentage) > 100))
    errs.push("Discount must be 0–100");
  return errs;
}

type ParsedRow = Record<string, string> & { _errors: string[]; _index: number };
type UploadResult = { row: number; status: "success" | "failed"; name?: string; sku?: string; error?: string };

const STEPS = ["upload", "preview", "result"] as const;
type Step = typeof STEPS[number];

type Props = {
  onSubmit: (products: Record<string, string>[]) => Promise<{ success: number; failed: number; results: UploadResult[] }>;
};

// ─── Per-row image state ────────────────────────────────────────────────────────
type RowImageState = {
  uploading: boolean;
  urls: string[];           // uploaded + existing csv urls
  previews: string[];       // object URLs for local preview before upload
};

export default function BulkProductUpload({ onSubmit }: Props) {
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [step, setStep] = useState<Step>("upload");
  const [uploadResults, setUploadResults] = useState<{ success: number; failed: number; results: UploadResult[] } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  // image state keyed by row _index
  const [rowImages, setRowImages] = useState<Record<number, RowImageState>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  // hidden file inputs per row — keyed by row index
  const imageInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const initRowImage = useCallback((row: ParsedRow): RowImageState => ({
    uploading: false,
    urls: row.imageUrls ? row.imageUrls.split(",").map(s => s.trim()).filter(Boolean) : [],
    previews: [],
  }), []);

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
      const withValidation = parsed.map((row, i) => {
        const normalized = normalizeRow(row);
        return { ...normalized, _errors: validateRow(normalized), _index: i };
      }) as ParsedRow[];
      setRows(withValidation);
      // initialise image state for each row
      const imgs: Record<number, RowImageState> = {};
      withValidation.forEach(r => { imgs[r._index] = initRowImage(r); });
      setRowImages(imgs);
      setStep("preview");
    };
    reader.readAsText(file);
  }, [initRowImage]);

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

  // Upload images for a specific row
  const handleImageFiles = useCallback(async (rowIndex: number, files: FileList) => {
    const imageFiles = Array.from(files).filter(f => f.type.startsWith("image/"));
    if (!imageFiles.length) return;

    // Show local previews immediately
    const previews = imageFiles.map(f => URL.createObjectURL(f));
    setRowImages(prev => ({
      ...prev,
      [rowIndex]: { ...prev[rowIndex], uploading: true, previews: [...(prev[rowIndex]?.previews ?? []), ...previews] },
    }));

    try {
      const response = await uploadAPI.uploadImages(imageFiles);
      // backend returns array of { url } or single { urls: [] }
      const uploaded: string[] = Array.isArray(response.data)
        ? response.data.map((r: any) => r.url).filter(Boolean)
        : (response.data.urls ?? [response.data.url]).filter(Boolean);

      setRowImages(prev => ({
        ...prev,
        [rowIndex]: {
          uploading: false,
          previews: [],
          urls: [...(prev[rowIndex]?.urls ?? []), ...uploaded],
        },
      }));

      // Update the actual row's imageUrls field so it gets submitted
      setRows(prev => prev.map(r => {
        if (r._index !== rowIndex) return r;
        const existing = prev.find(x => x._index === rowIndex);
        const allUrls = [
          ...(existing?.imageUrls ? existing.imageUrls.split(",").map(s => s.trim()).filter(Boolean) : []),
          ...uploaded,
        ];
        return { ...r, imageUrls: allUrls.join(",") };
      }));

      // Revoke local preview object URLs
      previews.forEach(p => URL.revokeObjectURL(p));
    } catch {
      setRowImages(prev => ({
        ...prev,
        [rowIndex]: { ...prev[rowIndex], uploading: false, previews: [] },
      }));
      previews.forEach(p => URL.revokeObjectURL(p));
      alert("Image upload failed. Please try again.");
    }
  }, []);

  const removeImage = useCallback((rowIndex: number, urlToRemove: string) => {
    setRowImages(prev => ({
      ...prev,
      [rowIndex]: { ...prev[rowIndex], urls: prev[rowIndex].urls.filter(u => u !== urlToRemove) },
    }));
    setRows(prev => prev.map(r => {
      if (r._index !== rowIndex) return r;
      const remaining = r.imageUrls
        ? r.imageUrls.split(",").map(s => s.trim()).filter(u => u && u !== urlToRemove)
        : [];
      return { ...r, imageUrls: remaining.join(",") };
    }));
  }, []);

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
    setRowImages({});
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeRow = (index: number) => {
    setRows((prev) => prev.filter((r) => r._index !== index));
    setRowImages(prev => { const next = { ...prev }; delete next[index]; return next; });
  };

  const toggleRow = (index: number) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index); else next.add(index);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
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

      {/* STEP 1: Upload */}
      {step === "upload" && (
        <div className="space-y-4">
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

          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">
            <p className="mb-2 flex items-center gap-2 font-bold"><AlertTriangle className="h-4 w-4" /> Before uploading:</p>
            <ul className="space-y-1 pl-6 text-xs list-disc">
              <li><strong>Category</strong> — exact category name (e.g. <code className="rounded bg-amber-100 px-1">Beauty</code>) or MongoDB ObjectId.</li>
              <li><strong>Brand</strong> — brand name or leave blank.</li>
              <li><strong>Vendor</strong> — vendor&apos;s email address or leave blank.</li>
              <li>SKU and Slug must be unique across all products.</li>
              <li>Boolean fields (<strong>Featured Product</strong>, <strong>New Arrival</strong>): <code className="rounded bg-amber-100 px-1">true</code> or <code className="rounded bg-amber-100 px-1">false</code>.</li>
              <li><strong>Product Images</strong>: leave blank — you can upload images directly after importing the CSV.</li>
            </ul>
          </div>

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

      {/* STEP 2: Preview */}
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

          {/* File name + controls */}
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
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Category</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Images</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Issues</th>
                      <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-500"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {rows.map((row) => {
                      const isExpanded = expandedRows.has(row._index);
                      const hasErrors = row._errors.length > 0;
                      const imgState = rowImages[row._index];
                      const imageCount = imgState?.urls.length ?? 0;
                      const isUploadingImg = imgState?.uploading ?? false;

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
                            <td className="px-4 py-3 text-xs text-gray-600 max-w-[120px] truncate">{row.category || "—"}</td>

                            {/* Images cell */}
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5">
                                {/* Thumbnail strip */}
                                {imgState?.previews.map((p, pi) => (
                                  <div key={pi} className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 animate-pulse">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={p} alt="" className="h-full w-full object-cover opacity-50" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <Loader2 className="h-3 w-3 animate-spin text-primary-500" />
                                    </div>
                                  </div>
                                ))}
                                {imgState?.urls.slice(0, 3).map((url, ui) => (
                                  <div key={ui} className="group relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={url} alt="" className="h-full w-full object-cover" />
                                    <button
                                      type="button"
                                      onClick={() => removeImage(row._index, url)}
                                      className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <X className="h-3 w-3 text-white" />
                                    </button>
                                  </div>
                                ))}
                                {imageCount > 3 && (
                                  <span className="text-[10px] font-bold text-gray-400">+{imageCount - 3}</span>
                                )}

                                {/* Upload button */}
                                <button
                                  type="button"
                                  disabled={isUploadingImg}
                                  onClick={() => imageInputRefs.current[row._index]?.click()}
                                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-gray-200 text-gray-400 hover:border-primary-400 hover:text-primary-500 transition-colors disabled:opacity-40"
                                  title="Upload images for this product"
                                >
                                  {isUploadingImg
                                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    : <ImagePlus className="h-3.5 w-3.5" />
                                  }
                                </button>
                                <input
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  className="hidden"
                                  ref={el => { imageInputRefs.current[row._index] = el; }}
                                  onChange={e => { if (e.target.files?.length) handleImageFiles(row._index, e.target.files); e.target.value = ""; }}
                                />
                              </div>
                            </td>

                            <td className="px-4 py-3 text-xs text-red-600 max-w-[160px]">{hasErrors ? row._errors.join("; ") : "—"}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => toggleRow(row._index)}
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

                          {/* Expanded detail + full image panel */}
                          {isExpanded && (
                            <tr key={`${row._index}-expanded`} className="bg-gray-50/80">
                              <td colSpan={10} className="px-4 pb-4 pt-2">
                                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs sm:grid-cols-3 lg:grid-cols-4 mb-4">
                                  {(["name","slug","sku","price","discountPercentage","stockQuantity","category","brand","vendor","isFeatured","isNew"] as const).map((h) => (
                                    <div key={h}>
                                      <span className="font-semibold text-gray-500">{h}: </span>
                                      <span className="text-secondary-700 break-all">{row[h] || <em className="text-gray-300">empty</em>}</span>
                                    </div>
                                  ))}
                                </div>

                                {/* Image upload panel */}
                                <div className="rounded-xl border border-gray-200 bg-white p-3">
                                  <p className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                                    <ImageIcon className="h-3.5 w-3.5 text-primary-500" />
                                    Product Images ({imageCount})
                                  </p>

                                  <div className="flex flex-wrap gap-2">
                                    {/* Uploaded images */}
                                    {imgState?.urls.map((url, ui) => (
                                      <div key={ui} className="group relative h-20 w-20 overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={url} alt="" className="h-full w-full object-cover" />
                                        <button
                                          type="button"
                                          onClick={() => removeImage(row._index, url)}
                                          className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow"
                                        >
                                          <X className="h-3 w-3" />
                                        </button>
                                        {ui === 0 && (
                                          <span className="absolute bottom-0 inset-x-0 bg-black/50 text-[9px] text-white text-center py-0.5 font-bold">MAIN</span>
                                        )}
                                      </div>
                                    ))}

                                    {/* Uploading previews */}
                                    {imgState?.previews.map((p, pi) => (
                                      <div key={`p-${pi}`} className="relative h-20 w-20 overflow-hidden rounded-xl border border-primary-200 bg-primary-50">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={p} alt="" className="h-full w-full object-cover opacity-40" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                          <Loader2 className="h-5 w-5 animate-spin text-primary-500" />
                                        </div>
                                      </div>
                                    ))}

                                    {/* Add more button */}
                                    <button
                                      type="button"
                                      disabled={isUploadingImg}
                                      onClick={() => imageInputRefs.current[row._index]?.click()}
                                      className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-primary-400 hover:bg-primary-50 hover:text-primary-500 transition-all disabled:opacity-40"
                                    >
                                      <ImagePlus className="h-5 w-5" />
                                      <span className="text-[10px] font-semibold">Add Photos</span>
                                    </button>
                                  </div>

                                  {imageCount === 0 && (
                                    <p className="mt-2 text-[10px] text-gray-400">
                                      No images yet. Click "Add Photos" or the <ImagePlus className="inline h-3 w-3" /> button in the row above.
                                    </p>
                                  )}
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

      {/* STEP 3: Result */}
      {step === "result" && uploadResults && (
        <div className="space-y-4">
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
