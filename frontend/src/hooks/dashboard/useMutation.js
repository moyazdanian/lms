import { useCallback, useState } from 'react';

/**
 * Runs a write request once at a time and surfaces Laravel 422 field errors.
 * Returns { ok, data, error } instead of throwing so forms stay declarative.
 */
export function useMutation(mutationFn) {
  const [pending, setPending] = useState(false);
  const [fieldErrors, setFieldErrors] = useState(null);
  const [error, setError] = useState(null);

  const mutate = useCallback(
    async (...args) => {
      if (pending) return { ok: false, blocked: true };
      setPending(true);
      setFieldErrors(null);
      setError(null);
      try {
        const data = await mutationFn(...args);
        return { ok: true, data };
      } catch (caught) {
        setFieldErrors(caught?.errors || null);
        setError(caught);
        return { ok: false, error: caught };
      } finally {
        setPending(false);
      }
    },
    [mutationFn, pending]
  );

  const reset = useCallback(() => {
    setFieldErrors(null);
    setError(null);
  }, []);

  return { mutate, pending, fieldErrors, error, setFieldErrors, reset };
}