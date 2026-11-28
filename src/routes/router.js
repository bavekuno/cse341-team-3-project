import tripsEjsRouter from './ejs-routes.js';
import apiRouter from './api-routes.js';
import { trainsApi, trainsPage } from './trains.js';
import { Router } from 'express';
import { homePage, aboutPage, testErrorPage } from './index.js';

const router = Router();

router.get('/', homePage);
router.get('/about', aboutPage);
router.get('/trains', trainsPage);
router.get('/api/trains', trainsApi);
router.use('/api', apiRouter);
router.use('/trips', tripsEjsRouter);
router.get('/500', testErrorPage);

export default router;
