import fs from 'fs';
import path from 'path';
import { config } from '../config';

export class Logger {
  private static ensureLogDirectory() {
    if (!fs.existsSync(config.logging.directory)) {
      fs.mkdirSync(config.logging.directory, { recursive: true });
    }
  }

  static logWebhook(identifier: string, timestamp: number, data: unknown): void {
    this.ensureLogDirectory();
    const filename = `${identifier}-webhook-body-${timestamp}.json`;
    const filepath = path.join(config.logging.directory, filename);

    try {
      fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error writing webhook log:', error);
    }
  }

  static error(message: string, error?: unknown): void {
    console.error(`[ERROR] ${message}`, error);
  }

  static info(message: string): void {
    console.log(`[INFO] ${message}`);
  }
} 