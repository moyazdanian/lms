"use client";

import { useState } from "react";
import Link from "next/link";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import {
  Loader2,
  GraduationCap,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useInstructorApplication } from "@/hooks/useInstructorApplication";

const SOCIAL_FIELDS = [
  { key: "website", label: "Website" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "twitter", label: "X (Twitter)" },
  { key: "youtube", label: "YouTube" },
];

const applicationSchema = Yup.object().shape({
  bio: Yup.string()
    .required("Bio is required")
    .min(50, "Bio must be at least 50 characters"),
  expertise: Yup.string()
    .required("Expertise is required")
    .max(255, "Expertise is too long"),
  website: Yup.string().url("Must be a valid URL").nullable(),
  linkedin: Yup.string().url("Must be a valid URL").nullable(),
  twitter: Yup.string().url("Must be a valid URL").nullable(),
  youtube: Yup.string().url("Must be a valid URL").nullable(),
});

function ApplicationForm({ application, submitMutation, onSubmitted }) {
  const initialValues = {
    bio: application?.bio || "",
    expertise: application?.expertise || "",
    website: application?.social_links?.website || "",
    linkedin: application?.social_links?.linkedin || "",
    twitter: application?.social_links?.twitter || "",
    youtube: application?.social_links?.youtube || "",
  };

  const handleSubmit = (values) => {
    const social_links = {};
    SOCIAL_FIELDS.forEach(({ key }) => {
      if (values[key]) social_links[key] = values[key];
    });

    submitMutation.mutate(
      {
        bio: values.bio,
        expertise: values.expertise,
        social_links,
      },
      { onSuccess: onSubmitted }
    );
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={applicationSchema}
      onSubmit={handleSubmit}
    >
      {({ values, errors, touched, handleChange, handleBlur }) => (
        <Form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="expertise">Expertise *</Label>
            <Input
              id="expertise"
              name="expertise"
              placeholder="e.g. Web Development, UI/UX Design"
              value={values.expertise}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {touched.expertise && errors.expertise && (
              <p className="text-sm text-red-500">{errors.expertise}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio *</Label>
            <Textarea
              id="bio"
              name="bio"
              rows={6}
              placeholder="Tell us about yourself, your experience and what you want to teach (at least 50 characters)..."
              value={values.bio}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {touched.bio && errors.bio && (
              <p className="text-sm text-red-500">{errors.bio}</p>
            )}
          </div>

          <div>
            <p className="font-medium mb-2">Social Links (optional)</p>
            <div className="grid gap-4 sm:grid-cols-2">
              {SOCIAL_FIELDS.map(({ key, label }) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={key}>{label}</Label>
                  <Input
                    id={key}
                    name={key}
                    placeholder="https://..."
                    value={values[key]}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {touched[key] && errors[key] && (
                    <p className="text-sm text-red-500">{errors[key]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={submitMutation.isPending}>
              {submitMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Submit Application
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}

export default function BecomeInstructor() {
  const { user  } = useAuthGuard();
  const { applicationQuery, submitMutation } = useInstructorApplication();
  const [reapplying, setReapplying] = useState(false);

  if (applicationQuery.isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const application = applicationQuery.data?.application;
  const isInstructor = 
    applicationQuery.data?.is_instructor ||
    ["instructor", "admin"].includes(user?.role);

  // Already an instructor (or just approved)
  if (isInstructor || application?.status === "approved") {
    return (
      <div className="text-center py-8 space-y-4">
        <CheckCircle2 className="w-16 h-16 mx-auto text-green-500" />
        <h3 className="text-xl font-bold">You are an instructor!</h3>
        <p className="text-gray-600 dark:text-gray-400">
          You can create and manage your courses from the Teaching section.
        </p>
        <Button asChild>
          <Link href="/dashboard/teaching">Go to Teaching</Link>
        </Button>
      </div>
    );
  }

  // Pending review
  if (application?.status === "pending") {
    return (
      <div className="text-center py-8 space-y-4">
        <Clock className="w-16 h-16 mx-auto text-blue-500" />
        <h3 className="text-xl font-bold">Application under review</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Your application has been submitted and is being reviewed by our
          team. We'll get back to you soon.
        </p>
      </div>
    );
  }

  // Rejected
  if (application?.status === "rejected" && !reapplying) {
    return (
      <div className="text-center py-8 space-y-4">
        <XCircle className="w-16 h-16 mx-auto text-red-500" />
        <h3 className="text-xl font-bold">Application rejected</h3>
        {application.admin_note && (
          <div className="max-w-md mx-auto text-left border rounded-lg p-4 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800">
            <p className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">
              Reason:
            </p>
            <p className="text-sm text-red-700 dark:text-red-400 whitespace-pre-line">
              {application.admin_note}
            </p>
          </div>
        )}
        <p className="text-gray-600 dark:text-gray-400">
          You can update your application and apply again.
        </p>
        <Button onClick={() => setReapplying(true)}>Apply Again</Button>
      </div>
    );
  }

  // No application yet, or re-applying after rejection
  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="px-0">
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="w-6 h-6" />
          Become an Instructor
        </CardTitle>
        <p className="text-sm text-gray-500">
          Share your knowledge with thousands of students. Fill out the form
          below and our team will review your application.
        </p>
      </CardHeader>
      <CardContent className="px-0">
        <ApplicationForm
          application={application}
          submitMutation={submitMutation}
          onSubmitted={() => setReapplying(false)}
        />
      </CardContent>
    </Card>
  );
}
