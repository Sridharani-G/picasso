export const siteConfig = {
    name: "Picasso",
    description: "The premier platform for artists to share, discover, and be inspired.",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    links: {
        twitter: "https://twitter.com/picasso",
        github: "https://github.com/picasso",
    },
    // The short name used for mobile headers or tight spaces
    shortName: "Picasso",
};

export type SiteConfig = typeof siteConfig;
