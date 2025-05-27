import express from 'express';
import { config } from './config';
import { LinearController } from './controllers/linear.controller';
import { Logger } from './utils/logger';

const app = express();
const linearController = new LinearController();

app.use(express.json());

app.post('/webhook/linear', (req, res) => linearController.handleWebhook(req, res));

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  Logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(config.port, () => {
  Logger.info(`Server is running on port ${config.port}`);
}); 