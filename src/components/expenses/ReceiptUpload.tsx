"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { receiptsApi } from "@/lib/api/misc";

interface ReceiptRecord {
  id: string;
  image_url: string;
  extracted_text?: string | null;
  created_at?: string;
}

interface ReceiptUploadProps {
  expenseId: string;
  tripId: string;
  receipts?: ReceiptRecord[];
  onUploaded?: (receipt: ReceiptRecord) => void;
  onDeleted?: (receiptId: string) => void;
  showToast: (message: string, type: "success" | "error" | "info") => void;
}

export default function ReceiptUpload({
  expenseId,
  tripId,
  receipts = [],
  onUploaded,
  onDeleted,
  showToast,
}: ReceiptUploadProps) {
  const [items, setItems] = useState<ReceiptRecord[]>(receipts);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      showToast("Please upload an image file", "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast("Receipt image must be 5 MB or smaller", "error");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setUploading(true);

    try {
      const res = await receiptsApi.uploadReceipt(expenseId, tripId, file);

      if (res.error || !res.data?.receipt) {
        showToast(res.error || "Upload failed", "error");
      } else {
        const receipt = res.data.receipt;
        setItems(prev => [receipt, ...prev]);
        showToast(
          receipt.extracted_text
            ? "Receipt uploaded and scanned"
            : "Receipt uploaded",
          "success"
        );
        onUploaded?.(receipt);
      }
    } catch {
      showToast("Upload failed", "error");
    } finally {
      URL.revokeObjectURL(objectUrl);
      setPreview(null);
      setUploading(false);
    }
  };

  const handleDelete = async (receiptId: string) => {
    setDeletingId(receiptId);
    const res = await receiptsApi.deleteReceipt(tripId, receiptId);

    if (res.error) {
      showToast(res.error, "error");
    } else {
      setItems(prev => prev.filter(receipt => receipt.id !== receiptId));
      showToast("Receipt removed", "success");
      onDeleted?.(receiptId);
    }
    setDeletingId(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-3">
      {items.length > 0 && (
        <div className="space-y-2">
          {items.map(receipt => (
            <div
              key={receipt.id}
              className="rounded-xl border border-white/40 bg-white/50 p-2 flex items-center gap-3"
            >
              <a href={receipt.image_url} target="_blank" rel="noreferrer">
                <img
                  src={receipt.image_url}
                  alt="Receipt"
                  className="h-16 w-16 rounded-lg object-cover"
                />
              </a>
              <div className="flex-1 min-w-0">
                {receipt.extracted_text ? (
                  <details className="text-xs text-[#475569]">
                    <summary className="cursor-pointer font-semibold">
                      Scan details
                    </summary>
                    <pre className="mt-1 whitespace-pre-wrap break-words font-sans text-[11px] text-[#64748B]">
                      {receipt.extracted_text}
                    </pre>
                  </details>
                ) : (
                  <p className="text-xs text-[#94A3B8]">No scan text available</p>
                )}
                <p className="text-[11px] text-[#94A3B8] mt-1">
                  {receipt.created_at
                    ? new Date(receipt.created_at).toLocaleDateString()
                    : "Uploaded"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(receipt.id)}
                disabled={deletingId === receipt.id}
                className="rounded-lg px-2 py-1 text-xs font-semibold text-red-500 hover:bg-red-50 disabled:opacity-50"
              >
                {deletingId === receipt.id ? "Removing" : "Remove"}
              </button>
            </div>
          ))}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />

      <AnimatePresence mode="wait">
        {preview ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative rounded-2xl overflow-hidden border border-white/40"
          >
            <img src={preview} alt="Receipt preview" className="w-full h-48 object-cover" />
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
                <div className="h-8 w-8 rounded-full border-[3px] border-[#E2E8F0] border-t-brand-blue animate-spin" />
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-6 cursor-pointer transition-all duration-300 ${
              dragOver
                ? "border-brand-blue bg-brand-blue/5"
                : "border-[#CBD5E1] hover:border-brand-blue/50 hover:bg-white/30"
            }`}
          >
            <span className="text-2xl">🧾</span>
            <p className="text-sm text-[#64748B] text-center">
              Click or drag to upload receipt
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
