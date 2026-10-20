import Image from "next/image";
import Link from "next/link";

import { Frame, Label, Stack } from "@/components/ui";
import { type Collection } from "@/data/catalog";

/**
 * Collection tile: taller 2:3 media than a product tile, so a row of three
 * reads as editorial rather than as a listing.
 */
export function CollectionCard({ collection }: { collection: Collection }) {
  return (
    <article>
      <Link href={collection.href} className="group block">
        <Frame ratio="portrait">
          <Image
            src={collection.image}
            alt={collection.alt}
            fill
            sizes="(min-width: 768px) 33vw, 100vw"
            className="transition-transform duration-500 ease-brand group-hover:scale-[1.03]"
          />
        </Frame>
        <Stack gap="2" className="pt-4">
          <Label as="h3" size="sm">
            {collection.name}
          </Label>
          <p className="text-sm text-ink-muted">{collection.caption}</p>
          <span className="label group-hover:underline underline-offset-2">
            Discover
          </span>
        </Stack>
      </Link>
    </article>
  );
}
