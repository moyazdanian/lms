export const metadata = {
  // Child page titles (none currently set) fall back to this; the
  // storefront template renders it as "LMS - Sign In".
  title: {
    template: "%s",
    default: "Sign In",
  },
};

export default function AuthLayout({ children }) {
  return <>{children}</>;
}
