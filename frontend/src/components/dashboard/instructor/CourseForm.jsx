"use client";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCategories } from "@/lib/api/courses";
import { useCourseMutations } from "@/hooks/instructor/useInstructorCourses";
import CourseDescriptionEditor from "@/components/CourseDescriptionEditor";

const courseSchema = Yup.object().shape({
  title: Yup.string().required("Title is required").max(255),
  description: Yup.string().required("Description is required"),
  price: Yup.number()
    .typeError("Price must be a number")
    .min(0, "Price cannot be negative")
    .required("Price is required"),
  discount_price: Yup.number()
    .typeError("Discount price must be a number")
    .min(0)
    .nullable()
    .transform((value, original) => (original === "" ? null : value))
    .test(
      "lt-price",
      "Discount price must be lower than price",
      function (value) {
        if (value == null) return true;
        return value < Number(this.parent.price);
      },
    ),
  category_id: Yup.string().required("Category is required"),
  level: Yup.string()
    .oneOf(["beginner", "intermediate", "advanced"])
    .required("Level is required"),
  language: Yup.string().nullable(),
});

export default function CourseForm({ course = null, onSuccess }) {
  const isEdit = !!course;
  const { createCourse, updateCourse } = useCourseMutations();
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailError, setThumbnailError] = useState("");

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const categoryOptions = useMemo(() => {
    if (!Array.isArray(categories)) return [];

    return categories.flatMap((parent) => [
      { id: parent.id, name: parent.name },
      ...(parent.children || []).map((child) => ({
        id: child.id,
        name: `— ${child.name}`,
      })),
    ]);
  }, [categories]);

  const previewSrc = thumbnailFile
    ? URL.createObjectURL(thumbnailFile)
    : course?.thumbnail || null;

  const mutation = isEdit ? updateCourse : createCourse;

  const handleSubmit = (values) => {
    if (!isEdit && !thumbnailFile) {
      setThumbnailError("Thumbnail image is required");
      return;
    }

    const formData = new FormData();
    formData.append("title", values.title);
    formData.append("description", values.description);
    formData.append("price", values.price);
    if (values.discount_price !== "" && values.discount_price != null) {
      formData.append("discount_price", values.discount_price);
    }
    formData.append("category_id", values.category_id);
    formData.append("level", values.level);
    if (values.language) formData.append("language", values.language);
    if (thumbnailFile) formData.append("thumbnail", thumbnailFile);

    if (isEdit) {
      updateCourse.mutate(
        { courseId: course.id, formData },
        { onSuccess: (data) => onSuccess?.(data) },
      );
    } else {
      createCourse.mutate(formData, {
        onSuccess: (data) => onSuccess?.(data),
      });
    }
  };

  return (
    <Formik
      initialValues={{
        title: course?.title || "",
        description: course?.description || "",
        price: course?.price ?? "",
        discount_price: course?.discount_price ?? "",
        category_id: course?.category_id ? String(course.category_id) : "",
        level: course?.level || "intermediate",
        language: course?.language || "",
      }}
      validationSchema={courseSchema}
      onSubmit={handleSubmit}
    >
      {({ values, errors, touched, handleChange, setFieldValue }) => (
        <Form className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="title">Course Title</Label>
            <Input
              id="title"
              name="title"
              value={values.title}
              onChange={handleChange}
              placeholder="e.g. Complete React Course"
            />
            {touched.title && errors.title && (
              <p className="text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="description">Description</Label>
            <CourseDescriptionEditor
              value={values.description}
              onChange={(html) => {
                setFieldValue("description", html);
              }}
            />
            {touched.description && errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={values.price}
                onChange={handleChange}
              />
              {touched.price && errors.price && (
                <p className="text-sm text-red-500">{errors.price}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="discount_price">
                Discount Price ($, optional)
              </Label>
              <Input
                id="discount_price"
                name="discount_price"
                type="number"
                min="0"
                step="0.01"
                value={values.discount_price}
                onChange={handleChange}
              />
              {touched.discount_price && errors.discount_price && (
                <p className="text-sm text-red-500">{errors.discount_price}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Category</Label>
              <Select
                value={values.category_id}
                onValueChange={(value) => setFieldValue("category_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((cat) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {touched.category_id && errors.category_id && (
                <p className="text-sm text-red-500">{errors.category_id}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label>Level</Label>
              <Select
                value={values.level}
                onValueChange={(value) => setFieldValue("level", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="language">Language (optional)</Label>
            <Input
              id="language"
              name="language"
              value={values.language}
              onChange={handleChange}
              placeholder="e.g. English"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="thumbnail">
              Thumbnail {isEdit ? "(leave empty to keep current)" : ""}
            </Label>
            <Input
              id="thumbnail"
              type="file"
              accept="image/*"
              onChange={(e) => {
                setThumbnailFile(e.target.files?.[0] || null);
                setThumbnailError("");
              }}
            />
            {thumbnailError && (
              <p className="text-sm text-red-500">{thumbnailError}</p>
            )}
            {previewSrc && (
              <div className="relative w-full h-40 mt-2 rounded-md overflow-hidden border">
                {/* plain img: preview may be a blob: URL, unsupported by next/image */}
                <img
                  src={previewSrc}
                  alt="Thumbnail preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isEdit ? "Saving..." : "Creating..."}
              </>
            ) : isEdit ? (
              "Save Changes"
            ) : (
              "Create Course"
            )}
          </Button>
        </Form>
      )}
    </Formik>
  );
}
