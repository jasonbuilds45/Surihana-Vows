import Link from "next/link";
import { Container } from "@/components/layout/Container";

export default function NotFound() {
  return (
    <Container className="grid min-h-[60vh] place-items-center py-16">
      <div className="max-w-2xl space-y-5 text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-stone-500">Not found</p>
        <h1 className="font-display text-5xl text-stone-950">This invitation scene does not exist.</h1>
        <p className="text-lg leading-8 text-stone-600">
          The invite link may have changed, expired, or been typed incorrectly.
        </p>
        <Link
          href="/"
          className="inline-flex rounded-full bg-stone-950 px-6 py-3 text-sm uppercase tracking-[0.28em] text-white"
        >
          Return home
        </Link>
      </div>
    </Container>
  );
}
