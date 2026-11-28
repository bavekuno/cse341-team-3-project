import tripsEjsRouter from './ejs-routes.js';
import apiRouter from './api-routes.js';
import { trainsApi, trainsPage } from './trains.js';
import { Router } from 'express';
import { homePage, aboutPage, testErrorPage } from './index.js';
import { getAllBookings, bookingsAdminPage } from '../controllers/bookings.js';

const router = Router();

// Home page
router.get('/', homePage);

// About page
router.get('/about', aboutPage);

// Trains page
router.get('/trains', trainsPage);

// Trains API
router.get('/api/trains', trainsApi);

// Trips API
router.use('/api', apiRouter);

/**
 * @swagger
 * /api/bookings:
 *   get:
 *     summary: Get all bookings, newest first
 *     tags: [Bookings]
 *     responses:
 *       200:
 *         description: A list of bookings
 *       500:
 *         description: Failed to fetch bookings
 */
router.get('/api/bookings', getAllBookings);

// Bookings admin page
router.get('/bookings-admin', bookingsAdminPage);

// Rail trips EJS pages
router.use('/trips', tripsEjsRouter);

// Test 500 error page
router.get('/500', testErrorPage);

export default router;
