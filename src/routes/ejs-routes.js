import { Router } from 'express';
import { listTripsPage, tripDetailsPage } from '../controllers/trips.js';

const router = Router();

router.get('/', listTripsPage);
router.get('/:tripId', tripDetailsPage);

export default router;
