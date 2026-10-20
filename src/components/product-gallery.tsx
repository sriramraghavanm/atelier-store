import Image from "next/image";

import { Frame } from "@/components/ui";
import type { Product } from "@/data/catalog";

/**
 * Product imagery, full-bleed and large.
 *
 * On phones it is a swipeable scroll-snap row, with the next frame peeking in
 * so the swipe is discoverable; from `lg` the frames simply stack down the
 * left column. CSS only — no carousel script.
 */
export function ProductGallery({
  images,
  name,
}: {
  images: Product["gallery"];
  name: string;
}) {
  return (
    <div
      role="group"
      aria-label={`${name} images`}
      className="flex gap-1 overflow-x-auto snap-x snap-mandatory lg:block lg:overflow-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {images.map((image, i) => (
        <div
          key={image.src}
          className="w-[88%] shrink-0 snap-start sm:w-[70%] lg:mb-1 lg:w-full"
        >
          <Frame ratio="product">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(min-width: 1024px) 50vw, 88vw"
              priority={i === 0}
            />
          </Frame>
        </div>
      ))}
    </div>
  );
}
