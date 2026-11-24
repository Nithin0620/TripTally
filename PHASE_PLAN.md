# TripTally Completion Plan — 10 Phases

This plan converts the feature-gap audit into 10 executable phases.

- **AI work is isolated in Phase 7.** No other phase touches AI prompts, generators, planners, or model provider code.
- **Phase 8 is `UI Enhancement / Reorganising`.**
- Recommended order: **1 → 2 → (3, 4, 5, 6, 7 in parallel) → 8 → 9 → 10**.
- Rough remaining effort split: **10 / 8 / 8 / 10 / 10 / 14 / 14 / 10 / 8 / 8**.

---

## Phase 1 — Critical Runtime Contract Repairs

**Goal:** Make the already-built UI actually load and save data.

**Tasks**
- Make `GET /api/trips/[tripId]` return `activities` and `expenses` alongside `trip` and `members`.
  - `src/app/api/trips/[tripId]/route.ts:46,52`
  - `src/services/trip.service.ts:57-79`
  - `src/lib/api/trips.ts:20-25`
  - `src/app/trips/[tripId]/page.tsx:95-105`
- Fix activity PUT/DELETE/reorder contract mismatch.
  - Client omits `trip_id` on PUT and sends no body on DELETE: `src/lib/api/activities.ts:19-67`, `src/lib/api/client.ts:104-106`
  - Server requires `{ id, trip_id, ... }`: `src/app/api/activities/route.ts:105-107,154-160`
- Fix expense DELETE contract mismatch.
  - `src/lib/api/expenses.ts:49-51`
  - `src/app/api/expenses/route.ts:254-259`
  - Add ownership/trip guard to delete RPC: `sql/supabase_expense_transaction_functions.sql:112-121`
- Add one shared contract test/smoke checklist for create/update/delete across trips, activities, expenses.

**Done when**
- Trip detail page renders saved itinerary and expenses.
- Activity add/edit/complete/reorder/delete all persist.
- Expense delete persists and rejects non-members.

---

## Phase 2 — Core Data Model + Trip/Expense Fields

**Goal:** Fill schema/type/API/form gaps that block other work.

**Tasks**
- Add real `destination` field to trips: schema, types, create/edit forms, API validation, dashboard display.
  - `sql/supabase_complete_schema.sql:58-67`
  - `src/types/index.ts:34-45,155-163`
  - `src/models/trip.ts:4-13`
  - `src/app/dashboard/page.tsx:420-428`
- Add start/end date validation (`start_date <= end_date`) in API and UI.
  - `src/app/api/trips/route.ts:74-75`
- Add expense fields: user-supplied `expense_date`, separate `description`, `tags`.
  - `sql/supabase_expense_invites_migration.sql:32-44`
  - `src/components/expenses/AddExpenseModal.tsx:37,166,245-289`
  - `src/components/expenses/ExpenseCard.tsx:62-69`
- Add expense-level currency/rate columns for later conversion logic.
  - `sql/supabase_currency_migration.sql:5`
- Add latitude/longitude inputs to activity creation, not only editing.
  - `src/components/trips/AddActivityModal.tsx:75-81`
  - `src/components/trips/EditActivityModal.tsx:116-135`

**Done when**
- DB schema, TypeScript types, APIs, and forms agree on every field.
- No UI label is faking a missing field.

---

## Phase 3 — Itinerary, Maps & Exports Reliability

**Goal:** Finish day-by-day behaviour and location features.

**Tasks**
- Add activity conflict/overlap detection using existing time parser.
  - `src/utils/activity.ts:106-116`
  - `src/components/trips/DayByDayItinerary.tsx:53-97`
- Persist completion checkboxes after Phase 1 fixes.
- Fix map marker refresh bug.
  - `src/components/trips/TripActivityMap.tsx:94-103`
- Add geocode/geolocation entry points and wire nearby suggestions into activity creation.
  - `src/hooks/usePlaces.ts:81-125`
- QA export outputs: PDF print flow, `.ics`, itinerary CSV escaping/date grouping.
  - `src/utils/export.ts`
  - `src/app/trips/[tripId]/page.tsx:340-380`

**Done when**
- Itinerary behaves correctly under overlapping times, completion, reorder, and export.
- Map shows markers reliably after data loads or changes.

---

## Phase 4 — Auth & Account Completion

**Goal:** Close login/account gaps.

**Tasks**
- Implement real email verification: token issuance, email send, verification page, expiry, resend.
  - `src/app/api/auth/verify/route.ts:4-43`
- Reject unverified Google accounts where `email_verified` is false.
  - `src/app/api/auth/google/route.ts:43-49`
- Implement password reset request + confirm flow.
  - `src/app/login/page.tsx:123-125`
- Add profile view/update, avatar upload, password change, account deletion, GDPR/data export.
  - `src/components/Navbar.tsx:35-42,98-101`
  - `src/app/api/auth/google/route.ts:111-116`
  - Existing upload patterns: `src/app/api/receipts/route.ts:50`, `src/app/api/trips/[tripId]/cover/route.ts:66`

**Done when**
- A user can verify, recover, edit, and delete their account without placeholders.

---

## Phase 5 — Collaboration & Realtime Completion

**Goal:** Finish shared-trip behaviour.

**Tasks**
- Add member list with role display, role-change, and remove-member endpoints/UI.
  - `src/middleware/role.ts:8-68`
  - `src/app/api/trips/accept-invite/route.ts:57-61`
- Open email invite from the trip page, not only shareable link.
  - `src/app/trips/[tripId]/page.tsx:274-281,886-893`
  - `src/components/expenses/InviteSection.tsx:44-54`
- Keep broadcast chat, but add `postgres_changes` refetch so persisted messages never go stale.
  - `src/hooks/useTripChat.ts:25-54`
- Add typing indicators.
  - `src/components/trips/TripChatDrawer.tsx:219-248`
- Add trip-scoped activity feed that reads notifications created in Phase 9.
  - `src/components/notifications/NotificationCenter.tsx:38-47`

**Done when**
- Owners/editor/viewer flows are visible and enforced in UI.
- Chat and presence survive reloads and multi-user updates.

---

## Phase 6 — Finance Completion

**Goal:** Finish money features without touching AI code.

**Tasks**
- Fix settlement correctness: status column, remove hardcoded “Pending”, fix balance labels, return `totalExpensed`.
  - `src/app/trips/[tripId]/page.tsx:713-715`
  - `src/components/expenses/BalanceSummary.tsx:20-22,73`
  - `src/app/api/settlement/[tripId]/route.ts:48-58`
  - `sql/supabase_settlement_payments_migration.sql:5-16`
- Add payment reminders using the notification service wired in Phase 9.
  - `src/services/notification.service.ts:11-70`
- Wire receipt upload/delete UI and fix helper payload.
  - `src/components/expenses/ReceiptUpload.tsx:103-108`
  - `src/lib/api/misc.ts:80-86`
  - `src/app/api/receipts/route.ts:16-78,83-145`
- Add OCR extraction path and stop storing `extracted_text: null` by default.
  - `src/app/api/receipts/route.ts:62`
- Add `shares` split type, conversion rates, expense-level currency formatting, remove hardcoded `$`.
  - `src/utils/splitCalculator.ts:66-108`
  - `src/utils/currency.ts:7-36`
  - `src/app/expenses/[tripId]/page.tsx:150,253`
  - `src/components/expenses/ExpenseCard.tsx:38`
- Render per-day analytics and add average metric.
  - `src/components/expenses/ExpenseAnalytics.tsx:73-87,189-250`

**Done when**
- Balances, settlement history, receipts, splits, analytics, and currency are trustworthy.

---

## Phase 7 — AI Systems

**Goal:** One dedicated phase for **all AI work**. No other phase modifies AI code.

**Tasks**
- Trip planner: add explicit travel dates and interests inputs, keep duration/budget/vibe.
  - `src/app/ai-planner/page.tsx:76-109`
  - `src/app/api/ai/plan/route.ts:4-52`
- Add regenerate/refine from an existing plan instead of only reset/replan.
  - `src/app/ai-planner/page.tsx:193-198,445-447,571-573`
- Add optional live-data hooks for weather and prices used by prompts.
  - `src/app/api/ai/plan/route.ts:70,83-84`
- Harden category place generator: persist results, dedupe, cache, rate limit.
  - `src/app/api/explore/generate/route.ts:34-216`
- Add explicit rate limiting to single-place generator.
  - `src/app/api/explore/generate-place/route.ts:31-180`
- Keep search DB-first; harden AI fallback dedupe/cache/rate-limit.
  - `src/app/api/explore/search/route.ts:31-162`
- Document Groq/provider env vars and fallback behaviour.
  - `src/lib/groq.ts:70-136`
  - `src/lib/explore-ai.ts:39-151`
- AI-adjacent future items: travel-style quiz, collaborative filtering, seasonal recommendation scoring, sustainability scoring.
  - Currently missing; do not implement elsewhere.

**Done when**
- Every AI endpoint has persistence/dedupe/rate-limit/caching behaviour.
- Planner can refine a saved plan and use optional live data.
- No AI logic remains duplicated outside this phase.

---

## Phase 8 — UI Enhancement / Reorganising

**Goal:** Visual polish and structure without backend logic.

**Tasks**
- Render FAQ and CTA sections; add pricing; activate inert CTAs.
  - `src/components/landing/FAQSection.tsx:6-29`
  - `src/components/landing/CTASection.tsx:9-80`
  - `src/components/DiscoverSection.tsx:134-136`
  - `src/components/PackageGeneratorSection.tsx:84-86`
- Add SEO/OG tags, sitemap, robots.
  - `src/app/layout.tsx:8-11`
- Polish dashboard empty/loading/filter/stats states after Phase 1 data fixes.
  - `src/app/dashboard/page.tsx:141-227,229-318`
- Polish trip page layout, modals, drawer, and responsive breakpoints.
- Reorganise components: shared `EmptyState`, `LoadingState`, `ErrorState`, consistent modal shell, landing folder cleanup.
- Add profile/settings entry points in navbar after Phase 4.

**Done when**
- Landing converts, dashboard is clear, trip page is readable on desktop/mobile, and component structure is consistent.

---

## Phase 9 — Notifications, Templates, Ratings & Content Ops

**Goal:** Wire content/event features and remove dead ends.

**Tasks**
- Call `createNotification` on invite sent/accepted, expense added/settled, trip updated, chat mention.
  - `src/services/notification.service.ts:11,43`
  - `src/app/api/notifications/route.ts:5-67`
- Fix or remove notification “View all” link to nonexistent `/notifications`.
  - `src/components/notifications/NotificationCenter.tsx:206-214`
- Add optional push/service-worker notifications.
- Seed prebuilt templates and make “Use Blueprint” create a trip from template data instead of redirecting only.
  - `src/app/templates/page.tsx:24-117`
  - `src/app/api/templates/route.ts:13-83`
  - `src/components/templates/TemplateCard.tsx:72-79`
  - `sql/supabase_complete_schema.sql:124-133`
- Add ratings/reviews/feedback table, API, and UI for trips/templates/places.
  - Currently only hardcoded stars: `src/components/TestimonialsSection.tsx:8-30`
- Maintain seeded place content without editing generated AI code.
  - `sql/supabase_places_migration.sql:40-625`

**Done when**
- Notifications are actually produced, templates are usable, and ratings/feedback persist.

---

## Phase 10 — Future Enhancements, Deployment & Final Verification

**Goal:** Non-AI future items, launch readiness, and final QA.

**Tasks**
- Add non-AI future enhancements: UGC submissions, photo contests, AR previews, CSR/sustainability content pages, weather/price display UI consuming Phase 7 providers.
- Complete deployment docs: real `README.md`, complete `.env.example`, Vercel + Supabase setup, SQL migration order, storage bucket policy.
  - `README.md:1`
  - `.env.example:3-7`
  - `backend.md:1455-1478`
- Harden security: HSTS/X-Frame-Options, CORS policy, rate-limit review.
  - `next.config.js:12-43`
  - `src/middleware.ts:4-31`
- Final verification matrix: auth, trip CRUD, itinerary CRUD, finance CRUD/settlement, explore, notifications, templates, AI planner, exports.
- Run and record:
  - `npx tsc --noEmit --pretty false`
  - `npm run build`
  - ESLint setup or explicit decision to skip.
- Prepare rollback steps for new SQL migrations.

**Done when**
- All 10 phases pass smoke tests and the project is deployable from a clean clone.
