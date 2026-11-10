import React, { useEffect, useState } from "react";
import * as Yup from "yup";
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
import { Skeleton } from "../ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { FormField, fieldProps } from "../common/FormField";
import { YupObject } from "@/utilities/validation/ValidationSchema";
import { Formik } from "formik";
import ImageUploader from "../ui/image-uploader";
import {
  useInstructorProfile,
  useInstructorProfileUpdate,
} from "@/hooks/instructor/useIntructorProfile";

export function InstructorForm({ user }) {
  const { mutate, isPending: isSaving } = useInstructorProfileUpdate();
  const {
    data: instructor,
    isPending,
    isFetching,
    error,
  } = useInstructorProfile();

  const socialLinks = (() => {
    if (!instructor?.social_links) return {};
    if (typeof instructor.social_links === "object") {
      return instructor.social_links;
    }

    try {
      return JSON.parse(instructor.social_links);
    } catch {
      return {};
    }
  })();

  const loading = isPending || isFetching;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-5 w-full max-w-xl" />
        </CardHeader>
        <CardContent>
          <div className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-24 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-24 w-full" />
              </div>
              {["Instagram", "Facebook", "Twitter", "YouTube", "LinkedIn", "Telegram"].map(
                (label) => (
                  <div className="space-y-2" key={label}>
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ),
              )}
            </div>
            <div className="flex justify-end">
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle as="h2">Instructor details</CardTitle>
        <CardDescription>
          This information appears on your public instructor and student
          profile.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Formik
          initialValues={{
            bio: instructor?.bio,
            expertise: instructor?.expertise,
            social_links: {
              instagram: socialLinks.instagram || "",
              facebook: socialLinks.facebook || "",
              twitter: socialLinks.twitter || "",
              youtube: socialLinks.youtube || "",
              linkedin: socialLinks.linkedin || "",
              telegram: socialLinks.telegram || "",
            },
          }}
          validationSchema={YupObject({
            bio: Yup.string()
              .nullable()
              .max(1000, "Bio must be 1000 characters or fewer"),
            expertise: Yup.string()
              .nullable()
              .max(255, "Expertise must be 255 characters or fewer"),
            social_links: Yup.object().nullable(),
          })}
          onSubmit={async (values, { setErrors }) => {
            const formData = new FormData();
            formData.append("bio", values.bio);
            formData.append("expertise", values.expertise);
            if (values.social_links)
              formData.append(
                "social_links",
                JSON.stringify(values.social_links),
              );
            try {
              mutate(formData);
            } catch (err) {
              if (err.status === 422 && err.data?.errors) {
                setErrors(err.data.errors);
              }
            }
          }}
        >
          {({ errors, handleSubmit, getFieldProps, setFieldValue }) => (
            <form className="space-y-5" onSubmit={handleSubmit} noValidate>
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField id="bio" label="Bio" required error={errors.bio}>
                  <Textarea {...getFieldProps("bio")} />
                </FormField>
                <FormField
                  id="expertise"
                  label="expertise"
                  required
                  error={errors.expertise}
                >
                  <Textarea {...getFieldProps("expertise")} />
                </FormField>
                {[
                  ["instagram", "Instagram", "https://instagram.com/username"],
                  ["facebook", "Facebook", "https://facebook.com/username"],
                  ["twitter", "Twitter", "https://twitter.com/username"],
                  ["youtube", "YouTube", "https://youtube.com/@username"],
                  ["linkedin", "LinkedIn", "https://linkedin.com/in/username"],
                  ["telegram", "Telegram", "https://telegram.me/username"],
                ].map(([name, label, placeholder]) => (
                  <FormField
                    key={name}
                    id={`social_links.${name}`}
                    label={label}
                    error={errors.social_links?.[name]}
                  >
                    <Input
                      {...getFieldProps(`social_links.${name}`)}
                      type="url"
                      placeholder={placeholder}
                    />
                  </FormField>
                ))}
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving…" : "Save changes"}
                </Button>
              </div>
            </form>
          )}
        </Formik>
      </CardContent>
    </Card>
  );
}
