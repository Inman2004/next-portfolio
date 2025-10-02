import 'server-only';
import { Resend } from 'resend';

const RESEND_INSTANCE_KEY = Symbol.for('resendInstance');

interface GlobalWithResend {
  [RESEND_INSTANCE_KEY]?: Resend;
}

function initializeResend(): Resend {
  const globalWithResend = global as GlobalWithResend;

  if (globalWithResend[RESEND_INSTANCE_KEY]) {
    return globalWithResend[RESEND_INSTANCE_KEY];
  }

  if (!process.env.RESEND_API_KEY) {
    throw new Error('Resend API key is not set in environment variables. Please check your .env.local file.');
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  globalWithResend[RESEND_INSTANCE_KEY] = resend;

  return resend;
}

const resend = new Proxy({}, { get: (_, prop) => Reflect.get(initializeResend(), prop) }) as Resend;

export { resend };