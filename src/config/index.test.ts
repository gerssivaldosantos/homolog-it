import dotenv from 'dotenv';

jest.mock('dotenv', () => ({
  config: jest.fn()
}));

describe('Config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should load default configuration values', () => {
    process.env = { SLACK_TOKEN: 'xoxb-test' };
    const { config } = require('./index');
    expect(Number(config.port)).toBe(3000);
    expect(config.logging.level).toBe('info');
    expect(config.logging.directory).toBe('./logs');
  });

  it('should load environment-specific configurations', () => {
    process.env = {
      PORT: '4000',
      SLACK_TOKEN: 'xoxb-test',
      SLACK_DEFAULT_CHANNEL: 'C123',
      LINEAR_WEBHOOK_SECRET: 'secret',
      LINEAR_TEAM_KEY: 'TEAM',
      LOG_LEVEL: 'debug',
      LOG_DIRECTORY: '/var/log'
    };

    const { config } = require('./');

    expect(Number(config.port)).toBe(4000);
    expect(config.slack.token).toBe('xoxb-test');
    expect(config.slack.defaultChannel).toBe('C123');
    expect(config.linear.webhookSecret).toBe('secret');
    expect(config.linear.teamKey).toBe('TEAM');
    expect(config.logging.level).toBe('debug');
    expect(config.logging.directory).toBe('/var/log');
  });

  it('should throw an error if SLACK_TOKEN is not defined', () => {
    process.env = {};
    expect(() => require('./')).toThrow('Missing required environment variables: SLACK_TOKEN');
  });

  it('should not throw an error if SLACK_TOKEN is defined', () => {
    process.env = { SLACK_TOKEN: 'xoxb-test' };
    expect(() => require('./')).not.toThrow();
  });
});
