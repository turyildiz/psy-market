interface AuthModalProps {
  children: React.ReactNode;
  onClose?: () => void;
}

export function AuthModal({ children, onClose }: AuthModalProps) {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center px-4 py-8">
      {/* Backdrop — click to close */}
      <button
        type="button"
        aria-label="Close auth modal"
        className="absolute inset-0 z-0 cursor-default"
        onClick={onClose}
      />

      {/* Backdrop visual */}
      <div className="pointer-events-none absolute inset-0 bg-black/50 backdrop-blur-[2px]" />

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-[460px]"
        style={{ animation: "auth-fade-in-up 0.35s cubic-bezier(0.16, 1, 0.3, 1) both" }}
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute -top-3 -right-3 z-20 h-9 w-9 rounded-full bg-slate-800 border border-slate-700 text-slate-400 grid place-items-center hover:text-white hover:border-slate-600 transition-all duration-200 cursor-pointer"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <path d="M1 1l10 10M11 1L1 11" />
          </svg>
        </button>

        <div className="rounded-2xl bg-black border border-slate-800 shadow-2xl">
          {children}
        </div>
      </div>
    </div>
  );
}
