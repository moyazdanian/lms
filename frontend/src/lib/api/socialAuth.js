import request from "@/utilities/AxiosUtils";

// OAuth (Google) helpers. The actual flow is plain browser navigation to
// the backend — see GoogleButton — so there is no axios involvement here
// apart from managing the linked accounts on the profile page.

const backendUrl = (process.env.NEXT_PUBLIC_API_PROD_URL || "").replace(/\/+$/, "");

/**
 * Start the OAuth round-trip. Full-page navigation: the session/state live
 * on the backend domain, so CORS is never involved.
 */
export function startSocialAuth(provider, { redirect, intent } = {}) {
  const url = new URL(`${backendUrl}/auth/${provider}/redirect`);

  if (redirect) {
    url.searchParams.set("redirect", redirect);
  }
  if (intent) {
    url.searchParams.set("intent", intent);
  }

  window.location.href = url.toString();
}

export async function getSocialAccounts() {
  const res = await request({
    url: "/api/v1/auth/social-accounts",
    method: "GET",
  });
  return res;
}

export async function disconnectSocialAccount(id) {
  const res = await request({
    url: `/api/v1/auth/social-accounts/${id}`,
    method: "DELETE",
  });
  return res;
}
