import express from 'express'
import { createGuest, deleteGuest, getMyGuests, updateGuest } from '../controllers/guestController.js';
import { protect } from '../middlewares/auth.js'
import { validate } from '../middlewares/validateZod.js';
import { guestValidationSchema } from '../schemas/guestSchema.js';

const router = express.Router();

/**
 * @swagger
 * /guests:
 *  get:
 *      summary: Get guests for the logged-in user
 *      tags: [Guests]
 *      security:
 *         - bearerAuth: []
 *      parameters:
 *         - in: query
 *           name: search
 *           schema:
 *             type: string
 *         - in: query
 *           name: event
 *           schema:
 *             type: string
 *         - in: query
 *           name: status
 *           schema:
 *             type: string
 *             enum: [Invited, Confirmed, Declined, Attended]
 *      responses:
 *          200:
 *             description: A list of guests
 */
router.get('/', protect, getMyGuests);

/**
 * @swagger
 * /guests:
 *   post:
 *     summary: Create a new guest
 *     tags: [Guests]
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
 *               - event
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               event:
 *                 type: string
 *               numberOfPeople:
 *                 type: number
 *               invitationStatus:
 *                 type: string
 *                 enum: [Invited, Confirmed, Declined, Attended]
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Guest created
 */
router.post('/', protect, validate(guestValidationSchema), createGuest);

/**
 * @swagger
 * /guests/{id}:
 *   put:
 *     summary: Update a guest by ID
 *     tags: [Guests]
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
 *         description: Guest updated
 */
router.put('/:id', protect, validate(guestValidationSchema), updateGuest);

/**
 * @swagger
 * /guests/{id}:
 *   delete:
 *     summary: Delete a guest by ID
 *     tags: [Guests]
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
 *         description: Guest deleted
 */
router.delete('/:id', protect, deleteGuest);

export default router;
