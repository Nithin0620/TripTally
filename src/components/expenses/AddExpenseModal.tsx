/**
 * AddExpenseModal Component
 * Modal for creating new expenses with dynamic split calculation
 * Supports equal, percentage, and custom amount splits
 */

'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createExpenseWithSplit } from '@/services/expense.service';
import { useToast } from '@/hooks/useToast';
import { supabase } from '@/lib/supabase';

interface AddExpenseModalProps {
  tripId: string;
  onClose: () => void;
  onExpenseAdded: () => void;
}

type SplitType = 'equal' | 'percentage' | 'custom';

interface CurrentUser {
  id: string;
  name: string;
  email: string;
}

export default function AddExpenseModal({ tripId, onClose, onExpenseAdded }: AddExpenseModalProps) {
  const { showToast } = useToast();

  // Form state
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [paidById, setPaidById] = useState('');
  const [splitType, setSplitType] = useState<SplitType>('equal');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState('general');

  // Trip members
  const [tripMembers, setTripMembers] = useState<CurrentUser[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  // Split-specific state
  const [percentages, setPercentages] = useState<Record<string, string>>({});
  const [customShares, setCustomShares] = useState<Record<string, string>>({});

  // UI state
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadTripMembers();
  }, [tripId]);

  const loadTripMembers = async () => {
    try {
      const { data: members, error } = await supabase
        .from('trip_members')
        .select('user_id, users(id, name, email)')
        .eq('trip_id', tripId);

      if (error || !members) {
        showToast('Failed to load trip members', 'error');
        return;
      }

      const users = members
        .map((m: any) => (Array.isArray(m.users) ? m.users[0] : m.users))
        .filter(Boolean)
        .sort((a: any, b: any) => a.name.localeCompare(b.name));

      setTripMembers(users);

      // Set initial values
      if (users.length > 0) {
        setPaidById(users[0].id);
        setSelectedMembers(users.map(u => u.id));

        // Initialize split state
        const emptyPercentages: Record<string, string> = {};
        const emptyCustom: Record<string, string> = {};
        users.forEach(u => {
          emptyPercentages[u.id] = '';
          emptyCustom[u.id] = '';
        });
        setPercentages(emptyPercentages);
        setCustomShares(emptyCustom);
      }
    } catch (error) {
      console.error('Error loading trip members:', error);
      showToast('Failed to load trip members', 'error');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) newErrors.title = 'Title is required';
    if (!amount || parseFloat(amount) <= 0) newErrors.amount = 'Amount must be greater than 0';
    if (!paidById) newErrors.paidById = 'Payer must be selected';
    if (selectedMembers.length === 0) newErrors.selectedMembers = 'Select at least one member';

    // Validate split-specific rules
    if (splitType === 'percentage') {
      const total = selectedMembers.reduce((sum, id) => {
        return sum + (parseFloat(percentages[id] || '0') || 0);
      }, 0);

      if (Math.abs(total - 100) > 0.01) {
        newErrors.percentages = `Percentages must sum to 100% (current: ${total.toFixed(1)}%)`;
      }
    }

    if (splitType === 'custom') {
      const total = selectedMembers.reduce((sum, id) => {
        return sum + (parseFloat(customShares[id] || '0') || 0);
      }, 0);

      if (Math.abs(total - parseFloat(amount)) > 0.01) {
        newErrors.customShares = `Amounts must sum to ₹${parseFloat(amount).toFixed(2)} (current: ₹${total.toFixed(2)})`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast('Please fix the errors below', 'error');
      return;
    }

    try {
      setSubmitting(true);

      const percentagesObj =
        splitType === 'percentage'
          ? Object.fromEntries(
              selectedMembers.map(id => [id, parseFloat(percentages[id] || '0')])
            )
          : undefined;

      const customSharesObj =
        splitType === 'custom'
          ? Object.fromEntries(
              selectedMembers.map(id => [id, parseFloat(customShares[id] || '0')])
            )
          : undefined;

      const { data, error } = await createExpenseWithSplit(
        tripId,
        title,
        parseFloat(amount),
        paidById,
        splitType,
        selectedMembers,
        percentagesObj,
        customSharesObj,
        notes || undefined,
        category
      );

      if (error) {
        showToast(error, 'error');
        return;
      }

      showToast('Expense created successfully', 'success');
      onExpenseAdded();
    } finally {
      setSubmitting(false);
    }
  };

  const toggleMember = (memberId: string) => {
    setSelectedMembers(prev =>
      prev.includes(memberId) ? prev.filter(id => id !== memberId) : [...prev, memberId]
    );
  };

  const getMemberName = (id: string) => {
    return tripMembers.find(m => m.id === id)?.name || 'Unknown';
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="text-[#163427]">Loading...</div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={e => e.stopPropagation()}
        className="bg-gradient-to-br from-white to-[#eef7f1] border border-[#cfe0d7] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-b from-[#e7f3ec] to-transparent p-6 border-b border-[#d8e7df]">
          <h2 className="text-2xl font-bold text-[#163427]">Add New Expense</h2>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[#5f7a6c] hover:text-[#163427] transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#163427]">Expense Details</h3>

            <div>
              <label className="block text-sm text-[#5f7a6c] mb-2">Title *</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g., Dinner, Hotel, Transport"
                className="w-full bg-white border border-[#cfe0d7] rounded-xl px-4 py-3 text-[#163427] placeholder-[#7a9186] focus:border-[#EFEC07] focus:outline-none transition-colors"
              />
              {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[#5f7a6c] mb-2">Amount (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-white border border-[#cfe0d7] rounded-xl px-4 py-3 text-[#163427] placeholder-[#7a9186] focus:border-[#EFEC07] focus:outline-none transition-colors"
                />
                {errors.amount && <p className="text-red-400 text-xs mt-1">{errors.amount}</p>}
              </div>

              <div>
                <label className="block text-sm text-[#5f7a6c] mb-2">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full bg-white border border-[#cfe0d7] rounded-xl px-4 py-3 text-[#163427] focus:border-[#EFEC07] focus:outline-none transition-colors"
                >
                  <option value="general">General</option>
                  <option value="food">Food</option>
                  <option value="accommodation">Accommodation</option>
                  <option value="transport">Transport</option>
                  <option value="activities">Activities</option>
                  <option value="shopping">Shopping</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm text-[#5f7a6c] mb-2">Notes</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Add any notes about this expense..."
                rows={2}
                className="w-full bg-white border border-[#cfe0d7] rounded-xl px-4 py-3 text-[#163427] placeholder-[#7a9186] focus:border-[#EFEC07] focus:outline-none transition-colors resize-none"
              />
            </div>
          </div>

          {/* Who Paid */}
          <div>
            <label className="block text-sm text-[#5f7a6c] mb-2 font-semibold">Who Paid? *</label>
            <select
              value={paidById}
              onChange={e => setPaidById(e.target.value)}
              className="w-full bg-white border border-[#cfe0d7] rounded-xl px-4 py-3 text-[#163427] focus:border-[#EFEC07] focus:outline-none transition-colors"
            >
              <option value="">Select person</option>
              {tripMembers.map(member => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
            {errors.paidById && <p className="text-red-400 text-xs mt-1">{errors.paidById}</p>}
          </div>

          {/* Split Type */}
          <div>
            <label className="block text-sm text-[#5f7a6c] mb-3 font-semibold">Split Type</label>
            <div className="grid grid-cols-3 gap-3">
              {(['equal', 'percentage', 'custom'] as const).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSplitType(type)}
                  className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                    splitType === type
                        ? 'bg-[#EFEC07] text-[#163427]'
                        : 'bg-white text-[#163427] border border-[#cfe0d7] hover:border-[#9fc1ae]'
                  }`}
                >
                  {type === 'equal' && '= Equal'}
                  {type === 'percentage' && '% Percentage'}
                  {type === 'custom' && '₹ Custom'}
                </button>
              ))}
            </div>
          </div>

          {/* Members Selection */}
          <div>
            <label className="block text-sm text-[#5f7a6c] mb-3 font-semibold">Split Among *</label>
            <div className="space-y-2">
              {tripMembers.map(member => (
                <motion.label
                  key={member.id}
                  className="flex items-center p-3 bg-white border border-[#cfe0d7] rounded-xl cursor-pointer hover:border-[#9fc1ae] transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(member.id)}
                    onChange={() => toggleMember(member.id)}
                    className="w-5 h-5 rounded accent-[#EFEC07] cursor-pointer"
                  />
                  <span className="ml-3 text-[#163427]">{member.name}</span>
                </motion.label>
              ))}
            </div>
            {errors.selectedMembers && (
              <p className="text-red-400 text-xs mt-2">{errors.selectedMembers}</p>
            )}
          </div>

          {/* Split Details */}
          <AnimatePresence>
            {splitType === 'percentage' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <p className="text-sm text-[#5f7a6c] font-semibold">Enter percentage for each member:</p>
                {selectedMembers.map(memberId => (
                  <div key={memberId} className="flex items-center gap-3">
                    <span className="text-[#163427] flex-1">{getMemberName(memberId)}</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={percentages[memberId]}
                        onChange={e => setPercentages({ ...percentages, [memberId]: e.target.value })}
                        placeholder="0"
                        className="w-20 bg-white border border-[#cfe0d7] rounded-lg px-2 py-2 text-[#163427] text-right focus:border-[#EFEC07] focus:outline-none transition-colors"
                      />
                      <span className="text-[#5f7a6c]">%</span>
                    </div>
                  </div>
                ))}
                {errors.percentages && (
                  <p className="text-red-400 text-xs">{errors.percentages}</p>
                )}
              </motion.div>
            )}

            {splitType === 'custom' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <p className="text-sm text-[#5f7a6c] font-semibold">Enter amount for each member:</p>
                {selectedMembers.map(memberId => (
                  <div key={memberId} className="flex items-center gap-3">
                    <span className="text-[#163427] flex-1">{getMemberName(memberId)}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[#5f7a6c]">₹</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={customShares[memberId]}
                        onChange={e => setCustomShares({ ...customShares, [memberId]: e.target.value })}
                        placeholder="0.00"
                        className="w-24 bg-white border border-[#cfe0d7] rounded-lg px-2 py-2 text-[#163427] text-right focus:border-[#EFEC07] focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                ))}
                {errors.customShares && (
                  <p className="text-red-400 text-xs">{errors.customShares}</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Buttons */}
          <div className="flex gap-4 pt-6 border-t border-[#d8e7df]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-white text-[#163427] border border-[#cfe0d7] rounded-xl hover:bg-[#f5fbf7] transition-colors font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-[#EFEC07] text-[#163427] rounded-xl hover:shadow-lg hover:shadow-[#EFEC07]/50 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Creating...' : 'Create Expense'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
