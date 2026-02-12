# Loading Components Quick Reference

## Components Available

### 1. PageLoader
Full-screen centered loader for route transitions
- Location: `src/components/ui/page-loader.tsx`
- Features: Multi-layer animation, fade-in, backdrop blur
- Usage: Route transitions, app initialization

### 2. LoadingSpinner
Versatile spinner for inline or full-screen use
- Location: `src/components/ui/loading-spinner.tsx`
- Sizes: sm, md, lg
- Modes: inline, fullScreen
- Usage: Buttons, sections, overlays

### 3. Skeleton Loaders
Content placeholder loaders
- Location: `src/components/ui/skeleton-loader.tsx`
- Types: Page, Card, Table, Form, Dashboard
- Usage: Data loading states

## Quick Examples

### Route Loading
```tsx
<Suspense fallback={<PageLoader />}>
  <Route />
</Suspense>
```

### Data Loading
```tsx
{isLoading ? <TableSkeletonLoader /> : <DataTable />}
```

### Button Loading
```tsx
<Button disabled={isLoading}>
  {isLoading && <LoadingSpinner size="sm" />}
  Submit
</Button>
```

See `LOADING_ANIMATIONS.md` for complete documentation.
