// components/FiltersSidebar.jsx
"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function FiltersSidebar({
  // State props
  onlyFree,
  setOnlyFree,
  priceRange,
  setPriceRange,
  sort,
  setSort,
  category,
  setCategory,

  // Configuration props
  categories = [],
  showCategoryFilter = false,
  showLevelFilter = false,
  showRatingFilter = false,
  maxPrice = 3000,

  // UI props
  title = "Filters",
  showResetButton = true,
  onReset,
}) {

  const handleReset = () => {
    setOnlyFree(false);
    setPriceRange([0, maxPrice]);
    setSort("popular");
    if (setCategory) setCategory(null);
    if (onReset) onReset();
  };

  // Mobile Sheet Component
  const MobileFilters = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="md:hidden w-40">
          <SlidersHorizontal className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-60 p-6 overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center justify-between">
            <span>{title}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-1"
              onClick={handleReset}
            >
              <X className="w-4 h-4 mr-1" />
              Reset
            </Button>
          </SheetTitle>
        </SheetHeader>
        <FiltersContent
          onlyFree={onlyFree}
          setOnlyFree={setOnlyFree}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          sort={sort}
          setSort={setSort}
          category={category}
          setCategory={setCategory}
          categories={categories}
          showCategoryFilter={showCategoryFilter}
          showLevelFilter={showLevelFilter}
          showRatingFilter={showRatingFilter}
          maxPrice={maxPrice}
          isMobile={true}
        />
      </SheetContent>
    </Sheet>
  );

  // Desktop Sidebar Component
  const DesktopFilters = () => (
    <div className="hidden md:block w-64 lg:w-72 flex-shrink-0">
      <div className="sticky top-6">
        <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                {title}
              </div>
              {showResetButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-1 text-xs"
                  onClick={handleReset}
                >
                  Reset All
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FiltersContent
              onlyFree={onlyFree}
              setOnlyFree={setOnlyFree}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              sort={sort}
              setSort={setSort}
              category={category}
              setCategory={setCategory}
              categories={categories}
              showCategoryFilter={showCategoryFilter}
              showLevelFilter={showLevelFilter}
              showRatingFilter={showRatingFilter}
              maxPrice={maxPrice}
              isMobile={false}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <>
      <MobileFilters />
      <DesktopFilters />
    </>
  );
}

// Inner content component
function FiltersContent({
  onlyFree,
  setOnlyFree,
  priceRange,
  setPriceRange,
  sort,
  setSort,
  category,
  setCategory,
  categories,
  showCategoryFilter,
  showLevelFilter,
  showRatingFilter,
  maxPrice,
  isMobile,
}) {
  return (
    <div className="space-y-6">
      {/* Sort Filter */}
      {/* <div className={isMobile ? "mb-6" : ""}>
        <Label className="font-semibold mb-2 block">Sort by</Label>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popular">Most Popular</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div> */}

      {/* Category Filter */}
      {showCategoryFilter && categories.length > 0 && (
        <div>
          <Label className="font-semibold mb-2 block">Category</Label>
          <Select
            value={category || "all"}
            onValueChange={(val) => setCategory(val === "all" ? null : val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.slug}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Price Filter */}
      <div>
        <Label className="font-semibold mb-3 block">Price Range</Label>
        <div className="space-y-4">
          <Slider
            min={0}
            max={maxPrice}
            step={10}
            value={priceRange}
            onValueChange={setPriceRange}
            className="py-4"
          />
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">${priceRange[0]}</div>
            <div className="text-sm text-gray-500">to</div>
            <div className="text-sm font-medium">${priceRange[1]}</div>
          </div>

          {/* Quick Price Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={
                priceRange[0] === 0 && priceRange[1] === maxPrice
                  ? "default"
                  : "outline"
              }
              onClick={() => setPriceRange([0, maxPrice])}
            >
              All Prices
            </Button>
            <Button
              size="sm"
              variant={
                priceRange[0] === 0 && priceRange[1] === 0
                  ? "default"
                  : "outline"
              }
              onClick={() => setPriceRange([0, 0])}
            >
              Free
            </Button>
            <Button
              size="sm"
              variant={
                priceRange[0] === 0 && priceRange[1] === 50
                  ? "default"
                  : "outline"
              }
              onClick={() => setPriceRange([0, 50])}
            >
              Under $50
            </Button>
          </div>
        </div>
      </div>

      {/* Free Only Filter */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="font-semibold block">Free Courses</Label>
            <p className="text-sm text-gray-500">Show only free courses</p>
          </div>
          <Checkbox
            checked={onlyFree}
            onCheckedChange={(val) => setOnlyFree(val)}
            className="h-5 w-5"
          />
        </div>
      </div>

      {/* Level Filter */}
      {showLevelFilter && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <Label className="font-semibold mb-3 block">Level</Label>
          <div className="space-y-2">
            {["All Levels", "Beginner", "Intermediate", "Advanced"].map(
              (level) => (
                <div key={level} className="flex items-center space-x-2">
                  <Checkbox id={`level-${level}`} />
                  <Label
                    htmlFor={`level-${level}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {level}
                  </Label>
                </div>
              ),
            )}
          </div>
        </div>
      )}

      {/* Rating Filter */}
      {showRatingFilter && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <Label className="font-semibold mb-3 block">Minimum Rating</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Any rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any rating</SelectItem>
              <SelectItem value="4.5">4.5+ stars</SelectItem>
              <SelectItem value="4.0">4.0+ stars</SelectItem>
              <SelectItem value="3.5">3.5+ stars</SelectItem>
              <SelectItem value="3.0">3.0+ stars</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
