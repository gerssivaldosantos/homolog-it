import { Request, Response } from 'express';
import { LinearWebhookBody } from '../types/linear';
import { SlackService } from '../services/slack.service';
import { Logger } from '../utils/logger';

export class LinearController {
  private slackService: SlackService;

  constructor() {
    this.slackService = new SlackService();
  }

  async handleWebhook(req: Request<{}, {}, LinearWebhookBody>, res: Response): Promise<void> {
    try {
      const signature = req.headers['linear-signature'];

      if (req.body.type === 'Issue') {
        // Log the webhook data
        Logger.logWebhook(
          req.body.data.identifier,
          req.body.webhookTimestamp,
          req.body
        );

        // Notify Slack about the issue update
        await this.slackService.notifyIssueUpdate(
          req.body.data.url,
          req.body.data.title,
          req.body.data.state.name
        );
      }

      res.status(200).json({ received: true });
    } catch (error) {
      Logger.error('Error handling Linear webhook:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
} 