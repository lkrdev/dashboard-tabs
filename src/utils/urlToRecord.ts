export const urlToRecord = (url: string) => {
  const params = new URL(url).searchParams;
  const { sdk, embed_domain, ...entries } = Object.fromEntries(
    Array.from(params.entries()).filter(([_, value]) => value.length > 0)
  );
  return entries;
};
