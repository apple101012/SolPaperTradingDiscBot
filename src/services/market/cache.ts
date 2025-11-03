import { CONFIG } from "../../config/env.ts";
type Entry<T> = { value: T; exp: number };

const store = new Map<string, Entry<any>>();

export function getCache<T>(key: string): T | undefined {
  const ent = store.get(key);
  if (!ent) return;
  if (Date.now() > ent.exp) { store.delete(key); return; }
  return ent.value as T;
}

export function setCache<T>(key: string, val: T, ttlSec = CONFIG.CACHE_TTL_SECONDS) {
  store.set(key, { value: val, exp: Date.now() + ttlSec * 1000 });
}
