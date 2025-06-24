import { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
export default function useSearchParams() {
  const { search } = useLocation();
  const history = useHistory();
  const [search_params, setSearchParams] = useState<Record<string, string>>(
    Object.fromEntries(new URLSearchParams(search))
  );

  useEffect(() => {
    history.replace({
      search: new URLSearchParams(search_params).toString(),
    });
  }, [search_params, history]);

  return {
    search_params,
    updateSearchParams: (params: Record<string, string | undefined | null>) => {
      setSearchParams((previous) => {
        const new_params = new URLSearchParams(previous);
        Object.entries(params).forEach(([key, value]) => {
          if (value === undefined || value === null) {
            new_params.delete(key);
          } else {
            new_params.set(key, value);
          }
        });
        return Object.fromEntries(new_params.entries());
      });
    },
  };
}
