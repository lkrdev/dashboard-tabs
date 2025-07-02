import { useCallback, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
export default function useSearchParams() {
  const { search } = useLocation();
  const history = useHistory();
  const [search_params, setSearchParams] = useState<Record<string, string>>(
    Object.fromEntries(new URLSearchParams(search))
  );

  const updateSearchParams = useCallback(
    (params: Record<string, string | undefined | null>) => {
      const new_params = new URLSearchParams(search_params);
      Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null) {
          new_params.delete(key);
        } else {
          new_params.set(key, value);
        }
      });
      setSearchParams(Object.fromEntries(new_params.entries()));
      history.replace({
        search: new_params.toString(),
      });
    },
    [setSearchParams, history, search_params]
  );

  return {
    search_params,
    updateSearchParams,
  };
}
