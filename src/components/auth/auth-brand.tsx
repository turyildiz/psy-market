import Link from "next/link";

export function AuthBrand() {
  return (
    <Link
      href="/"
      className="mx-auto mb-1 flex w-fit items-center justify-center relative group"
    >
      <div className="absolute inset-0 bg-[#FF6B35]/15 blur-2xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo.png"
        alt="Psy.Market"
        className="relative h-8 w-auto max-w-[180px] opacity-80 group-hover:opacity-100 transition-opacity duration-300"
      />
    </Link>
  );
}
