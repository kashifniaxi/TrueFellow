import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { applyMiddleware } from 'graphql-middleware';
import { makeExecutableSchema } from '@graphql-tools/schema';
import depthLimit from 'graphql-depth-limit';
import rateLimit from 'express-rate-limit';

import typeDefs    from './graphql/schema/index.js';
import resolvers   from './graphql/resolvers/index.js';
import { context } from './graphql/context.js';
import { permissions } from './graphql/permissions.js';
import uploadRouter from './routes/upload.routes.js';
import logger from './utils/logger.js';

// Build executable schema and apply graphql-shield middleware
const execSchema = makeExecutableSchema({ typeDefs, resolvers });
const schemaWithPermissions = applyMiddleware(execSchema, permissions);

// Rate limiter: 200 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
});

export const createApp = async () => {
  const app = express();

  // ─── Body parser ─────────────────────────────────────────────────────────────
  app.use(express.json({ limit: '1mb' }));

  // ─── Global rate limiting ─────────────────────────────────────────────────────
  app.use('/graphql', limiter);
  app.use('/api',     limiter);

  // ─── REST endpoints ───────────────────────────────────────────────────────────
  app.use('/api/upload', uploadRouter);

  // ─── Health check ─────────────────────────────────────────────────────────────
  app.get('/health', (_, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

  // ─── Apollo Server ────────────────────────────────────────────────────────────
  const server = new ApolloServer({
    schema:           schemaWithPermissions,
    context,
    validationRules:  [depthLimit(7)],
    formatError: (err) => {
      logger.error('GraphQL Error', { message: err.message, path: err.path });
      return {
        message: err.message,
        code:    err.extensions?.code,
        path:    err.path,
      };
    },
  });

  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });

  return app;
};