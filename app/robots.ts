import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://sepakatin.id";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/contoh-dokumen", "/verify", "/auth/login", "/auth/register"],
        disallow: [
          "/api/",
          "/dashboard/",
          "/admin/",
          "/agreements/",
          "/review/",
          "/auth/callback",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
