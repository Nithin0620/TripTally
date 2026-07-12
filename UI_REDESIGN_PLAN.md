# TripTally UI Redesign Plan — Blue + Yellow Neumorphism × Glassmorphism

## 1. New Color Palette

| Token | Old (Green) | New (Blue) | Usage |
|---|---|---|---|
| `brand-bg` | `#F6FBF8` (mint) | `#F0F4F8` (ice blue) | Page background |
| `brand-surface` | `#E7F3EC` (light green) | `#E2E8F0` (light slate) | Card/input backgrounds |
| `brand-text` | `#163427` (forest green) | `#0F172A` (navy slate) | Headings, primary text |
| `brand-accent` | `#EFEC07` (yellow) | `#EFEC07` (yellow, unchanged) | CTAs, highlights |
| `brand-blue` | N/A | `#3B82F6` (blue-500) | Secondary accent, links, active states |
| `brand-blue-deep` | N/A | `#1D4ED8` (blue-700) | Deep blue emphasis |
| `brand-surface-alt` | N/A | `#DBEAFE` (blue-100) | Neumorphic shadow light side |

### Supporting Colors (updated)
| Token | Old | New |
|---|---|---|
| Secondary text | `#4f6f5e` | `#64748B` (slate-500) |
| Muted text | `#5f7a6c` | `#475569` (slate-600) |
| Placeholder | `#7a9186` | `#94A3B8` (slate-400) |
| Border light | `#cfe0d7` | `#CBD5E1` (slate-300) |
| Border medium | `#d8e7df` | `#E2E8F0` (slate-200) |
| Avatar bg | `#edf6f1` | `#EFF6FF` (blue-50) |
| Avatar border | `#b9d3c5` | `#BFDBFE` (blue-200) |
| Nav active bg | `#edf6f1` | `#EFF6FF` (blue-50) |

### Neumorphism Shadow System
```css
/* Neumorphic raised (light mode) */
.neu-raised {
  box-shadow:
    6px 6px 12px rgba(163, 177, 198, 0.6),
    -6px -6px 12px rgba(255, 255, 255, 0.8);
}

/* Neumorphic inset (pressed) */
.neu-inset {
  box-shadow:
    inset 4px 4px 8px rgba(163, 177, 198, 0.5),
    inset -4px -4px 8px rgba(255, 255, 255, 0.7);
}

/* Neumorphic + Glass fusion */
.neu-glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow:
    8px 8px 16px rgba(163, 177, 198, 0.5),
    -8px -8px 16px rgba(255, 255, 255, 0.8),
    inset 0 0 0 1px rgba(255, 255, 255, 0.2);
}
```

---

## 2. Files to Modify (Existing)

### 2A. Design System Foundation
| File | Changes |
|---|---|
| `tailwind.config.js` | Replace all color tokens with blue palette, add neumorphic shadow utilities |
| `src/app/globals.css` | Update `.glass-card`, add `.neu-raised`, `.neu-inset`, `.neu-glass` classes, update ambient orb colors from green to blue |
| `src/lib/animations.ts` | Add new variants: `neuPress`, `neuHover`, `scaleSpring`, `shimmer` |
| `src/components/ui/Button.tsx` | Neumorphic button variants with press/release shadow transitions |
| `src/components/ui/GlassCard.tsx` | Fusion glass+neu card with new shadow treatment |
| `src/components/ui/Toast.tsx` | Update toast colors to blue theme |
| `src/components/ui/AmbientBackground.tsx` | Change orb gradients from green to soft blue |

### 2B. Navigation & Layout
| File | Changes |
|---|---|
| `src/app/layout.tsx` | Update body bg color |
| `src/components/Navbar.tsx` | Neumorphic glass pill nav, blue active indicators, new shadow |
| `src/components/MobileMenu.tsx` | Same treatment for mobile |
| `src/components/FooterSection.tsx` | Blue theme colors, neumorphic section cards |

### 2C. Auth Pages
| File | Changes |
|---|---|
| `src/app/login/page.tsx` | Neumorphic glass card, blue-themed inputs, blue focus rings |
| `src/app/register/page.tsx` | Same treatment |

### 2D. Dashboard & Trips
| File | Changes |
|---|---|
| `src/app/dashboard/page.tsx` | Neumorphic sidebar, glass+neu stat cards, neu trip cards, blue hover states, update CreateTripModal |
| `src/app/trips/[tripId]/page.tsx` | Neumorphic header, stat cards, tab bar (neumorphic toggle), activity/expense cards |

### 2E. Expenses
| File | Changes |
|---|---|
| `src/app/expenses/[tripId]/page.tsx` | Neumorphic balance cards, settlement cards |
| `src/components/expenses/AddExpenseModal.tsx` | Neumorphic form inputs, blue accent splits |
| `src/components/expenses/ExpenseCard.tsx` | Neumorphic expandable card |
| `src/components/expenses/BalanceSummary.tsx` | Neumorphic balance bars |
| `src/components/expenses/InviteSection.tsx` | Neumorphic invite form |

### 2F. Explore
| File | Changes |
|---|---|
| `src/app/explore/page.tsx` | Blue gradient hero, neu search bar, blue category chips |
| `src/app/explore/[placename]/page.tsx` | Blue theme place detail |
| `src/app/map/page.tsx` | Minor color updates |
| `src/app/place/[placename]/page.tsx` | Blue theme updates |
| `src/components/explore/*` | All explore components updated to blue theme |

### 2G. Landing Page
| File | Changes |
|---|---|
| `src/components/HeroSection.tsx` | Blue gradient hero, neu CTA buttons |
| `src/components/FeatureSection.tsx` | Neumorphic feature cards |
| `src/components/DiscoverSection.tsx` | Blue category chips, neu cards |
| `src/components/TestimonialsSection.tsx` | Neumorphic testimonial cards |
| `src/components/PackageGeneratorSection.tsx` | Neumorphic form |

---

## 3. New Files to Create

### 3A. New UI Components
| File | Description |
|---|---|
| `src/components/ui/NeuCard.tsx` | Reusable neumorphic card (raised/inset/flat variants) |
| `src/components/ui/NeuInput.tsx` | Neumorphic input field with focus glow |
| `src/components/ui/NeuToggle.tsx` | Neumorphic toggle switch for tabs |
| `src/components/ui/NeuProgress.tsx` | Neumorphic progress bar |
| `src/components/ui/EmptyState.tsx` | Reusable empty state with icon, title, description, CTA |
| `src/components/ui/LoadingSpinner.tsx` | Branded loading spinner |

### 3B. Templates Page (Full Backend Integration)
| File | Description |
|---|---|
| `src/app/templates/page.tsx` | Full templates page: list all templates, create template modal, template cards. Uses `templatesApi.getTemplates()` and `templatesApi.createTemplate()` |
| `src/components/templates/TemplateCard.tsx` | Neumorphic template card showing title, location, days, budget, public/private badge |
| `src/components/templates/CreateTemplateModal.tsx` | Modal form to create template (title, location, days, budget_range, is_public toggle) |

### 3C. AI Planner Page (Landing + Backend Integration)
| File | Description |
|---|---|
| `src/app/ai-planner/page.tsx` | AI trip planner page. Step-by-step wizard: Destination → Dates → Budget → Generate. Integrates with explore/generate API for destination suggestions. Uses existing `PackageGeneratorSection` logic but as full page |

### 3D. Trip Edit Modal
| File | Description |
|---|---|
| `src/components/trips/EditTripModal.tsx` | Pre-filled form modal for editing trip title, description, dates, cover image. Calls `PUT /api/trips/[tripId]` (need to add `updateTrip` to `src/lib/api/trips.ts`) |

### 3E. Expense Edit Modal
| File | Description |
|---|---|
| `src/components/expenses/EditExpenseModal.tsx` | Pre-filled expense edit modal with split type editing. Calls `PUT /api/expenses` (need to add `updateExpense` to `src/lib/api/expenses.ts`) |

### 3F. Receipt Upload UI
| File | Description |
|---|---|
| `src/components/expenses/ReceiptUpload.tsx` | Drag-and-drop receipt upload component with preview. Uses existing `receiptsApi.uploadReceipt()` |

---

## 4. API Client Additions

| File | New Methods |
|---|---|
| `src/lib/api/trips.ts` | `updateTrip(tripId, data)` → `PUT /api/trips/[tripId]` |
| `src/lib/api/expenses.ts` | `updateExpense(data)` → `PUT /api/expenses` |

---

## 5. Implementation Order (Phases)

### Phase 1: Design System (Foundation)
1. Update `tailwind.config.js` — new blue color tokens
2. Update `src/app/globals.css` — new `.glass-card`, add `.neu-*` classes, blue ambient orbs
3. Update `src/lib/animations.ts` — add neumorphic animation variants
4. Create `src/components/ui/NeuCard.tsx`
5. Create `src/components/ui/NeuInput.tsx`
6. Create `src/components/ui/NeuToggle.tsx`
7. Create `src/components/ui/EmptyState.tsx`
8. Create `src/components/ui/LoadingSpinner.tsx`
9. Update `src/components/ui/Button.tsx` — neumorphic variants
10. Update `src/components/ui/GlassCard.tsx` — fusion glass+neu
11. Update `src/components/ui/Toast.tsx` — blue theme
12. Update `src/components/ui/AmbientBackground.tsx` — blue orbs

### Phase 2: Navigation & Auth
13. Update `src/app/layout.tsx`
14. Update `src/components/Navbar.tsx`
15. Update `src/components/MobileMenu.tsx`
16. Update `src/components/FooterSection.tsx`
17. Update `src/app/login/page.tsx`
18. Update `src/app/register/page.tsx`

### Phase 3: Dashboard & Trip Pages
19. Update `src/app/dashboard/page.tsx`
20. Add `updateTrip` to `src/lib/api/trips.ts`
21. Create `src/components/trips/EditTripModal.tsx`
22. Update `src/app/trips/[tripId]/page.tsx` — integrate EditTripModal

### Phase 4: Expenses & Settlements
23. Update `src/app/expenses/[tripId]/page.tsx`
24. Update `src/components/expenses/AddExpenseModal.tsx`
25. Update `src/components/expenses/ExpenseCard.tsx`
26. Update `src/components/expenses/BalanceSummary.tsx`
27. Update `src/components/expenses/InviteSection.tsx`
28. Add `updateExpense` to `src/lib/api/expenses.ts`
29. Create `src/components/expenses/EditExpenseModal.tsx`
30. Create `src/components/expenses/ReceiptUpload.tsx`

### Phase 5: Explore Pages
31. Update `src/app/explore/page.tsx`
32. Update `src/app/explore/[placename]/page.tsx`
33. Update `src/app/place/[placename]/page.tsx`
34. Update `src/app/map/page.tsx`
35. Update explore components in `src/components/explore/`

### Phase 6: New Pages
36. Create `src/app/templates/page.tsx`
37. Create `src/components/templates/TemplateCard.tsx`
38. Create `src/components/templates/CreateTemplateModal.tsx`
39. Create `src/app/ai-planner/page.tsx`

### Phase 7: Landing Page
40. Update `src/components/HeroSection.tsx`
41. Update `src/components/FeatureSection.tsx`
42. Update `src/components/DiscoverSection.tsx`
43. Update `src/components/TestimonialsSection.tsx`
44. Update `src/components/PackageGeneratorSection.tsx`

---

## 6. Neumorphism × Glassmorphism Design Patterns

### Cards
- **Default**: `neu-glass` class — frosted glass with soft raised shadows
- **Interactive**: On hover, shadow deepens + subtle lift (Framer Motion `whileHover`)
- **Pressed/Active**: `neu-inset` — inset shadow for toggled/selected states

### Buttons
- **Primary (CTA)**: Yellow bg with neumorphic raised shadow → on press, inset shadow transition
- **Secondary**: Glass surface with neu raised → hover glow with blue tint
- **Outline**: Blue border with transparent bg → fill on hover

### Inputs
- `neu-inset` by default (recessed look)
- On focus: blue ring glow + border color change
- Placeholder text: slate-400

### Tab Bars
- Container: `neu-glass` rounded pill
- Active tab: `neu-inset` (pressed into surface) with yellow accent indicator
- Inactive tabs: flat with hover → raised transition

### Sidebar (Dashboard)
- `neu-glass` background
- Nav items: `neu-raised` for active, flat → `neu-raised` on hover
- Yellow accent bar for active item

### Modals
- Backdrop: `bg-slate-900/40 backdrop-blur-sm`
- Modal card: `neu-glass` with larger shadows, scale-in animation

### Ambient Background
- Orbs change from green gradients to soft blue gradients
- Keep same animation, blend with new blue palette
