import React from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField, fieldProps } from "@/components/common/FormField";
import { usePasswordReset } from "@/hooks/usePasswordReset";

const EMPTY = { current_password: "", password: "", password_confirmation: "" };

const validationSchema = Yup.object({
  current_password: Yup.string().required("Enter your current password."),
  password: Yup.string()
    .required("Enter a new password.")
    .min(8, "Use at least 8 characters."),
  password_confirmation: Yup.string()
    .required("Confirm your new password.")
    .oneOf([Yup.ref("password")], "Passwords do not match."),
});

/** Password changes are deliberately separate from the profile update. */
export function PasswordForm() {
  const { mutate, isPending } = usePasswordReset();

  return (
    <Formik
      initialValues={EMPTY}
      validationSchema={validationSchema}
      onSubmit={async (values, { setErrors, resetForm }) => {
        const formData = new FormData();
        formData.append("current_password", values.current_password);
        formData.append("password", values.password);
        formData.append("password_confirmation", values.password_confirmation);
        try {
          mutate(formData);
          resetForm();
        } catch (err) {
          if (err.status === 422 && err.data?.errors) {
            setErrors(err.data.errors);
          }
        }
      }}
    >
      {({ errors, handleSubmit, getFieldProps }) => (
        <Card>
          <CardHeader>
            <CardTitle as="h2">Change Password</CardTitle>
            <CardDescription>
              You will stay signed in on this device after changing it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form className="space-y-5" noValidate onSubmit={handleSubmit}>
              <FormField
                id="current_password"
                label="Current password"
                required
                error={errors.current_password}
              >
                <Input
                  {...getFieldProps("current_password")}
                  type="password"
                  autoComplete="current-password"
                  name="current_password"
                />
              </FormField>

              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  id="password"
                  label="New password"
                  required
                  error={errors.password}
                  hint="8+ characters"
                >
                  <Input
                    {...getFieldProps("password")}
                    type="password"
                    autoComplete="new-password"
                    name="password"
                  />
                </FormField>
                <FormField
                  id="password_confirmation"
                  label="Confirm new password"
                  required
                  error={errors.password_confirmation}
                >
                  <Input
                    {...getFieldProps("password_confirmation")}
                    type="password"
                    autoComplete="new-password"
                    name="password_confirmation"
                  />
                </FormField>
              </div>

              <div className="flex justify-end">
                <Button type="submit" variant="outline" disabled={isPending}>
                  {isPending ? "Updating…" : "Update password"}
                </Button>
              </div>
            </Form>
          </CardContent>
        </Card>
      )}
    </Formik>
  );
}
