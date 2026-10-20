import Image from "next/image";
import Link from "next/link";

import { Frame, Stack } from "@/components/ui";
import { formatPrice, type Product } from "@/data/catalog";

/**
 * Product tile: 4:5 media, centred copy beneath, generous trailing space so the
 * grid breathes. The image lifts very slightly on hover — the only motion in
 * the grid.
 */
export function ProductCard({
  product,
  sizes = "(min-width: 1024px) 25vw, 50vw",
  priority = false,
}: {
  product: Product;
  sizes?: string;
  priority?: boolean;
}) {
  return (
    <article>
      <Link href={product.href} className="group block">
        <Frame ratio="product">
          <Image
            src={product.image}
            alt={product.alt}
            fill
            sizes={sizes}
            priority={priority}
            className="transition-transform duration-500 ease-brand group-hover:scale-[1.03]"
          />
        </Frame>
        <Stack gap="1" align="center" className="pt-3 pb-6 lg:pt-6 lg:pb-14">
          <h3 className="text-sm font-medium">{product.name}</h3>
          <p className="text-xs text-ink-muted">{product.detail}</p>
          <p className="text-sm">{formatPrice(product.priceCents)}</p>
        </Stack>
      </Link>
    </article>
  );
}
