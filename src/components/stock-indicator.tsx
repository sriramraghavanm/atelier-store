import { stockLabel, type Product } from "@/lib/catalog";
import { cn } from "@/lib/cn";

/**
 * Stock state. The palette is achromatic, so the wording carries the meaning
 * and only the out-of-stock case is allowed colour.
 */
export function StockIndicator({
  stock,
  stockCount,
  className,
}: Pick<Product, "stock" | "stockCount"> & { className?: string }) {
  const label =
    stock === "low_stock" && stockCount
      ? `Only ${stockCount} left`
      : stockLabel[stock];

  return (
    <p
      className={cn(
        "label-sm flex items-center gap-2",
        stock === "out_of_stock" ? "text-critical" : "text-ink",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "size-1.5 rounded-full",
          stock === "out_of_stock"
            ? "bg-critical"
            : stock === "low_stock"
              ? "bg-ink"
              : "bg-ink-subtle",
        )}
      />
      {label}
    </p>
  );
}
