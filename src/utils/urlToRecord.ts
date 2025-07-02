export const urlToRecord = (url: string) => {
  const params = new URL(url).searchParams;
  const {
    sdk,
    embed_domain,
    dashboard_id,
    sandboxed_host,
    _theme,
    ...entries
  } = Object.fromEntries(
    Array.from(params.entries()).filter(([_, value]) => value.length > 0)
  );
  return {
    filters: entries,
    others: { sdk, embed_domain, dashboard_id, sandboxed_host, _theme },
  };
};
