export default function ShowPrice({ price, discount_price = null }) {
  if (discount_price) {
    return (
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <span className="text-lg font-bold text-red-500">
          ${discount_price}
        </span>
        <span className="text-sm line-through text-gray-500 dark:text-gray-400">
          ${price}
        </span>
      </div>
    );
  }

  return (
    <span className="text-lg font-bold text-gray-600 dark:text-gray-300">
      ${price}
    </span>
  );
}
