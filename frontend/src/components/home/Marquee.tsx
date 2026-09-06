const items = [
  'Free shipping above ₹2000',
  'Extrait de parfum · 50 ML',
  'Paraben free',
  'Cruelty free',
  'Proudly made in India',
  'Small batch maceration',
];

/** Quiet ribbon between sections — pure CSS, no JS. */
export function Marquee() {
  return (
    <div className="overflow-hidden border-y border-line bg-ivory-deep py-4">
      <div className="flex w-max animate-[marquee_38s_linear_infinite] gap-14 pr-14">
        {[...items, ...items].map((item, index) => (
          <span key={`${item}-${index}`} className="eyebrow whitespace-nowrap text-ink-muted">
            {item}
          </span>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
