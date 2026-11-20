import { describe, expect, it } from 'vitest';
import { api, createProduct } from './helpers.ts';

describe('GET /api/products con filtros', () => {
  it('filtra por categoría', async () => {
    const lampara = createProduct({ category: 'filtro-test', priceCents: 2500 });
    const sofa = createProduct({ category: 'filtro-test', priceCents: 50000 });

    const res = await api().get('/api/products?category=filtro-test');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([lampara, sofa]);
  });

  it('filtra por precio máximo, incluido el límite', async () => {
    const exacto = createProduct({ priceCents: 3000 });
    const caro = createProduct({ priceCents: 3001 });

    const res = await api().get('/api/products?maxPriceCents=3000');

    expect(res.status).toBe(200);
    expect(res.body).toContainEqual(exacto);
    expect(res.body).not.toContainEqual(caro);
    for (const product of res.body) expect(product.priceCents).toBeLessThanOrEqual(3000);
  });

  it('combina ambos filtros', async () => {
    const barato = createProduct({ category: 'filtro-test', priceCents: 2000 });
    createProduct({ category: 'filtro-test', priceCents: 4000 });
    createProduct({ category: 'otra', priceCents: 1000 });

    const res = await api().get('/api/products?category=filtro-test&maxPriceCents=3000');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([barato]);
  });

  it('devuelve lista vacía si nada coincide', async () => {
    const res = await api().get('/api/products?category=no-existe');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it.each([
    'maxPriceCents=abc',
    'maxPriceCents=-1',
    'maxPriceCents=10.5',
    'maxPriceCents=',
    'category=',
    'category=a&category=b',
  ])('responde 400 si el parámetro no es válido (%s)', async (query) => {
    const res = await api().get(`/api/products?${query}`);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});
