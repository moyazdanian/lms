"use client";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { WalletIcon } from "lucide-react";
import * as Yup from "yup";
import { useFormik } from "formik";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

import { Button } from "../ui/button";
import { Input } from "../ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

import { FormField, fieldProps } from "../common/FormField";
import { formatCurrency } from "@/lib/format";
import { useCreateInstructorPayoutRequest } from "@/hooks/instructor/useInstructorMarketplace";

export function PayoutRequestDialog({ balance, onSuccess, disabled }) {
  const [open, setOpen] = useState(false);

  // const { mutate, pending, fieldErrors, reset } = useMutation((payload) =>
  //   requestPayout(payload),
  // );

  const {
    mutate,
    isPending: pending,
    errors: fieldErrors,
  } = useCreateInstructorPayoutRequest();

  const methods = balance?.payment_methods || [];
  const available = Number(balance?.available_balance || 0);
  const minimum = Number(balance?.minimum_payout_amount || 0);
  const currency = balance?.currency || "USD";

  const defaultMethod = methods[0];

  const validationSchema = useMemo(() => {
    return Yup.object({
      amount: Yup.number()
        .typeError("Enter a valid amount.")
        .required("Enter an amount.")
        .moreThan(0, "Enter an amount greater than 0.")
        .min(
          minimum,
          `The minimum payout is ${formatCurrency(minimum, currency)}.`,
        )
        .max(
          available,
          `That exceeds your available balance of ${formatCurrency(
            available,
            currency,
          )}.`,
        ),

      method: Yup.string().required("Choose a payment method."),

      account: Yup.string()
        .trim()
        .required("Add the account this payout should be sent to."),
    });
  }, [minimum, available, currency]);

  const formik = useFormik({
    enableReinitialize: true,

    initialValues: {
      amount: "",
      method: defaultMethod?.value || "",
      account: defaultMethod?.account_label || "",
    },

    validationSchema,

    onSubmit: (values, { resetForm }) => {
      const result = mutate({
        amount: Number(values.amount),
        currency,
        method: values.method,
        account: values.account.trim(),
      });

      if (result.ok) {
        setOpen(false);

        toast.success("Payout requested", {
          description: `${formatCurrency(
            Number(values.amount),
            currency,
          )} is now pending review.`,
        });

        resetForm();
        onSuccess?.();

        return;
      }

      if (!result.error?.errors) {
        toast.error(
          result.error?.message || "We could not submit your request.",
        );
      }
    },
  });

  // Admin-configured methods each tell the instructor what to enter via
  // their account_label — used as the account field's hint/placeholder.
  const selectedMethod = methods.find(
    (item) => item.value === formik.values.method,
  );

  /*
   * Reset form whenever dialog opens.
   */
  useEffect(() => {
    if (!open) return;

    const method = methods[0];

    formik.resetForm({
      values: {
        amount: "",
        method: method?.value || "",
        account: method?.account_label || "",
      },
    });
  }, [open]);

  /*
   * Server-side validation errors
   */
  const serverError = (field) => {
    const messages = fieldErrors?.[field];

    return Array.isArray(messages) ? messages[0] : messages;
  };

  /*
   * Prefer Yup error, then server error.
   */
  const getFieldError = (field) => {
    if (formik.touched[field] && formik.errors[field]) {
      return formik.errors[field];
    }

    return serverError(field);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={disabled}>
          <WalletIcon aria-hidden="true" />
          Request Payout
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request a payout</DialogTitle>
        </DialogHeader>

        {/* Balance information */}
        <div className="flex items-center justify-between gap-4 rounded-md border border-border bg-muted/50 p-3">
          <div>
            <p className="text-xs text-muted-foreground">Available balance</p>

            <p className="text-lg font-semibold">
              {formatCurrency(available, currency)}
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs text-muted-foreground">Minimum payout</p>

            <p className="text-sm font-medium">
              {formatCurrency(minimum, currency)}
            </p>
          </div>
        </div>

        <form className="space-y-4" onSubmit={formik.handleSubmit} noValidate>
          {/* Amount */}
          <FormField
            id="payout-amount"
            label="Amount"
            required
            error={getFieldError("amount")}
            hint={currency}
          >
            <Input
              {...fieldProps("payout-amount", getFieldError("amount"))}
              id="payout-amount"
              name="amount"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={formik.values.amount}
              placeholder={String(minimum)}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </FormField>

          {/* Payment method */}
          <FormField
            id="payout-method"
            label="Payment method"
            required
            error={getFieldError("method")}
          >
            <Select
              value={formik.values.method}
              onValueChange={(method) => {
                const selectedMethod = methods.find(
                  (item) => item.value === method,
                );

                formik.setFieldValue("method", method);

                formik.setFieldValue(
                  "account",
                  selectedMethod?.account_label || "",
                );

                formik.setFieldTouched("method", true);
              }}
            >
              <SelectTrigger
                {...fieldProps("payout-method", getFieldError("method"))}
                id="payout-method"
              >
                <SelectValue placeholder="Choose a method" />
              </SelectTrigger>

              <SelectContent>
                {methods.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          {/* Payment account — the hint adapts to the chosen method */}
          <FormField
            id="payout-account"
            label="Payment account"
            required
            error={getFieldError("account")}
            hint={
              selectedMethod?.account_label
                ? `e.g. ${selectedMethod.account_label}`
                : "Where the money goes"
            }
          >
            <Input
              {...fieldProps("payout-account", getFieldError("account"))}
              id="payout-account"
              name="account"
              placeholder={
                selectedMethod?.account_label || "Where the money goes"
              }
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </FormField>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={pending}>
              {pending ? "Submitting…" : "Request payout"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
