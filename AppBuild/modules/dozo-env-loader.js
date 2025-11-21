import fs from 'fs';
import path from 'path';

export function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return {};
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
  const env = {};
  for (const line of lines) {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
  }
  return env;
}
