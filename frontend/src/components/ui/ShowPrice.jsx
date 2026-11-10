export default function ShowPrice({ price, discount_price = null }) {
  if (discount_price) {
    return (
      <div className="text-sm">
        <span className="text-lg font-bold text-gray-600 dark:text-gray-300"></span>
        <span className="text-lg font-bold text-red-500">
          ${discount_price}
        </span>
        <span className="line-through text-gray-500 dark:text-gray-400 ml-2">
          ${price}
        </span>
      </div>
    );
  } else {
    return (
      <span className="text-lg font-bold text-gray-600 dark:text-gray-300">
        ${price}
      </span>
    );
  }
}
