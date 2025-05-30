import { WebClient, LogLevel } from "@slack/web-api";
import { config } from '../config';

const createSlackClient = () => {
  return new WebClient(config.slack.token, {
    logLevel: LogLevel.DEBUG
  });
};

const publishMessage = async (
  client: WebClient,
  channelId: string,
  text: string
): Promise<void> => {
  try {
    await client.chat.postMessage({
      token: config.slack.token,
      channel: channelId,
      text: text
    });
  } catch (error) {
    console.error('Error publishing message to Slack:', error);
    throw error;
  }
};

export const formatReadyForQAMessage = ({
  mainUser,
  cardTitle,
  cardUrl,
  otherUsers,
}: {
  mainUser: string;
  cardTitle: string;
  cardUrl: string;
  otherUsers: string[];
}): string => {
  const userMentions = otherUsers.map(user => `<@${user}>`).join(' ');
  const fyiSection = userMentions ? `\n\nFYI ${userMentions}` : '';

  return `Fala, <@${mainUser}>!

<${cardUrl}|${cardTitle}> está pronto para ser homologado. :eggplant:

Verifique o que foi implementado e:
-> Se estiver tudo certo, mova para *Ready to Prod*. :green_heart:
-> Se houver problemas, mova para *In Progress*. :large_yellow_circle:${fyiSection}`;
};

export const notifyIssueUpdate = async (message: string): Promise<void> => {
  const client = createSlackClient();
  await publishMessage(client, config.slack.defaultChannel || '', message);
};

export const slackService = { notifyIssueUpdate, formatReadyForQAMessage };
