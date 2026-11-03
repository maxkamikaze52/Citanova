import { backendUrl } from "./admin-proxy";
import { buildSnippet } from "./provisioning";

/** The paste-in tag, built from the PUBLIC addresses (same names as the backend .env). */
export function widgetTag(siteKey: string, title: string): string {
  const configured = process.env.PUBLIC_API_URL;
  if (!configured && process.env.NODE_ENV === "production") {
    // ASSISTANT_API_URL is the console's private route to the backend; it must
    // never be printed on a customer's public page.
    throw new Error("PUBLIC_API_URL must be set in production");
  }
  const apiUrl = (configured || backendUrl("")).replace(/\/+$/, "");
  return buildSnippet({
    widgetUrl: process.env.PUBLIC_WIDGET_URL || `${apiUrl}/api/widget/widget.js`,
    apiUrl,
    siteKey,
    title,
  });
}
