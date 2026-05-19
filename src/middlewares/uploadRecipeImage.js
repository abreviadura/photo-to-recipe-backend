import fs from 'fs';
import path from 'path';

import createHttpError from 'http-errors';
import multer from 'multer';

const UPLOAD_ROOT = path.join(process.cwd(), 'uploads', 'recipes');

if (!fs.existsSync(UPLOAD_ROOT)) {
  fs.mkdirSync(UPLOAD_ROOT, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_ROOT);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const safe = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}${ext}`;
    cb(null, safe);
  },
});

const allowed =
  /^(image\/(jpeg|png|gif|webp))$/i;

export const uploadRecipeImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (allowed.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        createHttpError(
          400,
          'Only JPEG, PNG, GIF or WebP images are allowed',
        ),
      );
    }
  },
});
