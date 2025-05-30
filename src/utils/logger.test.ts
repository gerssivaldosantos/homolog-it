import fs from 'node:fs';
import path from 'node:path';
import { logWebhook, error, info } from './logger';

jest.mock('node:fs', () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn()
}));

jest.mock('../config', () => ({
  config: {
    logging: {
      directory: '/mock/log/dir'
    }
  }
}));

describe('Logger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'log').mockImplementation();
  });

  describe('logWebhook', () => {
    it('should create a directory if it does not exist', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      logWebhook('test-123', 1234567890, { data: 'test' });
      expect(fs.mkdirSync).toHaveBeenCalledWith('/mock/log/dir', { recursive: true });
    });

    it('should not create a directory if it already exists', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      logWebhook('test-123', 1234567890, { data: 'test' });
      expect(fs.mkdirSync).not.toHaveBeenCalled();
    });

    it('should write a file with formatted data', () => {
      const data = { test: 'data' };
      logWebhook('test-123', 1234567890, data);
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        path.join('/mock/log/dir', 'test-123-webhook-body-1234567890.json'),
        JSON.stringify(data, null, 2)
      );
    });

    it('should handle an error when writing a file', () => {
      const mockError = new Error('Write error');
      (fs.writeFileSync as jest.Mock).mockImplementation(() => {
        throw mockError;
      });
      logWebhook('test-123', 1234567890, { data: 'test' });
      expect(console.error).toHaveBeenCalledWith('Error writing webhook log:', mockError);
    });
  });

  describe('error', () => {
    it('should log an error message without an error object', () => {
      error('Test error');
      expect(console.error).toHaveBeenCalledWith('[ERROR] Test error', undefined);
    });

    it('should log an error message with an error object', () => {
      const mockError = new Error('Test error');
      error('Test error', mockError);
      expect(console.error).toHaveBeenCalledWith('[ERROR] Test error', mockError);
    });
  });

  describe('info', () => {
    it('should log an informative message', () => {
      info('Test info');
      expect(console.log).toHaveBeenCalledWith('[INFO] Test info');
    });
  });
});
