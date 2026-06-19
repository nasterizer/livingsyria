---
name: Form hook ordering in PostListingForm
description: React Hook Form's form object must be declared before any useEffect that references it.
---

In `artifacts/web/src/app/[locale]/listings/new/_form.tsx`, `const form = useForm(...)` appears after several `useState`/`useRef` declarations. Any `useEffect` that calls `form.watch(...)` or accesses `form` in any way **must be placed after** `const form = useForm(...)`.

In JavaScript, `const` inside a function body has temporal dead zone — if an `useEffect` closure references `form` and is registered before `form` is initialized in sequential execution, TypeScript flags it as "used before declaration" and it may fail at runtime.

**Correct pattern:**
```ts
const form = useForm<FormValues>({ ... });
const isFree = form.watch("isFree");

// ✅ useEffect AFTER form declaration
useEffect(() => {
  const sub = form.watch((values) => { ... });
  return () => sub.unsubscribe();
}, [form, ...]);
```

**Wrong pattern:**
```ts
// ❌ useEffect BEFORE form declaration — TypeScript error
useEffect(() => {
  const sub = form.watch(...);
}, [form]);

const form = useForm<FormValues>({ ... });
```

**Why:** Ran into this when inserting the draft auto-save effect block above the `useListCategories` / `useCreateListing` / `useForm` calls. Fixed by splitting: state/refs can go anywhere, but the `form.watch` subscription effect must come after `form` is initialized.
