import Link from "next/link";

export const metadata = { title: "Privacy Policy | Rewind" };

const SECTIONS: { heading: string; body: string[] }[] = [
  {
    heading: "1. Who we are",
    body: [
      "Rewind is a free demonstration tool for inspecting the memory of Cognee-backed AI agents, operated by Divv Saxena. For anything related to this policy, contact hello@divvsaxena.com.",
    ],
  },
  {
    heading: "2. What we collect",
    body: [
      "Rewind does not require an account, and we do not ask for, or intentionally collect, personal information.",
      "Questions you type into the debugger are sent to our backend and to a third-party language model provider (Groq) to generate an answer from the knowledge graph. Questions are processed transiently and are not stored by us, associated with you, or used to build profiles.",
      "Your onboarding answers and the name you optionally enter are stored only in your own browser (localStorage). They never leave your device and you can remove them at any time by clearing your browser data.",
      "Our hosting providers (Vercel for the frontend, Fly.io for the backend) may keep standard server logs, such as IP address, user agent, and request time, for a short period for security and operational purposes. We do not use these logs to identify you.",
    ],
  },
  {
    heading: "3. Cookies and tracking",
    body: [
      "Rewind uses Google Analytics to measure traffic and site usage. Google may set cookies or collect device and browser data for analytics reporting. We do not use advertising features or build marketing profiles from this data.",
      "The only first-party browser storage we use directly is localStorage for your onboarding preferences, as described above.",
    ],
  },
  {
    heading: "4. Third-party services",
    body: [
      "The service relies on Vercel (frontend hosting), Fly.io (backend hosting), and Groq (language model inference). Each processes only the data necessary to serve the request and is governed by its own privacy policy. We do not sell, rent, or share any data with anyone for marketing purposes.",
    ],
  },
  {
    heading: "5. Data in the demo",
    body: [
      "The knowledge graph shown in the demo is built exclusively from public information (issues and pull requests of the open source Cognee repository on GitHub). It contains no private user data.",
    ],
  },
  {
    heading: "6. Security",
    body: [
      "All traffic is served over HTTPS. Administrative endpoints are protected by a secret token. No system is perfectly secure, and the service is provided as a demo without guarantees, but we take reasonable measures to keep it safe.",
    ],
  },
  {
    heading: "7. Children",
    body: [
      "Rewind is not directed at children under 13 (or the equivalent minimum age in your jurisdiction) and we do not knowingly collect information from them.",
    ],
  },
  {
    heading: "8. Changes to this policy",
    body: [
      "We may update this policy from time to time. The current version will always be available at this page. Continued use of the service after an update means you accept the revised policy.",
    ],
  },
  {
    heading: "9. Contact",
    body: [
      "Questions, concerns, or requests regarding privacy: hello@divvsaxena.com.",
    ],
  },
];

export default function Privacy() {
  return (
    <div className="min-h-screen bg-zinc-950 px-6 py-16 text-zinc-100">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="text-xs text-zinc-500 transition-colors hover:text-zinc-200">
          ← Back to Rewind
        </Link>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-xs text-zinc-500">Last updated: July 5, 2026</p>
        <div className="mt-8 flex flex-col gap-8">
          {SECTIONS.map((s) => (
            <section key={s.heading}>
              <h2 className="text-sm font-semibold text-zinc-100">{s.heading}</h2>
              <div className="mt-2 flex flex-col gap-3">
                {s.body.map((p) => (
                  <p key={p.slice(0, 40)} className="text-sm leading-relaxed text-zinc-400">
                    {p}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
