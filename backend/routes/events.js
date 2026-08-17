
import express from 'express'
import { createEvent, deleteEvent, getEventById, getMyEvents, updateEvent } from '../controllers/eventController.js';
import { protect } from '../middlewares/auth.js'
import { validate } from '../middlewares/validateZod.js';
import { eventUpdateSchema, eventValidationSchema } from '../schemas/eventSchema.js';

const router = express.Router();

/**
 * @swagger
 * /events:
 *  get:
 *      summary: Get events for the logged-in user
 *      tags: [Events]
 *      security:
 *         - bearerAuth: []
 *      parameters:
 *         - in: query
 *           name: search
 *           schema:
 *             type: string
 *           description: Search by name, venue, type, or description
 *         - in: query
 *           name: filter
 *           schema:
 *             type: string
 *             enum: [upcoming, past, today, all]
 *           description: Filter events by date
 *         - in: query
 *           name: status
 *           schema:
 *             type: string
 *             enum: [Draft, Upcoming, In Progress, Completed, Cancelled]
 *         - in: query
 *           name: type
 *           schema:
 *             type: string
 *         - in: query
 *           name: client
 *           schema:
 *             type: string
 *         - in: query
 *           name: date
 *           schema:
 *             type: string
 *             format: date
 *      responses: 
 *          200:
 *             description: A list of events     
 */
router.get('/', protect, getMyEvents);

/**
 * @swagger
 * /events/{id}:
 *   get:
 *     summary: Get a single event by ID
 *     tags: [Events]
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
 *         description: Event details
 */
router.get('/:id', protect, getEventById);

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Create a new event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - eventType
 *               - date
 *               - venue
 *             properties:
 *               name:
 *                 type: string
 *               eventType:
 *                 type: string
 *               client:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               startTime:
 *                 type: string
 *               endTime:
 *                 type: string
 *               venue:
 *                 type: string
 *               numberOfGuests:
 *                 type: number
 *               contactName:
 *                 type: string
 *               contactPhone:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [Draft, Upcoming, In Progress, Completed, Cancelled]
 *               description:
 *                 type: string
 *               poster:
 *                 type: string
 *                 description: Image URL from POST /api/upload
 *     responses:
 *       201:
 *         description: Event created
 */
router.post('/', protect, validate(eventValidationSchema), createEvent);

/**
 * @swagger
 * /events/{id}:
 *   put:
 *     summary: Update an event by ID
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Event ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               eventType:
 *                 type: string
 *               client:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               startTime:
 *                 type: string
 *               endTime:
 *                 type: string
 *               venue:
 *                 type: string
 *               numberOfGuests:
 *                 type: number
 *               contactName:
 *                 type: string
 *               contactPhone:
 *                 type: string
 *               status:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Event updated
 */
router.put('/:id', protect, validate(eventUpdateSchema), updateEvent);

/**
 * @swagger
 * /events/{id}:
 *   delete:
 *     summary: Delete an event by ID
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Event ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event deleted
 */
router.delete('/:id', protect, deleteEvent);

// export the router
export default router;
