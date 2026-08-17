import express from 'express'
import { addEventType, deleteEventType, getSettings, updateEventType, updateSettings } from '../controllers/settingsController.js';
import { protect } from '../middlewares/auth.js'
import { validate } from '../middlewares/validateZod.js';
import { eventTypeValidationSchema, settingsValidationSchema } from '../schemas/settingsSchema.js';

const router = express.Router();

/**
 * @swagger
 * /settings:
 *  get:
 *      summary: Get settings for the logged-in user
 *      tags: [Settings]
 *      security:
 *         - bearerAuth: []
 *      responses:
 *          200:
 *             description: User settings with event types
 */
router.get('/', protect, getSettings);

/**
 * @swagger
 * /settings:
 *   put:
 *     summary: Update system name
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Settings updated
 */
router.put('/', protect, validate(settingsValidationSchema), updateSettings);

/**
 * @swagger
 * /settings/event-types:
 *   post:
 *     summary: Add an event type
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Event type added
 */
router.post('/event-types', protect, validate(eventTypeValidationSchema), addEventType);

/**
 * @swagger
 * /settings/event-types/{id}:
 *   put:
 *     summary: Update an event type
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event type updated
 */
router.put('/event-types/:id', protect, validate(eventTypeValidationSchema), updateEventType);

/**
 * @swagger
 * /settings/event-types/{id}:
 *   delete:
 *     summary: Delete an event type
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event type deleted
 */
router.delete('/event-types/:id', protect, deleteEventType);

export default router;
