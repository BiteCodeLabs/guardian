import { format, createLogger, transports } from "winston";

const { combine, timestamp, label, printf } = format;
const CATEGORY = "Guardian";

const customFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});
const logger = createLogger({
  level: "debug",
  format: combine(
    label({ label: CATEGORY }),
    timestamp({
      format: "MMM-DD-YYYY HH:mm:ss",
    }),
    customFormat
  ),
  transports: [
    new transports.File({
      filename: "logs/info.log",
    }),
    new transports.File({
      level: "error",
      filename: "logs/error.log",
    }),
    new transports.Console(),
  ],
});

export default logger;
