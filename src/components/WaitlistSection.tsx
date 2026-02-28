'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { waitlist } from '@/services/waitlist.service';

type MessageType = 'success' | 'error' | null;

export default function WaitlistSection() {
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<MessageType>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const result = await waitlist.signup(email);

    if (result.success) {
      setMessageType('success');
      setMessage(result.message);
      setEmail('');
    } else {
      setMessageType('error');
      setMessage(result.error);
    }

    setLoading(false);

    // Clear message after 5 seconds
    const timeout = setTimeout(() => {
      setMessage('');
      setMessageType(null);
    }, 5000);

    return () => clearTimeout(timeout);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true, margin: '-100px' }}
      className="w-full py-16 sm:py-20 md:py-24 px-4"
    >
      <div className="max-w-2xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-12"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#FFFFFF] mb-4">
            Join the Waitlist
          </h2>
          <p className="text-base sm:text-lg text-[#FFFFFF]/70">
            Be the first to experience smarter travel planning.
          </p>
        </motion.div>

        {/* Glass Card Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="relative group"
        >
          {/* Gradient border effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#EFEC07]/20 to-[#17394B]/20 rounded-3xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Glass card */}
          <div className="relative bg-[#02131B]/60 backdrop-blur-md border border-[#EFEC07]/10 rounded-3xl p-6 sm:p-8 hover:border-[#EFEC07]/20 transition-colors duration-300">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Email Input */}
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={loading}
                className="flex-1 bg-[#17394B]/40 text-[#FFFFFF] placeholder-[#FFFFFF]/40 px-5 sm:px-6 py-3 sm:py-4 rounded-2xl border border-[#EFEC07]/10 focus:outline-none focus:ring-2 focus:ring-[#EFEC07]/50 focus:border-transparent transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
              />

              {/* Submit Button - Premium CTA */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="relative bg-[#EFEC07] hover:brightness-110 text-[#02131B] font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-[0_0_30px_rgba(239,236,7,0.6)] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 disabled:hover:brightness-100 min-w-fit whitespace-nowrap overflow-hidden"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-[#02131B] border-t-transparent rounded-full animate-spin" />
                    Joining...
                  </span>
                ) : (
                  'Join Now'
                )}
              </motion.button>
            </div>

            {/* Message Display */}
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className={`mt-4 p-3 sm:p-4 rounded-xl text-sm sm:text-base font-medium ${
                  messageType === 'success'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-red-500/20 text-red-300 border border-red-500/30'
                }`}
              >
                {message}
              </motion.div>
            )}
          </div>
        </motion.form>

        {/* Trust indicator */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-center mt-6 text-sm text-[#FFFFFF]/50"
        >
          ✓ No spam, unsubscribe anytime
        </motion.p>
      </div>
    </motion.section>
  );
}
