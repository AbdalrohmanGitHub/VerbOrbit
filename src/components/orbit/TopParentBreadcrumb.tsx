"use client";

type ParentProps = {
  kicker: string;
  title: string;
  onClick: () => void;
};

export function TopParentBreadcrumb({ kicker, title, onClick }: ParentProps) {
  return (
    <button
      type="button"
      id="orbit-parent"
      onClick={onClick}
      className="absolute top-2 left-1/2 z-20 flex min-h-11 -translate-x-1/2 flex-col items-center"
    >
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-sky-500 px-2 text-center text-xs font-extrabold text-white shadow-md">
        {title}
      </span>
      <span className="mt-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">{kicker}</span>
    </button>
  );
}
