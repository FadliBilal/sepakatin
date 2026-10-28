import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://sepakatin.my.id").replace(/\/+$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/verify", "/pricing", "/auth/login", "/auth/register"],
        disallow: [
          "/api/",
          "/dashboard/",
          "/admin/",
          "/agreements/",
          "/review/",
          "/auth/callback",
          "/verify/*",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: ["/", "/verify", "/pricing", "/auth/login", "/auth/register"],
        disallow: [
          "/api/",
          "/dashboard/",
          "/admin/",
          "/agreements/",
          "/review/",
          "/auth/callback",
          "/verify/*",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
