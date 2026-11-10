import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Small request-state hook: data / loading / error / refetch, with abort on
 * unmount and on dependency change. Server state is fetched where it is used
 * through lib/api/*, so no global store is needed.
 */
export function useApiResource(fetcher, deps = [], { enabled = true } = {}) {
  const [state, setState] = useState({
    data: null,
    loading: enabled,
    error: null
  });
  const [reloadToken, setReloadToken] = useState(0);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    if (!enabled) {
      setState({ data: null, loading: false, error: null });
      return undefined;
    }
    const controller = new AbortController();
    let active = true;
    setState((previous) => ({ ...previous, loading: true, error: null }));

    fetcherRef.
    current({ signal: controller.signal }).
    then((data) => {
      if (active) setState({ data, loading: false, error: null });
    }).
    catch((error) => {
      if (!active || error?.name === 'AbortError') return;
      setState({ data: null, loading: false, error });
    });

    return () => {
      active = false;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadToken, enabled]);

  const refetch = useCallback(() => setReloadToken((token) => token + 1), []);
  const setData = useCallback(
    (updater) =>
    setState((previous) => ({
      ...previous,
      data: typeof updater === 'function' ? updater(previous.data) : updater
    })),
    []
  );

  return { ...state, refetch, setData };
}