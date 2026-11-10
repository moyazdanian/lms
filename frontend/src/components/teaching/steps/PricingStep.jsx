import React from "react";
import { Input } from "../../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Card, CardContent } from "../../ui/card";
import { Separator } from "../../ui/separator";
import { FormField, fieldProps } from "../../common/FormField";
import { CURRENCIES } from "@/config/courses";
import { finalPrice } from "@/lib/validation/course";
import { formatCurrency } from "@/lib/format";

export function PricingStep({ values, setField, errors }) {
  const price = Number(values.price || 0);
  // The field holds the price students pay after the discount — the same value
  // the API stores in `discount_price`. The amount off and the percentage are
  // derived from it, so a $100 course discounted to $89 shows a $11 / 11% cut
  // and a $89 final price everywhere in the form.
  const discountPrice = Number(values.discount || 0);
  const hasDiscount = price > 0 && discountPrice > 0 && discountPrice < price;
  const discountAmount = hasDiscount ? price - discountPrice : 0;
  const discountPercent = hasDiscount
    ? Math.round((discountAmount * 100) / price)
    : 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-5">
        <FormField
          id="price"
          label="Price"
          required
          error={errors.price}
          hint="Use 0 for a free course"
        >
          <Input
            {...fieldProps("price", errors.price)}
            type="number"
            min="0"
            step="1"
            inputMode="decimal"
            value={values.price}
            placeholder="129"
            onChange={(event) => setField("price", event.target.value)}
          />
        </FormField>

        <FormField
          id="discount"
          label="Discounted price"
          error={errors.discount}
          hint={
            hasDiscount
              ? `≈ ${discountPercent}% off the list price — students pay this`
              : "Leave empty when the course is not discounted"
          }
        >
          <Input
            {...fieldProps("discount", errors.discount)}
            type="number"
            min="0"
            step="1"
            inputMode="decimal"
            value={values.discount}
            placeholder="0"
            onChange={(event) => setField("discount", event.target.value)}
          />
        </FormField>

        <FormField
          id="currency"
          label="Currency"
          required
          error={errors.currency}
        >
          <Select
            value={values.currency}
            onValueChange={(value) => setField("currency", value)}
          >
            <SelectTrigger {...fieldProps("currency", errors.currency)}>
              <SelectValue placeholder="Choose a currency" />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <Card className="h-fit bg-muted/40">
        <CardContent className="space-y-3 p-5">
          <p className="text-sm font-semibold">What students pay</p>
          <dl className="space-y-2 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Original price</dt>
              <dd>{formatCurrency(price, values.currency)}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">
                Discount {discountPercent ? `(${discountPercent}%)` : ""}
              </dt>
              <dd className={hasDiscount ? "text-success" : undefined}>
                −{formatCurrency(discountAmount, values.currency)}
              </dd>
            </div>
            <Separator />
            <div className="flex items-center justify-between gap-4 text-base font-semibold">
              <dt>Final price</dt>
              <dd>{formatCurrency(finalPrice(values), values.currency)}</dd>
            </div>
          </dl>
          <p className="text-xs text-muted-foreground">
            Platform fee and your earnings are calculated at checkout and shown
            on the Earnings page.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
