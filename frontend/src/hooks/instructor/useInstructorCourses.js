import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getInstructorCourses,
  getInstructorCourse,
  createCourseApi,
  updateCourseApi,
  deleteCourseApi,
  createSectionApi,
  updateSectionApi,
  deleteSectionApi,
  createLessonApi,
  updateLessonApi,
  deleteLessonApi,
} from "@/lib/api/instructor";

function errorMessage(err) {
  const data = err?.response?.data;

  if (data?.errors) {
    const firstField = Object.values(data.errors)[0];
    if (Array.isArray(firstField) && firstField.length) return firstField[0];
  }

  return data?.message || "Something went wrong";
}

export function useInstructorCourses({
  page = 1,
  search = "",
  status = "",
  category = "",
  sort = "newest",
}) {
  return useQuery({
    queryKey: [
      "instructor-courses",
      page,
      search,
      status,
      category,
      sort,
    ],
    queryFn: () =>
      getInstructorCourses({
        page,
        search,
        status,
        category,
        sort,
      }),
  });
}

export function useInstructorCourse(courseId) {
  return useQuery({
    queryKey: ["instructor-course", courseId],
    queryFn: () => getInstructorCourse(courseId),
    enabled: !!courseId,
  });
}

export function useCourseMutations() {
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState(0);

  const onProgress = (event) => {
    if (event.total) {
      setUploadProgress(Math.round((event.loaded * 100) / event.total));
    }
  };

  const invalidate = (courseId) => {
    queryClient.invalidateQueries({ queryKey: ["instructor-courses"] });
    if (courseId) {
      queryClient.invalidateQueries({ queryKey: ["instructor-course", courseId] });
    }
  };

  const createCourse = useMutation({
    mutationFn: (formData) => {
      setUploadProgress(0);
      return createCourseApi(formData, onProgress);
    },
    onSuccess: () => {
      invalidate();
      toast.success("Course created. It will be published after admin approval.");
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  const updateCourse = useMutation({
    mutationFn: ({ courseId, formData }) => {
      setUploadProgress(0);
      return updateCourseApi(courseId, formData, onProgress);
    },
    onSuccess: (_data, { courseId }) => {
      invalidate(courseId);
      toast.success("Course updated.");
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  const deleteCourse = useMutation({
    mutationFn: (courseId) => deleteCourseApi(courseId),
    onSuccess: () => {
      invalidate();
      toast.success("Course deleted.");
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  return { createCourse, updateCourse, deleteCourse, uploadProgress };
}

export function useSectionMutations(courseId) {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["instructor-course", courseId] });

  const createSection = useMutation({
    mutationFn: (data) => createSectionApi(courseId, data),
    onSuccess: () => {
      invalidate();
      toast.success("Section added.");
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  const updateSection = useMutation({
    mutationFn: ({ sectionId, data }) => updateSectionApi(sectionId, data),
    onSuccess: () => {
      invalidate();
      toast.success("Section updated.");
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  const deleteSection = useMutation({
    mutationFn: (sectionId) => deleteSectionApi(sectionId),
    onSuccess: () => {
      invalidate();
      toast.success("Section deleted.");
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  return { createSection, updateSection, deleteSection };
}

export function useLessonMutations(courseId) {
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState(0);

  const onProgress = (event) => {
    if (event.total) {
      setUploadProgress(Math.round((event.loaded * 100) / event.total));
    }
  };

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["instructor-course", courseId] });

  const createLesson = useMutation({
    mutationFn: ({ sectionId, formData }) => {
      setUploadProgress(0);
      return createLessonApi(sectionId, formData, onProgress);
    },
    onSuccess: () => {
      invalidate();
      setUploadProgress(0);
      toast.success("Lesson uploaded.");
    },
    onError: (err) => {
      setUploadProgress(0);
      toast.error(errorMessage(err));
    },
  });

  const updateLesson = useMutation({
    mutationFn: ({ lessonId, formData }) => {
      setUploadProgress(0);
      return updateLessonApi(lessonId, formData, onProgress);
    },
    onSuccess: () => {
      invalidate();
      setUploadProgress(0);
      toast.success("Lesson updated.");
    },
    onError: (err) => {
      setUploadProgress(0);
      toast.error(errorMessage(err));
    },
  });

  const deleteLesson = useMutation({
    mutationFn: (lessonId) => deleteLessonApi(lessonId),
    onSuccess: () => {
      invalidate();
      toast.success("Lesson deleted.");
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  return { createLesson, updateLesson, deleteLesson, uploadProgress };
}
