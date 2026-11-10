import { redirect } from "next/navigation";

// Temporary shim: this page accidentally lived at /callback. The real
// OAuth landing page is /auth/callback. Safe to delete this folder.
export default function LegacyCallbackRedirect() {
  redirect("/auth/callback");
}
