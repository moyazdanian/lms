/** Course form validation, shared by Create Course and Edit Course. */

export const COURSE_STEPS = [
{ id: 'basics', label: 'Basic Information' },
{ id: 'details', label: 'Course Details' },
{ id: 'curriculum', label: 'Curriculum' },
{ id: 'pricing', label: 'Pricing' },
{ id: 'media', label: 'Media' },
{ id: 'quiz', label: 'Quiz' },
{ id: 'review', label: 'Review & Publish' }];


export function emptyCourse() {
  return {
    title: '',
    short_description: '',
    description: '',
    category: '',
    category_id: '',
    category_name: '',
    level: '',
    requirements: [],
    objectives: [],
    tags: [],
    sections: [],
    price: '',
    discount: '',
    currency: 'USD',
    thumbnail: '',
    preview_video: '',
    thumbnail_file: null,
    thumbnail_removed: false,
    preview_video_file: null,
    preview_video_removed: false,
    // Public lifecycle of the course (ongoing/completed) — the instructor's
    // own choice, independent of the approval workflow ('status' display
    // field below is published/draft and stays admin-controlled).
    backend_status: 'ongoing',
    status: 'draft',
    quiz: { title: 'Final Quiz', is_active: false, questions: [] }
  };
}

/** Errors for one step, keyed by field name. Empty object means valid. */
export function validateStep(stepId, values) {
  const errors = {};

  if (stepId === 'basics') {
    if (!values.title?.trim()) errors.title = 'A course title is required.';else
    if (values.title.trim().length < 8)
    errors.title = 'Use at least 8 characters so students know what this is.';
    if (!values.short_description?.trim())
    errors.short_description = 'A short description is required.';else
    if (values.short_description.length > 160)
    errors.short_description = 'Keep the short description under 160 characters.';
    if (!values.description?.trim())
    errors.description = 'A full description is required.';
    if (!values.category) errors.category = 'Choose a category.';
    if (!values.level) errors.level = 'Choose a level.';
  }

  if (stepId === 'details') {
    if (!values.objectives?.filter(Boolean).length)
    errors.objectives = 'Add at least one learning objective.';
  }

  if (stepId === 'curriculum') {
    const sections = Array.isArray(values.sections) ? values.sections : [];
    if (!sections.length) {
      errors.sections = 'Add at least one section.';
    } else if (sections.some((section) => !String(section.title || '').trim())) {
      errors.sections = 'Every section needs a title.';
    } else if (!sections.some((section) => section.lessons?.length)) {
      errors.sections = 'Add at least one lesson to a section.';
    } else if (sections.some((section) =>
      (section.lessons || []).some((lesson) => !String(lesson.title || '').trim())
    )) {
      errors.sections = 'Every lesson needs a title.';
    } else if (sections.some((section) =>
      (section.lessons || []).some((lesson) => !lesson.id && !lesson.video_file)
    )) {
      errors.sections = 'Add a video file to every new lesson before publishing.';
    }
  }

  if (stepId === 'pricing') {
    const price = Number(values.price);
    // The discount field is the price students pay, not an amount off.
    const discount = Number(values.discount || 0);
    if (values.price === '' || Number.isNaN(price))
    errors.price = 'Enter a price (use 0 for a free course).';else
    if (price < 0) errors.price = 'Price cannot be negative.';
    if (Number.isNaN(discount) || discount < 0)
    errors.discount = 'Discounted price cannot be negative.';else
    if (discount > 0 && discount >= price)
    errors.discount = 'The discounted price must be lower than the list price.';
    if (!values.currency) errors.currency = 'Choose a currency.';
  }

  if (stepId === 'media') {
    if (!values.thumbnail) errors.thumbnail = 'A course thumbnail is required.';
  }

  if (stepId === 'quiz') {
    // A quiz is optional: only validate its content when it is active.
    const quiz = values.quiz;
    if (quiz && quiz.is_active) {
      const questions = Array.isArray(quiz.questions) ? quiz.questions : [];
      if (!questions.length) {
        errors.quiz = 'An active quiz needs at least one question.';
      } else if (
        questions.some(
          (question) =>
            !String(question.question || '').trim() ||
            !(question.options || []).some(
              (option) => option.is_correct && String(option.option_text || '').trim(),
            ),
        )
      ) {
        errors.quiz =
          'Every question needs text and at least one filled option marked as correct.';
      }
    }
  }

  return errors;
}

/** Fields required by Laravel even when the course is saved as a draft. */
export function getDraftBlockers(values) {
  const basicsErrors = {};
  if (!values.title?.trim()) basicsErrors.title = 'A course title is required.';
  if (!values.description?.trim()) basicsErrors.description = 'A full description is required.';
  if (!values.category) basicsErrors.category = 'Choose a category.';
  if (!values.level) basicsErrors.level = 'Choose a level.';

  const pricingErrors = validateStep('pricing', values);
  const basicsStep = COURSE_STEPS.find((step) => step.id === 'basics');
  const pricingStep = COURSE_STEPS.find((step) => step.id === 'pricing');

  return [
    { step: basicsStep, errors: Object.values(basicsErrors) },
    { step: pricingStep, errors: Object.values(pricingErrors) },
  ].filter((entry) => entry.errors.length > 0);
}

/** Human-readable list of what still blocks publishing. */
export function getPublishBlockers(values) {
  return COURSE_STEPS.filter((step) => step.id !== 'review').
  map((step) => ({ step, errors: Object.values(validateStep(step.id, values)) })).
  filter((entry) => entry.errors.length > 0);
}

export function finalPrice(values) {
  const price = Number(values.price || 0);
  // The form's discount field holds the price students pay after the discount
  // (the same value the API stores in `discount_price`). Anything that is not
  // an actual reduction leaves the list price untouched.
  const discountPrice = Number(values.discount || 0);

  return discountPrice > 0 && discountPrice < price ? discountPrice : price;
}