import { WebClient, LogLevel } from "@slack/web-api";
import { config } from '../config';

export class SlackService {
  private client: WebClient;

  constructor() {
    this.client = new WebClient(config.slack.token, {
      logLevel: LogLevel.DEBUG
    });
  }

  async publishMessage(channelId: string, text: string): Promise<void> {
    try {
      await this.client.chat.postMessage({
        token: config.slack.token,
        channel: channelId,
        text: text
      });
    } catch (error) {
      console.error('Error publishing message to Slack:', error);
      throw error;
    }
  }

  async notifyIssueUpdate(issueUrl: string, issueTitle: string, stateName: string): Promise<void> {
    const message = `Issue <${issueUrl}|${issueTitle}> moved to "${stateName}" :eggplant:`;
    await this.publishMessage(config.slack.defaultChannel, message);
  }
} 