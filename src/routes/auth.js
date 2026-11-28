import { Router } from 'express';
import {
    currentUserApi,
    loginApi,
    loginPage,
    loginPageSubmit,
    logoutApi,
    logoutPage,
    registerApi,
    registerPage,
    registerPageSubmit
} from '../controllers/auth.js';
import { requireApiLogin } from '../middleware/auth.js';

const router = Router();

router.get('/register', registerPage);
router.post('/register', registerPageSubmit);
router.get('/login', loginPage);
router.post('/login', loginPageSubmit);
router.post('/logout', logoutPage);

router.post('/api/auth/register', registerApi);
router.post('/api/auth/login', loginApi);
router.post('/api/auth/logout', requireApiLogin(), logoutApi);
router.get('/api/auth/me', requireApiLogin(), currentUserApi);

export default router;