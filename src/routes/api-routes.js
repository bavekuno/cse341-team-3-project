import { Router } from 'express';
import { getAllTripsApi, getTripByIdApi } from '../controllers/trips.js';

const router = Router();

/**
 * @swagger
 * /api/trips:
 *   get:
 *     summary: Get all trips
 *     tags: [Trips]
 *     responses:
 *       200:
 *         description: A list of trips
 *       500:
 *         description: Failed to retrieve trips
 */
router.get('/trips', getAllTripsApi);

/**
 * @swagger
 * /api/trips/{id}:
 *   get:
 *     summary: Get a trip by ID
 *     tags: [Trips]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A trip
 *       404:
 *         description: Trip not found
 *       500:
 *         description: Failed to retrieve trip
 */
router.get('/trips/:id', getTripByIdApi);

export default router;
