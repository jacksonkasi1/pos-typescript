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

// ── API Validation Error Tests ────────────────────────────────────────
describe('POS API Validation Checks', () => {
  it('POST /api/tenants requires name', async () => {
    const res = await request(app).post('/api/tenants').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Tenant name is required');
  });

  it('POST /api/products requires tenantId, name, priceCents', async () => {
    const res = await request(app).post('/api/products').send({ name: 'Coffee' });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('tenantId, name, and priceCents are required');
  });

  it('POST /api/tables requires tenantId, name, token', async () => {
    const res = await request(app).post('/api/tables').send({ tenantId: 1, name: 'T1' });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('tenantId, name, and token are required');
  });

  it('POST /api/orders requires tenantId', async () => {
    const res = await request(app).post('/api/orders').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('tenantId is required');
  });
});
