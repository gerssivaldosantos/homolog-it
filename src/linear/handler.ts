import { Router } from 'express';
import type { Request, Response } from 'express';
import { error as logError } from '../utils/logger';
import { handleIssueUpdate } from './service';
import { linearIssueDataSchema } from './schema';

const router = Router();

const handleLinearWebhook = async (req: Request, res: Response) => {
  try {
    const validationResult = linearIssueDataSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Invalid webhook payload',
        details: validationResult.error.format()
      });
    }

    await handleIssueUpdate(validationResult.data);
    res.status(200).json({ received: true });
  } catch (error) {
    logError('Error handling Linear webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

router.post('/linear', handleLinearWebhook);

export const linearHandler = router;
