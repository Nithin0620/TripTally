"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Expense } from "@/types";
import NeuInput from "@/components/ui/NeuInput";

interface ExpenseSearchFilterProps {
  expenses: Expense[];
  onFilter: (filtered: Expense[]) => void;
}

const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "general", label: "General" },
  { value: "food", label: "Food" },
  { value: "accommodation", label: "Accommodation" },
  { value: "transport", label: "Transport" },
  { value: "activities", label: "Activities" },
  { value: "shopping", label: "Shopping" },
];

const SORT_OPTIONS = [
  { value: "date-desc", label: "Newest First" },
  { value: "date-asc", label: "Oldest First" },
  { value: "amount-desc", label: "Highest Amount" },
  { value: "amount-asc", label: "Lowest Amount" },
  { value: "name-asc", label: "Name A-Z" },
];

export default function ExpenseSearchFilter({
  expenses,
  onFilter,
}: ExpenseSearchFilterProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useMemo(() => {
    let filtered = [...expenses];

    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.category?.toLowerCase().includes(q) ||
          e.paidByUser?.name?.toLowerCase().includes(q)
      );
    }

    if (category !== "all") {
      filtered = filtered.filter((e) => e.category === category);
    }

    if (minAmount) {
      filtered = filtered.filter(
        (e) => e.amount >= parseFloat(minAmount)
      );
    }

    if (maxAmount) {
      filtered = filtered.filter(
        (e) => e.amount <= parseFloat(maxAmount)
      );
    }

    const [sortKey, sortDir] = sortBy.split("-") as [
      string,
      "asc" | "desc"
    ];

    filtered.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "date":
          cmp =
            new Date(a.created_at).getTime() -
            new Date(b.created_at).getTime();
          break;
        case "amount":
          cmp = a.amount - b.amount;
          break;
        case "name":
          cmp = a.title.localeCompare(b.title);
          break;
      }
      return sortDir === "desc" ? -cmp : cmp;
    });

    onFilter(filtered);
  }, [search, category, sortBy, minAmount, maxAmount, expenses]);

  const activeFilterCount =
    (category !== "all" ? 1 : 0) +
    (minAmount ? 1 : 0) +
    (maxAmount ? 1 : 0);

  return (
    <div className="mb-4 space-y-3">
      {/* Search bar */}
      <div className="relative">
        <NeuInput
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search expenses by title, category, or payer..."
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-[38px] text-[#94A3B8] hover:text-[#64748B] text-sm"
          >
            ✕
          </button>
        )}
      </div>

      {/* Filter toggle + Sort */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
            showFilters || activeFilterCount > 0
              ? "bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20"
              : "bg-white/50 text-[#64748B] border border-white/40 hover:bg-white/70"
          }`}
        >
          🔍 Filters
          {activeFilterCount > 0 && (
            <span className="bg-[#3B82F6] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="neu-input rounded-xl px-3 py-2 text-sm text-[#0F172A] transition-all"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="neu-inset rounded-xl p-4 space-y-3"
        >
          <div>
            <label className="mb-2 block text-xs font-medium text-[#475569]">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    category === cat.value
                      ? "bg-[#3B82F6] text-white"
                      : "bg-white/50 text-[#64748B] border border-white/40 hover:bg-white/70"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-[#475569]">
                Min Amount
              </label>
              <NeuInput
                type="number"
                step="0.01"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[#475569]">
                Max Amount
              </label>
              <NeuInput
                type="number"
                step="0.01"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                placeholder="999.99"
              />
            </div>
          </div>

          {activeFilterCount > 0 && (
            <button
              onClick={() => {
                setCategory("all");
                setMinAmount("");
                setMaxAmount("");
              }}
              className="text-xs text-[#3B82F6] hover:underline"
            >
              Clear all filters
            </button>
          )}
        </motion.div>
      )}
    </div>
  );
}
