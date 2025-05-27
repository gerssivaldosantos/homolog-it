import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  slack: {
    token: process.env.SLACK_TOKEN,
    defaultChannel: process.env.SLACK_DEFAULT_CHANNEL || 'C08TXTNUWG3',
  },
  linear: {
    webhookSecret: process.env.LINEAR_WEBHOOK_SECRET,
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    directory: process.env.LOG_DIRECTORY || './logs',
  },
} as const;

// Validate required environment variables
const requiredEnvVars = ['SLACK_TOKEN'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
} 