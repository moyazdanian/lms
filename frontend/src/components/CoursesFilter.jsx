import { Checkbox } from "./ui/checkbox";
import { Slider } from "./ui/slider";

export default function CoursesFilter({
  categories,
  selectedCategories,
  toggleCategory,
  onlyFree,
  setOnlyFree,
  priceRange,
  setPriceRange,
}) {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="font-semibold mb-2">Categories</h4>
        {categories.map((cat, i) => (
          <label key={i} className="flex items-center space-x-2">
            <Checkbox
              checked={selectedCategories.includes(cat.name)}
              onCheckedChange={() => toggleCategory(cat.name)}
            />
            <span>{cat.name}</span>
          </label>
        ))}
      </div>

      <div>
        <h4 className="font-semibold mb-2">Price</h4>
        <Slider
          step={10}
          value={priceRange}
          onValueChange={setPriceRange}
        />
        <p className="text-sm mt-2">
          ${priceRange[0]} - ${priceRange[1]}
        </p>
      </div>

      <div>
        <label className="flex items-center space-x-2">
          <Checkbox
            checked={onlyFree}
            onCheckedChange={(val) => setOnlyFree(val)}
          />
          <span>Free only</span>
        </label>
      </div>
    </div>
  );
}
