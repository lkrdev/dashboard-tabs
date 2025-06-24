const { merge } = require("webpack-merge");
const common = require("./webpack.config");

module.exports = merge(common, {
  mode: "development",
  infrastructureLogging: {
    level: "warn",
  },
  devServer: {
    host: "localhost",
    allowedHosts: "all",
    webSocketServer: false,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers":
        "X-Requested-With, content-type, Authorization",
    },
    client: {
      overlay: {
        runtimeErrors: (error) => {
          if (
            error.message ===
            "ResizeObserver loop completed with undelivered notifications."
          ) {
            return false;
          } else if (
            error.message ===
            "AbortSignal.timeout is not defined. Timeout will use default behavior"
          ) {
            return false;
          }
          return true;
        },
      },
    },
  },
  stats: "errors-warnings",
});
