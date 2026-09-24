import express from 'express';
import { requestIdMiddleware } from './middleware/request-id.middleware';
import { requestLogger } from './middleware/request-logger.middleware';
import { errorHandler } from './middleware/error.middleware';
import { notFoundHandler } from './middleware/not-found.middleware';
import { router } from './routes';

export const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 1. Attach request id first — everything downstream can log it.
app.use(requestIdMiddleware);

// 2. Then log requests.
app.use(requestLogger);

// 3. Routes (auth middleware is applied per-route, not globally).
app.use('/api', router);

// 4. 404 for anything unmatched.
app.use(notFoundHandler);

// 5. Error handler MUST be last, and MUST have 4 args.
app.use(errorHandler);