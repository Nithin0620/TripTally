-- Migration: Add visitors and waitlist tables for Coming Soon page
-- Created: 2026-02-28

-- Create visitors table
CREATE TABLE IF NOT EXISTS visitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_uuid TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- Create waitlist table
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_visitors_visitor_uuid ON visitors(visitor_uuid);
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);
