import { WebClient, LogLevel } from '@slack/web-api';
import { notifyIssueUpdate, formatReadyForQAMessage } from './service';
import { config } from '../config';

jest.mock('@slack/web-api', () => {
  const mockPostMessage = jest.fn().mockResolvedValue({ ok: true });
  return {
    WebClient: jest.fn().mockImplementation(() => ({
      chat: {
        postMessage: mockPostMessage
      }
    })),
    LogLevel: {
      DEBUG: 'DEBUG'
    },
    __esModule: true,
    mockPostMessage
  };
});

jest.mock('../config', () => ({
  config: {
    slack: {
      token: 'test-token',
      defaultChannel: 'test-channel'
    }
  }
}));

describe('Slack Service', () => {
  let mockPostMessage: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPostMessage = require('@slack/web-api').mockPostMessage;
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('formatReadyForQAMessage', () => {
    it('should format the message correctly with one user', () => {
      const message = formatReadyForQAMessage({
        mainUser: 'user1',
        cardTitle: 'Test Card',
        cardUrl: 'https://linear.app/issue/1',
        otherUsers: []
      });

      expect(message).toContain('<@user1>');
      expect(message).toContain('Test Card');
      expect(message).toContain('https://linear.app/issue/1');
      expect(message).not.toContain('FYI');
    });

    it('should format the message correctly with multiple users', () => {
      const message = formatReadyForQAMessage({
        mainUser: 'user1',
        cardTitle: 'Test Card',
        cardUrl: 'https://linear.app/issue/1',
        otherUsers: ['user2', 'user3']
      });

      expect(message).toContain('<@user1>');
      expect(message).toContain('<@user2>');
      expect(message).toContain('<@user3>');
      expect(message).toContain('FYI');
    });
  });

  describe('notifyIssueUpdate', () => {
    it('should send a message to the default channel', async () => {
      await notifyIssueUpdate('test message');
      expect(WebClient).toHaveBeenCalledWith('test-token', expect.any(Object));
      expect(mockPostMessage).toHaveBeenCalledWith({
        token: 'test-token',
        channel: 'test-channel',
        text: 'test message'
      });
    });

    it('should send a message to the default channel when undefined', async () => {
      (config as any).slack.defaultChannel = undefined;
      await notifyIssueUpdate('test message');
      expect(WebClient).toHaveBeenCalledWith('test-token', expect.any(Object));
      expect(mockPostMessage).toHaveBeenCalledWith({
        token: 'test-token',
        channel: '',
        text: 'test message'
      });
    });

    it('should send a message when the token is undefined', async () => {
      (config as any).slack.token = undefined;
      await notifyIssueUpdate('test message');
      expect(WebClient).toHaveBeenCalledWith(undefined, expect.any(Object));
      expect(mockPostMessage).toHaveBeenCalledWith({
        token: undefined,
        channel: '',
        text: 'test message'
      });
    });

    it('should throw an error when the API fails', async () => {
      const mockError = new Error('API Error');
      mockPostMessage.mockRejectedValueOnce(mockError);

      await expect(notifyIssueUpdate('test message')).rejects.toThrow('API Error');
      expect(console.error).toHaveBeenCalledWith('Error publishing message to Slack:', mockError);
    });
  });
});

