import { Request, Response } from 'express';
import { LinearWebhookBody } from '../types/linear';
import { SlackService } from '../services/slack.service';
import { Logger } from '../utils/logger';
import { getReadyForQAMessage } from '../utils/message';

export class LinearController {
  private slackService: SlackService;

  constructor() {
    this.slackService = new SlackService();
  }

  async handleWebhook(req: Request<{}, {}, LinearWebhookBody>, res: Response): Promise<void> {
    try {
      const signature = req.headers['linear-signature'];

      if (req.body.type === 'Issue') {
        if (process.env.LOG_WEBHOOK === 'TRUE') {
          Logger.logWebhook(
            req.body.data.identifier,
            req.body.webhookTimestamp,
            req.body
          );
        }

        const message = getReadyForQAMessage({
          mainUser: 'U08TYNR21FG',
          cardTitle: req.body.data.title,
          otherUsers: ['U08UF7012SV'],
        });
        await this.slackService.notifyIssueUpdate(
          message
        );
      }

      res.status(200).json({ received: true });
    } catch (error) {
      Logger.error('Error handling Linear webhook:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
} 