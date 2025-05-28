import fs from 'node:fs';
import path from 'node:path';
import { config } from '../config';

const ensureLogDirectory = () => {
  if (!fs.existsSync(config.logging.directory)) {
    fs.mkdirSync(config.logging.directory, { recursive: true });
  }
};

export const logWebhook = (identifier: string, timestamp: number, data: unknown): void => {
  ensureLogDirectory();
  const filename = `${identifier}-webhook-body-${timestamp}.json`;
  const filepath = path.join(config.logging.directory, filename);

  try {
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing webhook log:', error);
  }
};

export const error = (message: string, error?: unknown): void => {
  console.error(`[ERROR] ${message}`, error);
};

export const info = (message: string): void => {
  console.log(`[INFO] ${message}`);
};