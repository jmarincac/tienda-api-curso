import express from 'express';
import { z } from 'zod';
import { idParamsSchema, parse } from '../shared/validation.ts';
import { getProduct, listProducts } from './service.ts';

export const productsRouter = express.Router();

/** Filtros de `GET /api/products`. El precio va en céntimos, como entero no negativo. */
const productFiltersSchema = z.object({
  category: z.string().trim().min(1).optional(),
  maxPriceCents: z
    .string()
    .regex(/^\d+$/, 'Debe ser un número entero de céntimos')
    .transform(Number)
    .optional(),
});

productsRouter.get('/', (req, res) => {
  const filters = parse(productFiltersSchema, req.query);
  res.json(listProducts(filters));
});

productsRouter.get('/:id', (req, res) => {
  const { id } = parse(idParamsSchema, req.params);
  res.json(getProduct(id));
});
