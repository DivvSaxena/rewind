import Link from "next/link";

export const metadata = { title: "Privacy Policy | Rewind" };

export default function Privacy() {
  return (
    <div className="min-h-screen bg-zinc-950 px-6 py-16 text-zinc-100">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="text-xs text-zinc-500 transition-colors hover:text-zinc-200">
          ← Back to Rewind
        </Link>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight">Privacy Policy</h1>
        <div className="mt-6 flex flex-col gap-4 text-sm leading-relaxed text-zinc-400">
          <p>
            Rewind is a demo tool built for the Cognee hackathon. It does not require an
            account and does not collect personal information.
          </p>
          <p>
            Questions you ask in the debugger are sent to the Rewind backend to generate an
            answer from the knowledge graph. They are not stored, profiled, or shared.
          </p>
          <p>
            Standard hosting logs (such as IP addresses) may be kept briefly by our hosting
            providers, Vercel and Fly.io, for security and operations.
          </p>
          <p>Contact: saxenadivv@gmail.com</p>
        </div>
      </div>
    </div>
  );
}
