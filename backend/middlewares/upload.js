import multer from "multer";

const storage = multer.memoryStorage();

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

export const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    fileFilter: (req, file, cb) => {
        if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
            cb(null, true);
            return;
        }

        const error = new Error('Only JPEG, PNG, WebP, and GIF images are allowed');
        error.statusCode = 400;
        cb(error);
    }
})


/*{
  fieldname: 'file',
  originalname: 'avatar.png',
  encoding: '7bit',
  mimetype: 'image/png',
  buffer: <Buffer ...>,       // ← THIS is the file content
  size: 143233
}
*/
