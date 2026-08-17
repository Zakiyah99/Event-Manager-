import express from 'express'
import { getDashboard } from '../controllers/dashboardController.js';
import { protect } from '../middlewares/auth.js'

const router = express.Router();

/**
 * @swagger
 * /dashboard:
 *  get:
 *      summary: Get dashboard stats for the logged-in user
 *      tags: [Dashboard]
 *      security:
 *         - bearerAuth: []
 *      responses:
 *          200:
 *             description: Dashboard summary with event stats and recent events
 */
router.get('/', protect, getDashboard);

export default router;
