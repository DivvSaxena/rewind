import Link from "next/link";

const PRODUCT_LINKS = [
  { label: "Debugger", href: "/debugger" },
  { label: "GitHub", href: "https://github.com/DivvSaxena/rewind", external: true },
  { label: "Cognee", href: "https://github.com/topoteretes/cognee", external: true },
];

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
];

const MAKER_LINKS = [
  { label: "Newsletter", href: "https://www.divvsaxena.com/newsletter" },
  { label: "Muscle Man App", href: "https://musclemanapp.com/" },
  { label: "Invoice Generator", href: "https://www.toolpdfs.com/" },
  { label: "Run Club", href: "https://divvsaxena.com/run" },
  { label: "OnlyStoic", href: "https://onlystoic.com" },
];

function ColumnHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-semibold uppercase tracking-widest text-[#666]">
      {children}
    </h3>
  );
}

function FooterLink({
  label,
  href,
  external,
}: {
  label: string;
  href: string;
  external?: boolean;
}) {
  const className = "text-xs text-[#666] transition-colors hover:text-[#e8e8e8]";
  return (
    <li>
      {external ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
          {label}
        </a>
      ) : (
        <Link href={href} className={className}>
          {label}
        </Link>
      )}
    </li>
  );
}

export default function SiteFooter() {
  return (
    <footer className="relative w-full border-t border-zinc-800/80 bg-zinc-950/70">
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "64px 24px",
          display: "grid",
          gridTemplateColumns: "1.5fr 1fr 1fr 1fr",
          gap: 40,
        }}
      >
        <div>
          <p className="text-sm font-semibold tracking-tight text-[#e8e8e8]">Rewind</p>
          <p className="mt-3 text-xs leading-relaxed text-[#666]">
            A memory debugger for Cognee-backed AI agents.
          </p>
          <p className="mt-4 text-xs text-[#666]">
            Copyright © {new Date().getFullYear()} Rewind. All rights reserved.
          </p>
        </div>

        <div>
          <ColumnHeading>Product</ColumnHeading>
          <ul className="mt-4 flex flex-col gap-2.5">
            {PRODUCT_LINKS.map((l) => (
              <FooterLink key={l.label} {...l} />
            ))}
          </ul>
        </div>

        <div>
          <ColumnHeading>Legal</ColumnHeading>
          <ul className="mt-4 flex flex-col gap-2.5">
            {LEGAL_LINKS.map((l) => (
              <FooterLink key={l.label} {...l} />
            ))}
          </ul>
        </div>

        <div>
          <ColumnHeading>By the Maker</ColumnHeading>
          <ul className="mt-4 flex flex-col gap-2.5">
            {MAKER_LINKS.map((l) => (
              <FooterLink key={l.label} {...l} external />
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
