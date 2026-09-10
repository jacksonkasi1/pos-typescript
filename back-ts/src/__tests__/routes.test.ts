import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../app';

// ── Health / Root route tests ─────────────────────────────────────────
describe('GET /', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.message).toContain('POS Backend');
  });
});

describe('GET /health', () => {
  it('returns 200 healthy with timestamp', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.timestamp).toBeDefined();
    // should be a valid ISO date string
    expect(new Date(res.body.timestamp).toString()).not.toBe('Invalid Date');
  });
});

describe('GET /notfound', () => {
  it('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/notfound');
    expect(res.status).toBe(404);
  });
});

// ── Content-type cross-check ─────────────────────────────────────────
describe('Cross-check: JSON content-type', () => {
  it('root route returns application/json', async () => {
    const res = await request(app).get('/');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });

  it('health route returns application/json', async () => {
    const res = await request(app).get('/health');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
});

// ── Schema validation cross-check ────────────────────────────────────
describe('Cross-check: response shape', () => {
  it('root returns { status, message }', async () => {
    const res = await request(app).get('/');
    expect(res.body).toHaveProperty('status');
    expect(res.body).toHaveProperty('message');
    expect(typeof res.body.status).toBe('string');
    expect(typeof res.body.message).toBe('string');
  });

  it('health returns { status, timestamp }', async () => {
    const res = await request(app).get('/health');
    expect(res.body).toHaveProperty('status');
    expect(res.body).toHaveProperty('timestamp');
  });
});
