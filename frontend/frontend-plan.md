# Frontend Implementation Plan - Phone Shop POS

## Overview

Build a React frontend for Phone Shop POS system using the existing Vite + ShadcnUI boilerplate. We will create intuitive, fast interfaces for daily shop operations (purchase, repair, sale, debt/credit management).

**Architecture:** Redux Toolkit for state, RTK Query for API calls, React Hook Form + Zod for forms, ShadcnUI for components.

---

## Design Principles

1. **Mobile-First:** Shop employees may use tablets or phones
2. **Fast Workflows:** Minimize clicks for common operations
3. **Clear Visual Hierarchy:** Critical info (price, balance) stands out
4. **Error Prevention:** Validation before submission, confirmation dialogs
5. **Offline-Ready (Future):** Queue operations when offline (Phase 2)

---

## Implementation Milestones

### Milestone 1: API Integration Setup
**Goal:** Connect frontend to backend APIs

**Tasks:**
1. Update API path constants
2. Create RTK Query endpoints for each entity
3. Update Redux auth slice to handle 4 roles
4. Update ProtectedRoute with role hierarchy
5. Test token refresh flow

**Acceptance:**
- All API endpoints callable from frontend
- Token refresh on 401 works
- Role-based route protection functional

---

### Milestone 2: Dashboard (Overview)
**Goal:** Show key metrics and recent activity

**Components:**
- Dashboard overview page
- Metric cards
- Recent sales list
- Inventory status

**Acceptance:**
- Dashboard loads in < 2s
- Metrics update on refresh
- Charts display correctly
- Role-based: CASHIER+ can view

---

### Milestone 3: Customer Management
**Goal:** Create/search/view customers with balances

**Pages:**
- Customer list with search
- Customer detail page

**Components:**
- Customer search input
- Customer form
- Balance summary
- Transaction history

**Acceptance:**
- Can create customer in < 10s
- Phone search returns results instantly
- Balance display is accurate
- Transaction history paginated

---

### Milestone 4: Purchase Flow
**Goal:** Buy phones from customers

**Pages:**
- Purchase history
- New purchase form

**Components:**
- Purchase form
- Phone input row
- Customer selector
- Payment calculator

**Acceptance:**
- Can create purchase with 1 phone in < 30s
- Can add multiple phones easily
- Barcode generation works
- Pay-later creates customer credit

---

## Shared Components to Build

### 1. Barcode Scanner
- Use device camera or USB barcode scanner
- Fallback: manual input

### 2. Barcode Display
- Show barcode image from code
- Print button

### 3. Receipt Printer
- Sale Receipt, Payment Receipt
- Show: shop name, date, items, amounts, balance

### 4. Phone Number Input
- Format: +998 (90) 123-45-67
- Auto-format on type

### 5. Currency Input
- Format: $1,234.56
- Decimal precision: 2

### 6. Status Badge
- Color-coded badges for statuses

---

## Performance Optimizations

1. **Lazy Loading:** All pages loaded via React.lazy()
2. **Virtualization:** Use react-window for large lists
3. **Debouncing:** Search inputs debounced (300ms)
4. **Caching:** RTK Query cache (5 minutes for reports)
5. **Memoization:** useMemo for expensive calculations

---

## Dependencies to Add

```bash
# Barcode
npm install react-barcode react-barcode-reader

# Printing
npm install react-to-print

# Date picker
npm install react-day-picker date-fns

# Phone input
npm install react-phone-number-input

# Virtualization
npm install react-window

# PDF export
npm install jspdf jspdf-autotable
```

---

## Verification Checklist

After each milestone:
- [ ] All forms validate correctly
- [ ] API calls succeed with proper auth
- [ ] Error states display correctly
- [ ] Loading states show while fetching
- [ ] Role-based rendering works
- [ ] Mobile responsive layout
- [ ] Accessibility (keyboard navigation, ARIA labels)
- [ ] Browser compatibility (Chrome, Firefox, Safari)
