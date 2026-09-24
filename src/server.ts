import 'dotenv/config'; // must come first
import { app } from './app';
import { logger } from './lib/logger';
import { prisma } from './lib/prisma';

const PORT = Number(process.env.PORT ?? 3000);

async function bootstrap(): Promise<void> {
  await prisma.$connect();

  const server = app.listen(PORT, () => {
    logger.info({ port: PORT }, 'Server started');
  });

  const shutdown = async (signal: string): Promise<void> => {
    logger.info({ signal }, 'Shutting down');
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

bootstrap().catch((err) => {
  logger.error({ err }, 'Failed to start server');
  process.exit(1);
});