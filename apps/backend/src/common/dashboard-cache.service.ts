import { Injectable } from '@nestjs/common';

type CacheValue = unknown;
type CacheEntry = {
  expiresAt: number;
  createdAt: number;
  value: CacheValue;
};

@Injectable()
export class DashboardCacheService {
  private readonly cache = new Map<string, CacheEntry>();
  private readonly maxEntries = 2000;
  private readonly metrics = {
    hits: 0,
    misses: 0,
    sets: 0,
    invalidations: 0,
    evictionsExpired: 0,
    evictionsCapacity: 0,
  };

  get<T>(userId: string, days: number): T | null {
    const key = this.buildKey(userId, days);
    const now = Date.now();
    const cached = this.cache.get(key);
    if (!cached) {
      this.metrics.misses += 1;
      return null;
    }

    if (cached.expiresAt <= now) {
      this.cache.delete(key);
      this.metrics.misses += 1;
      this.metrics.evictionsExpired += 1;
      return null;
    }

    this.metrics.hits += 1;
    return cached.value as T;
  }

  set<T>(userId: string, days: number, value: T, ttlMs = 45_000): void {
    this.pruneExpired();

    const key = this.buildKey(userId, days);
    this.metrics.sets += 1;
    this.cache.set(key, {
      value,
      createdAt: Date.now(),
      expiresAt: Date.now() + ttlMs,
    });

    this.enforceCapacity();
  }

  invalidateUser(userId: string): number {
    let removed = 0;
    for (const key of this.cache.keys()) {
      if (key.startsWith(`${userId}:`)) {
        this.cache.delete(key);
        removed += 1;
      }
    }

    this.metrics.invalidations += removed;
    return removed;
  }

  clearAllEntries(): number {
    const removed = this.cache.size;
    this.cache.clear();
    this.metrics.invalidations += removed;
    return removed;
  }

  getStats() {
    const totalRequests = this.metrics.hits + this.metrics.misses;
    const hitRate = totalRequests === 0 ? 0 : this.metrics.hits / totalRequests;

    return {
      ...this.metrics,
      entries: this.cache.size,
      hitRate,
      totalRequests,
      maxEntries: this.maxEntries,
    };
  }

  resetStats() {
    this.metrics.hits = 0;
    this.metrics.misses = 0;
    this.metrics.sets = 0;
    this.metrics.invalidations = 0;
    this.metrics.evictionsExpired = 0;
    this.metrics.evictionsCapacity = 0;

    return this.getStats();
  }

  private buildKey(userId: string, days: number): string {
    return `${userId}:${days}`;
  }

  private pruneExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt <= now) {
        this.cache.delete(key);
        this.metrics.evictionsExpired += 1;
      }
    }
  }

  private enforceCapacity(): void {
    if (this.cache.size <= this.maxEntries) {
      return;
    }

    const ordered = Array.from(this.cache.entries()).sort((a, b) => a[1].createdAt - b[1].createdAt);
    const overflow = this.cache.size - this.maxEntries;
    for (let i = 0; i < overflow; i++) {
      const victim = ordered[i];
      if (!victim) {
        break;
      }

      this.cache.delete(victim[0]);
      this.metrics.evictionsCapacity += 1;
    }
  }
}
