import request from '@/utilities/AxiosUtils';

// NOTE(file): this is the instructor-side course authoring API (used by
// components/teaching/*). The public catalog lives in lib/api/courses.js and
// the single-request course CRUD used by the React-Query hooks in
// lib/api/instructor.js.

function normalizeApiError(error) {
  if (error?.name === 'ApiError') return error;

  const payload = error?.response?.data;
  const normalized = new Error(
    payload?.message || 'We could not complete that course request.',
  );
  normalized.status = error?.response?.status || 0;
  normalized.errors = payload?.errors || null;
  normalized.response = error?.response;
  return normalized;
}

async function callApi(options) {
  try {
    return await request(options);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

function appendArray(formData, name, values) {
  (Array.isArray(values) ? values : []).filter(Boolean).forEach((value) => {
    formData.append(`${name}[]`, String(value));
  });
}

function isFile(value) {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.name === 'string' &&
    typeof value.size === 'number'
  );
}

/** Convert the dashboard form's friendly fields to the Laravel course fields. */
export function buildCourseFormData(values = {}) {
  const formData = new FormData();
  const price = Number(values.price || 0);
  const discount = Number(values.discount || 0);
  const categoryId =
    values.category_id?.id ||
    values.category_id ||
    values.category?.id ||
    values.category ||
    '';

  formData.append('title', String(values.title || '').trim());
  formData.append('description', String(values.description || ''));
  formData.append('price', String(Number.isFinite(price) ? price : 0));
  formData.append('category_id', String(categoryId));
  formData.append('level', String(values.level || 'intermediate'));
  // Course activation is controlled by the admin approval workflow; the
  // save intent (draft = private draft, submit = review queue) decides the
  // approval_status on the backend.
  formData.append('intent', values.intent === 'submit' ? 'submit' : 'draft');
  // Public lifecycle chosen by the instructor (ongoing/completed). Only the
  // two enum values the DB column accepts are ever sent.
  formData.append(
    'status',
    values.backend_status === 'completed' ? 'completed' : 'ongoing',
  );

  if (values.short_description) {
    formData.append('short_description', String(values.short_description));
  }
  if (values.language) formData.append('language', String(values.language));
  if (values.currency) formData.append('currency', String(values.currency));

  if (discount > 0 && discount < price) {
    // The form's discount field is the price students pay, which is exactly
    // what the API stores in `discount_price` (validated as `lt:price`).
    formData.append('discount_price', discount.toFixed(2));
  } else {
    // An empty nullable value clears an old discount during edit.
    formData.append('discount_price', '');
  }

  appendArray(formData, 'requirements', values.requirements);
  appendArray(formData, 'objectives', values.objectives);
  appendArray(formData, 'tags', values.tags);

  if (isFile(values.thumbnail_file)) {
    formData.append('thumbnail', values.thumbnail_file);
  }
  if (isFile(values.preview_video_file)) {
    formData.append('preview_video', values.preview_video_file);
  }
  if (values.thumbnail_removed) {
    formData.append('remove_thumbnail', '1');
  }
  if (values.preview_video_removed) {
    formData.append('remove_preview_video', '1');
  }

  return formData;
}

/** GET /api/v1/instructor/courses — paginated { data, meta } */
export function getInstructorCourses(
  { search = '', status = 'all', category = 'all', sort = 'newest', page = 1, perPage = 10 } = {},
  options = {},
) {
  return callApi({
    ...options,
    url: '/api/v1/instructor/courses',
    method: 'GET',
    params: {
      search,
      status,
      category,
      sort,
      page,
      per_page: perPage,
    },
  });
}

/** GET /api/v1/instructor/courses/{id} */
export function getCourse(id, options = {}) {
  return callApi({
    ...options,
    url: `/api/v1/instructor/courses/${id}`,
    method: 'GET',
  });
}

/** Convert Axios upload events into the percentage used by the save UI. */
function uploadProgressHandler(onProgress) {
  return (event) => {
    if (!event?.total) return;

    onProgress?.(Math.round((event.loaded / event.total) * 100));
  };
}

/** POST /api/v1/instructor/courses */
export function createCourse(values, onProgress) {
  return callApi({
    url: '/api/v1/instructor/courses',
    method: 'POST',
    data: buildCourseFormData(values),
    timeout: 0,
    onUploadProgress: uploadProgressHandler(onProgress),
  });
}

/** The current Laravel route accepts POST multipart updates. */
export function updateCourse(id, values, onProgress) {
  return callApi({
    url: `/api/v1/instructor/courses/${id}`,
    method: 'POST',
    data: buildCourseFormData(values),
    timeout: 0,
    onUploadProgress: uploadProgressHandler(onProgress),
  });
}

export function deleteCourse(id) {
  return callApi({
    url: `/api/v1/instructor/courses/${id}`,
    method: 'DELETE',
  });
}

export function createSection(courseId, data) {
  return callApi({
    url: `/api/v1/instructor/courses/${courseId}/sections`,
    method: 'POST',
    data,
  });
}

export function updateSection(sectionId, data) {
  return callApi({
    url: `/api/v1/instructor/sections/${sectionId}`,
    method: 'PUT',
    data,
  });
}

export function deleteSection(sectionId) {
  return callApi({
    url: `/api/v1/instructor/sections/${sectionId}`,
    method: 'DELETE',
  });
}

function buildLessonFormData(lesson) {
  const formData = new FormData();
  formData.append('title', String(lesson.title || '').trim());
  formData.append('duration', String(Number(lesson.duration || 0)));
  formData.append('description', String(lesson.description || ''));
  formData.append('sort_order', String(Number(lesson.sort_order || 0)));
  formData.append('is_free', lesson.is_free_preview ? '1' : '0');
  if (isFile(lesson.video_file)) formData.append('video', lesson.video_file);
  return formData;
}

export function createLesson(
  sectionId,
  values,
  onProgress
) {
  return callApi({
    url: `/api/v1/instructor/sections/${sectionId}/lessons`,
    method: "POST",
    data: buildLessonFormData(values),
    timeout: 0,

    onUploadProgress: (event) => {
      if (!event.total) return;

      const percent = Math.round(
        (event.loaded / event.total) * 100
      );

      onProgress?.(percent);
    },
  });
}

export function updateLesson(
  lessonId,
  values,
  onProgress
) {
  return callApi({
    url: `/api/v1/instructor/lessons/${lessonId}`,
    method: "POST",
    data: buildLessonFormData(values),
    timeout: 0,

    onUploadProgress: (event) => {
      if (!event.total) return;

      const percent = Math.round(
        (event.loaded / event.total) * 100
      );

      onProgress?.(percent);
    },
  });
}

export function deleteLesson(lessonId) {
  return callApi({
    url: `/api/v1/instructor/lessons/${lessonId}`,
    method: 'DELETE',
  });
}

/**
 * Lesson attachments (PDF/ZIP/Office files students can download).
 * Uploaded separately from the lesson itself so large files never sit in the
 * curriculum save loop and each upload reports its own progress.
 */
export function listLessonAttachments(lessonId, options = {}) {
  return callApi({
    url: `/api/v1/instructor/lessons/${lessonId}/attachments`,
    method: 'GET',
    signal: options.signal,
  });
}

export function uploadLessonAttachment(lessonId, file, onProgress, options = {}) {
  const formData = new FormData();
  formData.append('file', file);
  return callApi({
    url: `/api/v1/instructor/lessons/${lessonId}/attachments`,
    method: 'POST',
    data: formData,
    isFormData: true,
    timeout: 0,
    signal: options.signal,
    onUploadProgress: uploadProgressHandler(onProgress),
  });
}

export function updateLessonAttachment(attachmentId, data) {
  return callApi({
    url: `/api/v1/instructor/attachments/${attachmentId}`,
    method: 'POST',
    data,
  });
}

export function deleteLessonAttachment(attachmentId) {
  return callApi({
    url: `/api/v1/instructor/attachments/${attachmentId}`,
    method: 'DELETE',
  });
}

function persistedId(id) {
  return /^\d+$/.test(String(id || ''));
}

function responseData(response) {
  return response?.data || response;
}

/**
 * Persist the local builder state through the backend's separate section and
 * lesson endpoints. It also removes sections/lessons deleted in the editor.
 */
export async function syncCourseCurriculum(
  courseId,
  sections = [],
  originalSections = [],
  onProgress,
) {
  const original = Array.isArray(originalSections)
    ? originalSections
    : [];

  const currentSectionIds = new Set();
  const currentLessonIdsBySection = new Map();

  const createdSectionIds = [];
  const createdLessonIds = [];

  const lessons = sections.flatMap(
    (section) => section.lessons || []
  );

  const totalLessons = lessons.length;
  let completedLessons = 0;

  function reportProgress(percent, lesson) {
    const current = totalLessons
      ? Math.min(
          totalLessons,
          percent >= 100 ? Math.max(1, completedLessons) : completedLessons + 1,
        )
      : 0;

    onProgress?.({
      percent: Math.min(100, Math.max(0, Math.round(percent))),
      current,
      total: totalLessons,
      lessonTitle: lesson?.title || "",
      lessonFileName: isFile(lesson?.video_file) ? lesson.video_file.name : "",
    });
  }

  try {
    for (const [sectionIndex, section] of sections.entries()) {
      if (!String(section.title || "").trim()) {
        throw new Error(
          `Section ${sectionIndex + 1} needs a title.`
        );
      }

      const sectionPayload = {
        title: String(section.title).trim(),
        sort_order: sectionIndex + 1,
      };

      const isNewSection = !persistedId(section.id);

      const savedSection = responseData(
        isNewSection
          ? await createSection(
              courseId,
              sectionPayload
            )
          : await updateSection(
              section.id,
              sectionPayload
            )
      );

      const sectionId = savedSection.id;

      if (isNewSection) {
        createdSectionIds.push(sectionId);
      }

      currentSectionIds.add(String(sectionId));

      const currentLessonIds = new Set();

      currentLessonIdsBySection.set(
        String(sectionId),
        currentLessonIds
      );

      for (const [lessonIndex, lesson] of (
        section.lessons || []
      ).entries()) {
        if (!String(lesson.title || "").trim()) {
          throw new Error(
            "Every lesson needs a title."
          );
        }

        if (
          !persistedId(lesson.id) &&
          !isFile(lesson.video_file)
        ) {
          throw new Error(
            `Add a video file for “${lesson.title}” before saving.`
          );
        }

        const lessonPayload = {
          ...lesson,
          sort_order: lessonIndex + 1,
        };

        const isNewLesson =
          !persistedId(lesson.id);

        const handleLessonProgress = (
          fileProgress
        ) => {
          if (!totalLessons) return;

          const overallProgress =
            ((completedLessons +
              fileProgress / 100) /
              totalLessons) *
            100;

          reportProgress(
            overallProgress,
            lesson
          );
        };

        const savedLesson = responseData(
          isNewLesson
            ? await createLesson(
                sectionId,
                lessonPayload,
                handleLessonProgress
              )
            : await updateLesson(
                lesson.id,
                lessonPayload,
                handleLessonProgress
              )
        );

        if (isNewLesson) {
          createdLessonIds.push(
            savedLesson.id
          );
        }

        currentLessonIds.add(
          String(savedLesson.id)
        );

        completedLessons++;

        reportProgress(100, lesson);
      }
    }

    // Delete old sections / lessons
    for (const oldSection of original) {
      if (!persistedId(oldSection.id)) continue;

      if (
        !currentSectionIds.has(
          String(oldSection.id)
        )
      ) {
        await deleteSection(oldSection.id);
        continue;
      }

      const currentSection = sections.find(
        (section) =>
          String(section.id) ===
          String(oldSection.id)
      );

      const currentLessonIds =
        currentLessonIdsBySection.get(
          String(oldSection.id)
        ) || new Set();

      for (const oldLesson of oldSection.lessons ||
        []) {
        if (
          persistedId(oldLesson.id) &&
          !currentLessonIds.has(
            String(oldLesson.id)
          ) &&
          currentSection
        ) {
          await deleteLesson(oldLesson.id);
        }
      }
    }
  } catch (error) {
    for (
      const lessonId of [...createdLessonIds].reverse()
    ) {
      try {
        await deleteLesson(lessonId);
      } catch {}
    }

    for (
      const sectionId of [...createdSectionIds].reverse()
    ) {
      try {
        await deleteSection(sectionId);
      } catch {}
    }

    throw error;
  }
}

/** Map a Laravel instructor response into the fields used by CourseForm. */
export function normalizeInstructorCourse(course) {
  const source = course?.data && !Array.isArray(course.data) ? course.data : course;
  if (!source) return null;

  const rawCategoryId = source.category_id;
  const categoryId =
    (rawCategoryId && typeof rawCategoryId === 'object'
      ? rawCategoryId.id
      : rawCategoryId) ||
    source.category?.id ||
    '';
  const price = Number(source.price || 0);
  const discountPrice = Number(source.discount_price || 0);
  // The form's discount field holds the price students pay, so the saved
  // `discount_price` is loaded into it unchanged.
  const discount =
    price > 0 && discountPrice > 0 ? String(discountPrice) : '';

  return {
    ...source,
    category: String(categoryId),
    category_id: categoryId,
    level: source.level || 'intermediate',
    price: source.price ?? '',
    discount,
    currency: source.currency || 'USD',
    short_description: source.short_description || '',
    requirements: Array.isArray(source.requirements) ? source.requirements : [],
    objectives: Array.isArray(source.objectives) ? source.objectives : [],
    tags: Array.isArray(source.tags) ? source.tags : [],
    thumbnail: source.thumbnail || '',
    thumbnail_file: null,
    thumbnail_removed: false,
    preview_video: source.preview_video || '',
    preview_video_file: null,
    preview_video_removed: false,
    category_name:
      source.category_name ||
      source.category?.name ||
      (rawCategoryId && typeof rawCategoryId === 'object' ? rawCategoryId.name : '') ||
      '',
    backend_status: source.backend_status || source.status || 'ongoing',
    status: source.is_active ? 'published' : 'draft',
    approval_status: source.approval_status || 'draft',
    rejection_reason: source.rejection_reason || null,
    pending_changes: source.pending_changes || null,
    has_pending_edit_request: Boolean(source.has_pending_edit_request),
    edit_rejection_reason: source.edit_rejection_reason || null,
    pending_approval: Boolean(source.pending_approval) ||
      source.approval_status === 'pending_approval' ||
      Boolean(source.has_pending_edit_request),
    sections: (source.sections || []).map((section) => ({
      ...section,
      id: section.id,
      title: section.title || '',
      lessons: (section.lessons || []).map((lesson) => ({
        ...lesson,
        id: lesson.id,
        title: lesson.title || '',
        duration: lesson.duration ?? 0,
        video_url: lesson.video_url || '',
        video_file: null,
        is_free_preview: Boolean(lesson.is_free || lesson.preview),
        sort_order: lesson.sort_order ?? 0,
      })),
    })),
    quiz: source.quiz
      ? {
          title: source.quiz.title || 'Final Quiz',
          is_active: Boolean(source.quiz.is_active),
          pass_mark: source.quiz.pass_mark,
          max_attempts: source.quiz.max_attempts,
          questions: (source.quiz.questions || []).map((question) => ({
            id: question.id,
            question: question.question,
            explanation: question.explanation || '',
            points: question.points || 1,
            options: (question.options || []).map((option) => ({
              option_text: option.option_text,
              is_correct: Boolean(option.is_correct),
            })),
          })),
        }
      : undefined,
  };
}

export function getCourseCategories() {
  return callApi({
    url: '/api/v1/categories',
    method: 'GET',
  });
}

// ---------------------------------------------------------------------------
// Quiz editor (end-of-course quiz) — one quiz per course in v1.
// ---------------------------------------------------------------------------

/** GET /api/v1/instructor/courses/{id}/quiz */
export function getInstructorQuiz(courseId, options = {}) {
  return callApi({
    ...options,
    url: `/api/v1/instructor/courses/${courseId}/quiz`,
    method: 'GET',
  });
}

/**
 * POST /api/v1/instructor/courses/{id}/quiz — sync-style save of the whole
 * question set. pass_mark / max_attempts are admin-controlled and are
 * intentionally NOT sent.
 */
export function saveInstructorQuiz(
  courseId,
  { title, is_active = false, questions = [] },
  options = {},
) {
  return callApi({
    ...options,
    url: `/api/v1/instructor/courses/${courseId}/quiz`,
    method: 'POST',
    data: {
      title,
      is_active,
      questions: questions.map((question) => ({
        id: question.id,
        question: question.question,
        explanation: question.explanation || null,
        points: question.points || 1,
        options: (question.options || []).map((option) => ({
          option_text: option.option_text,
          is_correct: Boolean(option.is_correct),
        })),
      })),
    },
  });
}
