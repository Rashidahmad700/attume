const APP_ENV = process.env.NEXT_PUBLIC_APP_ENV ?? 'local';

/**
 * Corner marker outside production, so a QA tab is never mistaken for the
 * live shop. Renders nothing when APP_ENV is production.
 */
export function EnvironmentRibbon() {
  if (APP_ENV === 'production') return null;

  const tone = APP_ENV === 'qa' ? 'bg-espresso' : 'bg-olive';

  return (
    <div
      aria-hidden="true"
      className={`fixed bottom-0 left-0 z-[100] ${tone} px-3 py-1 text-[10px] tracking-[0.16em] text-ivory uppercase`}
    >
      {APP_ENV}
    </div>
  );
}
