import AuthGuard from "../../AuthGuard";
import CheckoutPage from "./CheckoutPage";

export const metadata = {
  title: "Checkout",
  description: "Proceed to checkout and complete your purchase.",
};

export default function Checkout() {
  return (
    <AuthGuard>
      <CheckoutPage />
    </AuthGuard>
  );
}
