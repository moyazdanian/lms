"use client";

import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { FormField, fieldProps } from "../../common/FormField";
import { COURSE_LEVELS } from "@/config/courses";
import { getCourseCategories } from "@/lib/api/instructorCourses";
import CourseDescriptionEditor from "@/components/CourseDescriptionEditor";

function flattenCategories(categories) {
  const list = Array.isArray(categories) ? categories : categories?.data;
  if (!Array.isArray(list)) return [];

  return list.flatMap((category) => [
    { id: category.id, name: category.name },
    ...(category.children || []).map((child) => ({
      id: child.id,
      name: `${category.name} / ${child.name}`,
    })),
  ]);
}

export function BasicInfoStep({ values, setField, errors }) {

  const categoriesQuery = useQuery({
    queryKey: ["course-categories"],
    queryFn: getCourseCategories,
    staleTime: 5 * 60 * 1000,
  });
  const categories = useMemo(
    () => flattenCategories(categoriesQuery.data),
    [categoriesQuery.data],
  );

  return (
    <div className="space-y-5">
      <FormField
        id="title"
        label="Course title"
        required
        error={errors.title}
        hint={`${values.title.length}/80`}
      >
        <Input
          {...fieldProps("title", errors.title)}
          maxLength={80}
          value={values.title}
          placeholder="e.g. Advanced React Patterns & Performance"
          onChange={(event) => setField("title", event.target.value)}
        />
      </FormField>

      <FormField
        id="short_description"
        label="Short description"
        required
        error={errors.short_description}
        hint={`${values.short_description.length}/160`}
      >
        <Textarea
          {...fieldProps("short_description", errors.short_description)}
          rows={2}
          maxLength={160}
          value={values.short_description}
          placeholder="One sentence that appears in course listings."
          onChange={(event) =>
            setField("short_description", event.target.value)
          }
        />
      </FormField>

      <FormField
        id="description"
        label="Full description"
        required
        error={errors.description}
      >
        {/* <Textarea
          {...fieldProps('description', errors.description)}
          rows={7}
          value={values.description}
          placeholder="Describe what the course covers, who it is for and what students will build."
          onChange={(event) => setField('description', event.target.value)}
        /> */}

        <CourseDescriptionEditor
          value={values.description}
          placeholder="Describe what the course covers, who it is for and what students will build."
          onChange={(html) => {
            setField("description", html);
          }}
        />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          id="category"
          label="Category"
          required
          error={errors.category || errors.category_id}
        >
          <Select
            value={values.category ? String(values.category) : undefined}
            onValueChange={(value) => {
              const selected = categories.find(
                (option) => String(option.id) === String(value),
              );
              setField("category", value);
              setField("category_id", value);
              setField("category_name", selected?.name || "");
            }}
          >
            <SelectTrigger
              {...fieldProps("category", errors.category || errors.category_id)}
              disabled={categoriesQuery.isLoading}
            >
              <SelectValue
                placeholder={
                  categoriesQuery.isLoading
                    ? "Loading categories..."
                    : "Choose a category"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {categories.map((option) => (
                <SelectItem key={option.id} value={String(option.id)}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {categoriesQuery.isError ? (
            <p className="text-xs font-medium text-destructive">
              Categories could not be loaded. Please try again.
            </p>
          ) : null}
        </FormField>

        <FormField id="level" label="Level" required error={errors.level}>
          <Select
            value={values.level || undefined}
            onValueChange={(value) => setField("level", value)}
          >
            <SelectTrigger {...fieldProps("level", errors.level)}>
              <SelectValue placeholder="Choose a level" />
            </SelectTrigger>
            <SelectContent>
              {COURSE_LEVELS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField
          id="backend_status"
          label="Course status"
          required
          error={errors.backend_status}
          hint="Is this course currently running or already finished?"
        >
          <Select
            value={values.backend_status || "ongoing"}
            onValueChange={(value) => setField("backend_status", value)}
          >
            <SelectTrigger {...fieldProps("backend_status", errors.backend_status)}>
              <SelectValue placeholder="Choose a status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ongoing">Ongoing — currently running</SelectItem>
              <SelectItem value="completed">Completed — course finished</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
      </div>
    </div>
  );
}
