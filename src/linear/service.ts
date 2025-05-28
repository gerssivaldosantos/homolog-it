import { logWebhook } from '../utils/logger';
import { notifyIssueUpdate, formatReadyForQAMessage } from '../slack/service';
import type { LinearWebhookSchema } from './schema';

export const isIssueInHomolog = (webhookBody: LinearWebhookSchema): boolean => {
  return webhookBody.type === 'Issue' && webhookBody.data.state.name === 'In Homolog';
};

export const handleIssueUpdate = async (webhookBody: LinearWebhookSchema): Promise<void> => {
  if (isIssueInHomolog(webhookBody)) {
    if (process.env.LOG_WEBHOOK === 'TRUE') {
      logWebhook(
        webhookBody.data.identifier,
        webhookBody.data.webhookTimestamp || Date.now(),
        webhookBody
      );
    }

    const message = formatReadyForQAMessage({
      mainUser: process.env.MAIN_USER || '',
      cardTitle: webhookBody.data.title,
      cardUrl: webhookBody.data.url,
      otherUsers: process.env.OTHER_USERS?.split(',') || [],
    });

    await notifyIssueUpdate(message);
  }
};
