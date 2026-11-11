import { randomBytes, scrypt as derive, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';
const scrypt = promisify(derive);
export async function hashPassword(password: string) { const salt = randomBytes(16).toString('hex'); const hash = await scrypt(password, salt, 64) as Buffer; return salt + ':' + hash.toString('hex'); }
export async function verifyPassword(password: string, stored: string) { const [salt, value] = stored.split(':'); if (!salt || !value) return false; const actual = await scrypt(password, salt, 64) as Buffer; const expected = Buffer.from(value, 'hex'); return actual.length === expected.length && timingSafeEqual(actual, expected); }
export const token = () => randomBytes(32).toString('hex');
export const digest = (value: string) => createHash('sha256').update(value).digest('hex');
