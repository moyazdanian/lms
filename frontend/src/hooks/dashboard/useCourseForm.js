import { useCallback, useMemo, useRef, useState } from 'react';
import { COURSE_STEPS, emptyCourse, validateStep } from '@/lib/validation/course';

/**
 * Course form state machine used by BOTH Create Course and Edit Course.
 * Owns values, step navigation, touched/dirty tracking and per-step validation.
 */
export function useCourseForm({ initialValues } = {}) {
  const initial = useMemo(
    () => ({ ...emptyCourse(), ...(initialValues || {}) }),
    [initialValues]
  );
  const baselineRef = useRef(initial);
  const [values, setValues] = useState(initial);
  const [stepIndex, setStepIndex] = useState(0);
  const [visitedSteps, setVisitedSteps] = useState(() => new Set(['basics']));
  const [showErrors, setShowErrors] = useState(false);
  const [serverErrors, setServerErrors] = useState(null);

  const step = COURSE_STEPS[stepIndex];
  const errors = useMemo(() => {
    const local = validateStep(step.id, values);
    if (!serverErrors) return local;
    const merged = { ...local };
    Object.entries(serverErrors).forEach(([field, messages]) => {
      merged[field] = Array.isArray(messages) ? messages[0] : messages;
    });
    return merged;
  }, [step.id, values, serverErrors]);

  const setField = useCallback((field, value) => {
    setServerErrors(null);
    setValues((current) => ({ ...current, [field]: value }));
  }, []);

  const patch = useCallback((partial) => {
    setServerErrors(null);
    setValues((current) => ({ ...current, ...partial }));
  }, []);

  const isDirty = useMemo(
    () => JSON.stringify(values) !== JSON.stringify(baselineRef.current),
    [values]
  );

  const goToStep = useCallback((index) => {
    const clamped = Math.max(0, Math.min(COURSE_STEPS.length - 1, index));
    setShowErrors(false);
    setStepIndex(clamped);
    setVisitedSteps((current) => new Set(current).add(COURSE_STEPS[clamped].id));
  }, []);

  const next = useCallback(() => {
    const stepErrors = validateStep(COURSE_STEPS[stepIndex].id, values);
    if (Object.keys(stepErrors).length > 0) {
      setShowErrors(true);
      return false;
    }
    goToStep(stepIndex + 1);
    return true;
  }, [goToStep, stepIndex, values]);

  const previous = useCallback(() => goToStep(stepIndex - 1), [goToStep, stepIndex]);

  /** Called after a successful save so the unsaved-changes state resets. */
  const commit = useCallback((savedValues) => {
    const nextValues = { ...emptyCourse(), ...(savedValues || {}) };
    baselineRef.current = nextValues;
    setValues(nextValues);
    setServerErrors(null);
  }, []);

  const reset = useCallback((nextInitial) => {
    const nextValues = { ...emptyCourse(), ...(nextInitial || {}) };
    baselineRef.current = nextValues;
    setValues(nextValues);
    setStepIndex(0);
    setShowErrors(false);
    setServerErrors(null);
  }, []);

  return {
    values,
    setField,
    patch,
    errors,
    showErrors,
    setShowErrors,
    setServerErrors,
    step,
    stepIndex,
    steps: COURSE_STEPS,
    visitedSteps,
    goToStep,
    next,
    previous,
    isDirty,
    commit,
    reset
  };
}