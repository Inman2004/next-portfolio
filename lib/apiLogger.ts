import fs from 'fs';
import path from 'path';

const LOG_DIR = path.join(process.cwd(), 'logs');
const LOG_FILE = path.join(LOG_DIR, 'api-debug.log');

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

export function logToFile(message: string, data?: any) {
  const timestamp = new Date().toISOString();
  let logMessage = `[${timestamp}] ${message}\n`;
  
  if (data) {
    try {
      logMessage += `Data: ${JSON.stringify(data, null, 2)}\n`;
    } catch (e) {
      logMessage += `[Non-serializable data]\n`;
    }
  }
  
  logMessage += '\n' + '-'.repeat(80) + '\n';
  
  // Log to console in development
  if (process.env.NODE_ENV !== 'production') {
    console.log(logMessage);
  }
  
  // Append to log file
  fs.appendFileSync(LOG_FILE, logMessage, 'utf-8');
}

export function logError(error: Error, context: string = '') {
  const timestamp = new Date().toISOString();
  const errorMessage = `[${timestamp}] ERROR${context ? ` (${context})` : ''}: ${error.message}\n${error.stack || 'No stack trace'}\n`;
  
  // Log to console in development
  if (process.env.NODE_ENV !== 'production') {
    console.error(errorMessage);
  }
  
  // Append to log file
  fs.appendFileSync(LOG_FILE, errorMessage + '\n' + '-'.repeat(80) + '\n', 'utf-8');
}
