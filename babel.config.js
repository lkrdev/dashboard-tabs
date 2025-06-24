module.exports = function (api) {
  const isDevelopment = api.env('development'); // Checks the current environment
  api.cache.using(() => isDevelopment); // Cache based on the environment

  return {
    presets: [
      '@babel/preset-env',
      '@babel/preset-react',
      '@babel/preset-typescript'
    ],
    plugins: [].filter(Boolean) // Removes falsy values (like null when not in development)
  };
};