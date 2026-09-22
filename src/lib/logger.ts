import pino from "pino";
import * as dotenv from 'dotenv';

dotenv.config()



export const logger = pino({
  level: process.env.LOG_LEVEL || "info",

  base: {
    service: process.env.BASE_URL,
  },

  timestamp: pino.stdTimeFunctions.isoTime,

  formatters: {
    level(label) {
      return {
        level: label,
      };
    },
  },

  serializers: {
    err: pino.stdSerializers.err,
  },
});

