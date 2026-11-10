import { ShoppingCart } from "lucide-react";

export default function NavbarCartEmptyState() {
  return (
    <div className="py-8 text-center">
      <ShoppingCart className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
      <p className="text-gray-500 dark:text-gray-400">Your cart is empty</p>
      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
        Add some courses to get started
      </p>
    </div>
  );
}
