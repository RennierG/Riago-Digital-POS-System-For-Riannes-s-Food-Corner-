import { HttpError } from './httpError.js';

export const clean = (value) => String(value ?? '').trim();

// A positive whole number id from a URL or JSON body.
export function toId(value, label = 'id') {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1) throw new HttpError(400, `Invalid ${label}.`);
  return n;
}

export function toWholeNumber(value, label, { min = 0, max = 1000000 } = {}) {
  const raw = clean(value);
  const n = Number(raw);
  if (raw === '' || !Number.isInteger(n) || n < min || n > max) throw new HttpError(400, `${label} must be a whole number from ${min} to ${max}.`);
  return n;
}

export function toMoney(value, label) {
  const n = Number(value);
  if (clean(value) === '' || !Number.isFinite(n) || n <= 0 || n > 9999) throw new HttpError(400, `${label} must be a number greater than 0 and at most 9999.`);
  return Math.round(n * 100) / 100;
}

export function toPhone(value) {
  const phone = clean(value);
  if (!/^\d{11}$/.test(phone)) throw new HttpError(400, 'Contact number must be exactly 11 digits.');
  return phone;
}
