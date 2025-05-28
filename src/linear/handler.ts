import { Router } from 'express';
import type { Request, Response } from 'express';
import { error as logError } from '../utils/logger';
import { handleIssueUpdate } from './service';
import { linearIssueDataSchema } from './schema';
import { config } from '../config';

const router = Router();

const handleLinearWebhook = async (req: Request, res: Response) => {
  try {
    const { success, error, data: result } = linearIssueDataSchema.safeParse(req.body);

    if (!success) {
      return res.status(400).json({
        error: 'Invalid webhook payload',
        details: error.format()
      });
    }

    if (result.data.team.key !== config.linear.teamKey) {
      return res.status(400).json({
        error: 'Invalid team key',
        details: result.data.team.key
      });
    }

    await handleIssueUpdate(result);
    res.status(200).json({ received: true });
  } catch (error) {
    logError('Error handling Linear webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

router.post('/linear', handleLinearWebhook);

export const linearHandler = router;
