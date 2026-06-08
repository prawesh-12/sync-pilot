// Root loading boundary is inherited by every route, so it must stay neutral —
// otherwise a landing-specific skeleton flashes on the way to other pages.
// Routes that need a skeleton (dashboard, settings, sign-in) define their own loading.tsx.
export default function RootLoading() {
  return null;
}
