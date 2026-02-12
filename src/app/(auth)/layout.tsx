import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--dark-1)]">
      <Link href="/" className="mb-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Psy.Market" className="h-10 w-auto" />
      </Link>
      <div className="w-full max-w-md px-4">{children}</div>
    </div>
  );
}
