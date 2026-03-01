/**
 * InviteSection Component
 * Allows trip members to invite others via email to join the trip
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/useToast';
import { getAuthToken } from '@/lib/jwt';

interface InviteSectionProps {
  tripId: string;
  onInviteSent?: () => void;
}

export default function InviteSection({ tripId, onInviteSent }: InviteSectionProps) {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sentEmails, setSentEmails] = useState<string[]>([]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      showToast('Please enter an email address', 'error');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast('Invalid email format', 'error');
      return;
    }

    try {
      setLoading(true);

      const token = await getAuthToken();
      if (!token) {
        showToast('Not authenticated', 'error');
        return;
      }

      const response = await fetch('/api/trips/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tripId,
          email: email.toLowerCase(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        showToast(data.error || 'Failed to send invitation', 'error');
        return;
      }

      showToast(`Invitation sent to ${email}`, 'success');
      setSentEmails([...sentEmails, email.toLowerCase()]);
      setEmail('');
      onInviteSent?.();
    } catch (error) {
      console.error('Error sending invitation:', error);
      showToast('Failed to send invitation', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-white/85 backdrop-blur-md border border-[#cfe0d7] rounded-3xl p-6"
    >
      <h3 className="text-xl font-bold text-[#163427] mb-4">Invite Members</h3>

      <form onSubmit={handleInvite} className="space-y-4">
        <div>
          <label className="block text-sm text-[#5f7a6c] mb-2">Invite by Email</label>
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="friend@example.com"
              disabled={loading}
              className="flex-1 bg-white border border-[#cfe0d7] rounded-xl px-4 py-2 text-[#163427] placeholder-[#7a9186] focus:border-[#EFEC07] focus:outline-none transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="px-4 py-2 bg-[#EFEC07] text-[#163427] rounded-xl hover:shadow-lg hover:shadow-[#EFEC07]/50 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {loading ? 'Sending...' : 'Invite'}
            </button>
          </div>
        </div>
      </form>

      {/* Recently Invited */}
      {sentEmails.length > 0 && (
        <div className="mt-6 pt-6 border-t border-[#d8e7df]">
          <p className="text-sm text-[#5f7a6c] mb-3">Recently invited:</p>
          <div className="space-y-2">
            {sentEmails.map((sentEmail, index) => (
              <motion.div
                key={sentEmail}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-2 text-sm text-[#5f7a6c]"
              >
                <span className="w-2 h-2 bg-green-400 rounded-full" />
                {sentEmail}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-[#7a9186] mt-4 text-center">
        Invitations expire in 7 days
      </p>
    </motion.div>
  );
}
