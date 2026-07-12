"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ReceiptUploadProps {
  expenseId: string;
  tripId: string;
  onUploaded?: (receipt: any) => void;
  onDeleted?: (receiptId: string) => void;
  showToast: (message: string, type: "success" | "error" | "info") => void;
}

export default function ReceiptUpload({
  expenseId,
  tripId,
  onUploaded,
  onDeleted,
  showToast,
}: ReceiptUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      showToast("Please upload an image file", "error");
      return;
    }

    setPreview(URL.createObjectURL(file));
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("expenseId", expenseId);
      formData.append("tripId", tripId);

      const res = await fetch("/api/receipts", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || "Upload failed", "error");
        setPreview(null);
      } else {
        showToast("Receipt uploaded!", "success");
        onUploaded?.(data.receipt);
      }
    } catch {
      showToast("Upload failed", "error");
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
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
            <img
              src={preview}
              alt="Receipt preview"
              className="w-full h-48 object-cover"
            />
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
                <div className="h-8 w-8 rounded-full border-[3px] border-[#E2E8F0] border-t-brand-blue animate-spin" />
              </div>
            )}
            {!uploading && (
              <button
                onClick={() => {
                  setPreview(null);
                  onDeleted?.(expenseId);
                }}
                className="absolute top-2 right-2 h-7 w-7 rounded-full bg-slate-900/50 text-white flex items-center justify-center text-sm hover:bg-slate-900/70 transition-colors"
              >
                ✕
              </button>
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
