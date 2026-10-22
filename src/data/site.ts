/**
 * Static site content: campaign copy, the editorial block, the services row and
 * the navigation. None of it is catalogue data, so none of it has a table — it
 * lives here until there is a reason to make it editable.
 *
 * `unsplash` is exported because `src/db/seed.ts` builds the sample product
 * imagery with it too. Hotlinked sample photography only; `images.remotePatterns`
 * in `next.config.ts` allows exactly this host.
 */

export const unsplash = (id: string, w: number, h: number, crop?: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&q=80&w=${w}&h=${h}` +
  (crop ? `&crop=${crop}` : "");

/* ---------------------------------------------------------------- Campaign */

export const campaign = {
  season: "Autumn / Winter 2026",
  headline: "A quieter silhouette",
  standfirst:
    "Outerwear cut close to the body, in wool, leather and heavy knit. Photographed in Milan.",
  cta: { label: "Shop the collection", href: "/collections/autumn-winter" },
  image: unsplash("photo-1539109136881-3be0616acf4b", 2000, 1250),
  alt: "Model in a pale blue coat and scarf standing in a city piazza",
};

/* --------------------------------------------------------------- Editorial */

export const editorial = {
  eyebrow: "The Atelier Journal",
  title: "On the cutting floor",
  body: "Three of our pattern cutters on proportion, the weight of a hem, and why a coat should feel heavier than it looks.",
  cta: { label: "Read the story", href: "/journal/on-the-cutting-floor" },
  image: unsplash("photo-1533659828870-95ee305cee3e", 1200, 1500),
  alt: "Woman in a long pleated skirt turning on a city street",
};

/* ---------------------------------------------------------------- Services */

export const services = [
  {
    title: "Complimentary delivery",
    body: "On every order, with signature required on arrival.",
  },
  {
    title: "Thirty-day returns",
    body: "Collected from your address at no cost.",
  },
  {
    title: "Boutique appointments",
    body: "One-to-one styling in any of our fourteen stores.",
  },
];

/* --------------------------------------------------------------- Navigation */

export const primaryNav = [
  { label: "New In", href: "/collections/new-in" },
  { label: "Women", href: "/women" },
  { label: "Men", href: "/men" },
  { label: "Bags", href: "/collections/bags" },
  { label: "Journal", href: "/journal" },
];

export const footerNav = [
  {
    title: "Client Services",
    links: [
      { label: "Contact Us", href: "/contact" },
      { label: "Shipping", href: "/shipping" },
      { label: "Returns", href: "/returns" },
      { label: "Order Tracking", href: "/orders" },
    ],
  },
  {
    title: "The House",
    links: [
      { label: "Our Story", href: "/about" },
      { label: "Sustainability", href: "/sustainability" },
      { label: "Careers", href: "/careers" },
      { label: "Stores", href: "/stores" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Sale", href: "/terms" },
      { label: "Cookie Settings", href: "/cookies" },
      { label: "Accessibility", href: "/accessibility" },
    ],
  },
];
