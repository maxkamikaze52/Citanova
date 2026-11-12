import type { MetadataRoute } from "next";
import { SITE } from "../lib/site";

const paths = ["/", "/pricing", "/signup", "/login", "/contact", "/privacy", "/terms", "/cookies", "/legal-notice"];

export default function sitemap(): MetadataRoute.Sitemap {
  return paths.map((p) => ({ url: `${SITE.url}${p}`, changeFrequency: p === "/" ? "weekly" : "monthly", priority: p === "/" ? 1 : 0.6 }));
}
