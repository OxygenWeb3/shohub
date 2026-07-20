import type { Category } from "@/lib/queries";

const colors: Record<Category, string> = {
  AI: "bg-violet-50 text-violet-700 ring-violet-200",
  DePIN: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Gaming: "bg-pink-50 text-pink-700 ring-pink-200",
  Infrastructure: "bg-amber-50 text-amber-700 ring-amber-200",
  Storage: "bg-blue-50 text-blue-700 ring-blue-200",
  Other: "bg-slate-100 text-slate-700 ring-slate-200",
};

export function CategoryChip({ category }: { category: Category }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${colors[category]}`}
    >
      {category}
    </span>
  );
}
