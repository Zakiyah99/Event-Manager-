
import express from 'express'
import { protect } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';
import { uploadFile, uploadImage } from '../controllers/uploadController.js';

const router = express.Router();

/**
 * @swagger
 * /upload:
 *   post:
 *     summary: Upload an image and return its URL
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Image uploaded
 */
router.post('/', protect, upload.single('file'), uploadImage)

router.post('/profile-picture', protect, upload.single('file'), uploadFile)

// export the router
export default router;
