import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',

  base: {
    service: process.env.SERVICE_NAME ?? 'personal-cms-backend',
  },

  timestamp: pino.stdTimeFunctions.isoTime,

  formatters: {
    level(label) {
      return { level: label };
    },
  },

  serializers: {
    err: pino.stdSerializers.err,
  },
});