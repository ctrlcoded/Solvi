"use client";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex h-[calc(100vh-64px)] w-full items-center justify-center p-6">
      <div className="glass-panel p-8 text-center rounded-2xl max-w-md border-error/30 bg-error/5">
        <span className="material-symbols-outlined text-[48px] text-error mb-4">error_outline</span>
        <h2 className="font-headline-md text-[24px] font-bold text-on-surface mb-2">Something went wrong!</h2>
        <p className="text-on-surface-variant font-body-sm mb-6 opacity-80 break-words">{error.message || "An unexpected error occurred."}</p>
        <button
          onClick={() => reset()}
          className="bg-error text-on-error px-6 py-2 rounded-lg font-label-md font-bold hover:scale-105 active:scale-95 transition-transform"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
