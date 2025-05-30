import { isIssueInHomolog, handleIssueUpdate } from './service';
import type { LinearWebhookSchema } from './schema';
import { notifyIssueUpdate } from '../slack/service';
import { logWebhook } from '../utils/logger';

jest.mock('../utils/logger', () => ({
  logWebhook: jest.fn()
}));

jest.mock('../slack/service', () => ({
  notifyIssueUpdate: jest.fn(),
  formatReadyForQAMessage: jest.fn().mockReturnValue('formatted message')
}));

describe('isIssueInHomolog', () => {
  it('should return true when the issue is in homolog', () => {
    const webhook: LinearWebhookSchema = {
      type: 'Issue',
      action: 'update',
      actor: { id: '1', name: 'User' },
      createdAt: '',
      updatedFrom: {},
      data: {
        state: { name: 'In Homolog' },
        identifier: 'ISSUE-1',
        title: 'Título',
        url: '',
        team: { key: 'ENG' }
      }
    };
    expect(isIssueInHomolog(webhook)).toBe(true);
  });

  it('should return false when the issue is not in homolog', () => {
    const webhook = { type: 'Other', data: { state: { name: 'In Homolog' } } } as any;
    expect(isIssueInHomolog(webhook)).toBe(false);
  });

  it('should return false when it is not an issue', () => {
    const webhook = { type: 'Other', data: { state: { name: 'In Homolog' } } } as any;
    expect(isIssueInHomolog(webhook)).toBe(false);
  });
});

describe('handleIssueUpdate', () => {
  const baseWebhook: LinearWebhookSchema = {
    type: 'Issue',
    action: 'update',
    actor: { id: '1', name: 'User' },
    createdAt: '',
    updatedFrom: {},
    data: {
      state: { name: 'In Homolog' },
      identifier: 'ISSUE-1',
      title: 'Título',
      url: 'url',
      team: { key: 'ENG' }
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.LOG_WEBHOOK = 'TRUE';
    process.env.MAIN_USER = 'main';
    process.env.OTHER_USERS = 'a,b';
  });

  afterEach(() => {
    delete process.env.LOG_WEBHOOK;
    delete process.env.MAIN_USER;
    delete process.env.OTHER_USERS;
  });

  it('should notify when the issue is in homolog and LOG_WEBHOOK is TRUE', async () => {
    await handleIssueUpdate(baseWebhook);
    expect(logWebhook).toHaveBeenCalledWith(
      baseWebhook.data.identifier,
      expect.any(Number),
      baseWebhook
    );
    expect(notifyIssueUpdate).toHaveBeenCalledWith('formatted message');
  });

  it('should notify when the issue is in homolog and LOG_WEBHOOK is not TRUE', async () => {
    process.env.LOG_WEBHOOK = 'FALSE';
    await handleIssueUpdate(baseWebhook);
    expect(logWebhook).not.toHaveBeenCalled();
    expect(notifyIssueUpdate).toHaveBeenCalledWith('formatted message');
  });

  it('should not notify when the issue is not in homolog', async () => {
    const webhook = { ...baseWebhook, data: { ...baseWebhook.data, state: { name: 'Done' } } };
    await handleIssueUpdate(webhook);
    expect(logWebhook).not.toHaveBeenCalled();
    expect(notifyIssueUpdate).not.toHaveBeenCalled();
  });

  it('should use webhookTimestamp when available', async () => {
    const webhookWithTimestamp: LinearWebhookSchema = {
      ...baseWebhook,
      data: {
        ...baseWebhook.data,
        webhookTimestamp: 1234567890
      }
    };
    await handleIssueUpdate(webhookWithTimestamp);
    expect(logWebhook).toHaveBeenCalledWith(
      webhookWithTimestamp.data.identifier,
      1234567890,
      webhookWithTimestamp
    );
  });

  it('should use Date.now() when webhookTimestamp is not present', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(5555555555);
    const webhookWithoutTimestamp: LinearWebhookSchema = {
      ...baseWebhook,
    };
    await handleIssueUpdate(webhookWithoutTimestamp);
    expect(logWebhook).toHaveBeenCalledWith(
      webhookWithoutTimestamp.data.identifier,
      5555555555,
      webhookWithoutTimestamp
    );
    (Date.now as jest.Mock).mockRestore();
  });
});

describe('Linear Service', () => {
  const mockWebhookBody: LinearWebhookSchema = {
    type: 'Issue',
    action: 'update',
    actor: { id: '1', name: 'User' },
    createdAt: '',
    updatedFrom: {},
    data: {
      state: { name: 'In Homolog' },
      identifier: 'ISSUE-1',
      title: 'Test',
      url: 'https://linear.app/issue/1',
      team: { key: 'TEST-TEAM' }
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.LOG_WEBHOOK = 'TRUE';
    process.env.MAIN_USER = 'user1';
    process.env.OTHER_USERS = 'user2,user3';
  });

  afterEach(() => {
    delete process.env.LOG_WEBHOOK;
    delete process.env.MAIN_USER;
    delete process.env.OTHER_USERS;
  });

  describe('isIssueInHomolog', () => {
    it('should return true when the issue is in homolog', () => {
      expect(isIssueInHomolog(mockWebhookBody)).toBe(true);
    });

    it('should return false when the issue is not in homolog', () => {
      const notInHomolog: LinearWebhookSchema = {
        ...mockWebhookBody,
        data: {
          ...mockWebhookBody.data,
          state: { name: 'In Progress' }
        }
      };
      expect(isIssueInHomolog(notInHomolog)).toBe(false);
    });

    it('should return false when it is not an issue', () => {
      const webhook = { type: 'Other', data: { state: { name: 'In Homolog' } } } as any;
      expect(isIssueInHomolog(webhook)).toBe(false);
    });
  });

  describe('handleIssueUpdate', () => {
    it('should notify when the issue is in homolog and LOG_WEBHOOK is TRUE', async () => {
      await handleIssueUpdate(mockWebhookBody);
      expect(logWebhook).toHaveBeenCalledWith(
        mockWebhookBody.data.identifier,
        mockWebhookBody.data.webhookTimestamp || expect.any(Number),
        mockWebhookBody
      );
      expect(notifyIssueUpdate).toHaveBeenCalledWith('formatted message');
    });

    it('should notify when the issue is in homolog and LOG_WEBHOOK is not TRUE', async () => {
      process.env.LOG_WEBHOOK = 'FALSE';
      await handleIssueUpdate(mockWebhookBody);
      expect(logWebhook).not.toHaveBeenCalled();
      expect(notifyIssueUpdate).toHaveBeenCalledWith('formatted message');
    });

    it('should not notify when the issue is not in homolog', async () => {
      const notInHomolog: LinearWebhookSchema = {
        ...mockWebhookBody,
        data: {
          ...mockWebhookBody.data,
          state: { name: 'In Progress' }
        }
      };
      await handleIssueUpdate(notInHomolog);
      expect(logWebhook).not.toHaveBeenCalled();
      expect(notifyIssueUpdate).not.toHaveBeenCalled();
    });

    it('should use webhookTimestamp when available', async () => {
      const webhookWithTimestamp: LinearWebhookSchema = {
        ...mockWebhookBody,
        data: {
          ...mockWebhookBody.data,
          webhookTimestamp: 1234567890
        }
      };
      await handleIssueUpdate(webhookWithTimestamp);
      expect(logWebhook).toHaveBeenCalledWith(
        webhookWithTimestamp.data.identifier,
        1234567890,
        webhookWithTimestamp
      );
    });
  });
});
