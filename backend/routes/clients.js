import express from 'express'
import { createClient, deleteClient, getClientById, getMyClients, updateClient } from '../controllers/clientController.js';
import { protect } from '../middlewares/auth.js'
import { validate } from '../middlewares/validateZod.js';
import { clientValidationSchema } from '../schemas/clientSchema.js';

const router = express.Router();

/**
 * @swagger
 * /clients:
 *  get:
 *      summary: Get clients for the logged-in user
 *      tags: [Clients]
 *      security:
 *         - bearerAuth: []
 *      parameters:
 *         - in: query
 *           name: search
 *           schema:
 *             type: string
 *      responses:
 *          200:
 *             description: A list of clients
 */
router.get('/', protect, getMyClients);

/**
 * @swagger
 * /clients/{id}:
 *   get:
 *     summary: Get a client and their events
 *     tags: [Clients]
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
 *         description: Client details with related events
 */
router.get('/:id', protect, getClientById);

/**
 * @swagger
 * /clients:
 *   post:
 *     summary: Create a new client
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - phone
 *             properties:
 *               fullName:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               address:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Client created
 */
router.post('/', protect, validate(clientValidationSchema), createClient);

/**
 * @swagger
 * /clients/{id}:
 *   put:
 *     summary: Update a client by ID
 *     tags: [Clients]
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
 *         description: Client updated
 */
router.put('/:id', protect, validate(clientValidationSchema), updateClient);

/**
 * @swagger
 * /clients/{id}:
 *   delete:
 *     summary: Delete a client by ID
 *     tags: [Clients]
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
 *         description: Client deleted
 */
router.delete('/:id', protect, deleteClient);

export default router;
