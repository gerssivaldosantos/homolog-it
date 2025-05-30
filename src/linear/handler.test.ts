import { Request, Response, NextFunction } from 'express';
import { linearHandler } from './handler';
import { handleIssueUpdate } from './service';
import { error as logError } from '../utils/logger';

jest.mock('./service', () => ({
  handleIssueUpdate: jest.fn()
}));

jest.mock('../utils/logger', () => ({
  error: jest.fn()
}));

jest.mock('../config', () => ({
  config: {
    linear: {
      teamKey: 'TEST-TEAM'
    }
  }
}));

describe('Linear Handler', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let handler: (req: Request, res: Response, next: NextFunction) => Promise<void>;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockNext = jest.fn();
    mockRequest = {
      body: {
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
      }
    };
    mockResponse = {
      status: mockStatus,
      json: mockJson
    };
    jest.clearAllMocks();


    const route = linearHandler.stack[0].route;
    if (route && route.stack && route.stack[0]) {
      handler = route.stack[0].handle;
    } else {
      throw new Error('Handler not found in router stack');
    }
  });

  it('should return 200 when the payload is valid', async () => {
    await handler(mockRequest as Request, mockResponse as Response, mockNext);
    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith({ received: true });
    expect(handleIssueUpdate).toHaveBeenCalledWith(mockRequest.body);
  });

  it('should return 400 when the payload is invalid', async () => {
    mockRequest.body = { invalid: 'data' };
    await handler(mockRequest as Request, mockResponse as Response, mockNext);
    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith({
      error: 'Invalid webhook payload',
      details: expect.any(Object)
    });
  });

  it('should return 400 when the team key is invalid', async () => {
    mockRequest.body.data.team.key = 'WRONG-TEAM';
    await handler(mockRequest as Request, mockResponse as Response, mockNext);
    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith({
      error: 'Invalid team key',
      details: 'WRONG-TEAM'
    });
  });

  it('should return 500 when an internal error occurs', async () => {
    (handleIssueUpdate as jest.Mock).mockRejectedValueOnce(new Error('Test error'));
    await handler(mockRequest as Request, mockResponse as Response, mockNext);
    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({ error: 'Internal server error' });
    expect(logError).toHaveBeenCalledWith('Error handling Linear webhook:', expect.any(Error));
  });
});
