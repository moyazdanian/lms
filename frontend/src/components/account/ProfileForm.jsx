import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { UploadIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { FormField, fieldProps } from "../common/FormField";
import {
  phoneSchema,
  nameSchema,
  emailSchema,
  YupObject,
  avatarSchema,
} from "@/utilities/validation/ValidationSchema";
import { initials } from "@/lib/format";
import { useEditProfile } from "@/hooks/useEditProfile";
import { Formik } from "formik";
import ImageUploader from "../ui/image-uploader";

export function ProfileForm({ user }) {
  const { mutate: save, isPending: savePending } = useEditProfile();

  return (
    <Card>
      <CardHeader>
        <CardTitle as="h2">Profile details</CardTitle>
      </CardHeader>
      <CardContent>
        <Formik
          initialValues={{
            name: user?.name,
            email: user?.email,
            phone: user?.phone ?? "",
            avatar: null,
          }}
          validationSchema={YupObject({
            name: nameSchema,
            email: emailSchema,
            phone: phoneSchema,
            avatar: avatarSchema,
          })}
          onSubmit={async (values, { setErrors }) => {
            const formData = new FormData();
            formData.append("name", values.name);
            formData.append("email", values.email);
            if (values.phone) formData.append("phone", values.phone);
            if (values.avatar) formData.append("avatar", values.avatar);
            try {
              save(formData);
            } catch (err) {
              if (err.status === 422 && err.data?.errors) {
                setErrors(err.data.errors);
              }
            }
          }}
        >
          {({ errors, handleSubmit, getFieldProps, setFieldValue }) => (
            <form className="space-y-5" onSubmit={handleSubmit} noValidate>
              <div className="flex flex-wrap items-center gap-4">
                {/* <Avatar className="h-16 w-16">
                  {values.avatar ? (
                    <AvatarImage src={values.avatar} alt="" />
                  ) : null}
                  <AvatarFallback className="text-base">
                    {initials(values.name)}
                  </AvatarFallback>
                </Avatar> */}
                <ImageUploader
                  value={user?.avatar}
                  fallback={user?.name}
                  onChange={(file) => setFieldValue("avatar", file)}
                />
                
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <FormField id="name" label="Name" required error={errors.name}>
                  <Input {...getFieldProps("name")} />
                </FormField>
                <FormField
                  id="email"
                  label="Email"
                  required
                  error={errors.email}
                >
                  <Input
                    {...getFieldProps("email")}
                    type="email"
                    autoComplete="email"
                  />
                </FormField>
                <FormField id="phone" label="Phone" error={errors.phone}>
                  <Input
                    {...getFieldProps("phone")}
                    type="tel"
                    autoComplete="tel"
                    placeholder="+1 555 000 0000"
                  />
                </FormField>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={savePending}>
                  {savePending ? "Saving…" : "Save changes"}
                </Button>
              </div>
            </form>
          )}
        </Formik>
      </CardContent>
    </Card>
  );
}
