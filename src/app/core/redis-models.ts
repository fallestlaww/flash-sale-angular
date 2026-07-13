export interface RedisValue {
  key: string;
  value: string;
  ttlSeconds: number;
}

export interface RedisSetResult {
  key: string;
  stored: boolean;
}

export interface RedisCounter {
  key: string;
  value: number;
}

export interface RedisCas {
  key: string;
  swapped: boolean;
}

export interface RedisTtl {
  key: string;
  ttlSeconds: number;
}

export interface RedisSize {
  size: number;
}

export interface RedisSnapshot {
  path: string;
  size: number;
}
