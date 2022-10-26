import bunyan from "bunyan";

export const logger = bunyan.createLogger({
  name: "guardian",
  streams: [
    {
      level: "info",
      stream: process.stdout, // log INFO and above to stdout
    },
    {
      level: "warn",
      stream: process.stdout, // log warn and above to stdout
      path: "logs/warning.log", // log WARN and above to a file
    },
    {
      level: "error",
      stream: process.stdout, // log error and above to stdout
      path: "logs/error.log", // log ERROR and above to a file
    },
  ],
});
