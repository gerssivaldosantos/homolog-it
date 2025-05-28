import express from 'express';
import { config } from './config';
import { linearHandler } from './linear/handler';
import { error, info } from './utils/logger';

const app = express();

app.use(express.json());

app.use('/webhook', linearHandler);

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(config.port, () => {
  info(`Server is running on port ${config.port}`);
});
