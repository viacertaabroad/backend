// utils/fileUploader.js
import multer from 'multer';
import path from 'path';
import fs from 'fs';
 

export function createUploader({
  folder = '',
  allowedTypes = ['image/jpeg', 'image/png'],
  maxSize = 5 * 1024 * 1024,    // 5MB
  rename = original => `${Date.now()}-${original}`,
  multiple = false,
  fieldName = 'files',
  maxCount = 1,
}) {
  // ensure upload directory exists
  // const uploadPath = path.join(process.cwd(), 'uploads', folder);
  const uploadPath = path.join(process.cwd(), '..', 'uploads', folder);  //outside backend folder
  // const uploadPath = path.join('/var/www/storage/uploads', folder);


  fs.mkdirSync(uploadPath, { recursive: true });

  // storage & naming
  const storage = multer.diskStorage({
    destination: (_, __, cb) => cb(null, uploadPath),
    filename: (_, file, cb) => cb(null, rename(file.originalname)),
  });

  // file type filtering
  const fileFilter = (_, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Invalid file type'));
  };

  const uploader = multer({
    storage,
    fileFilter,
    limits: { fileSize: maxSize },
  });

  // mixed‐fields (profile + documents)?
  if (Array.isArray(fieldName)) {
    // fieldName must be an array of { name, maxCount }
    return uploader.fields(fieldName);
  }

  // multiple files under same field?
  if (multiple) {
    return uploader.array(fieldName, maxCount);
  }

  // single file:
  return uploader.single(fieldName);
}
