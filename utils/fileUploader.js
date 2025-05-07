// utils/fileUploader.js
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import sharp from 'sharp';
import { Readable } from 'stream';
// const FileType = (await import('file-type')).fileTypeFromBuffer;
// import fileType from 'file-type';
import { fileTypeFromBuffer } from 'file-type';

// import Clamscan from 'clamscan';

// Initialize ClamAV client (ensure clamd is running)
// let clam;
// (async () => {
//   try {
//     const clamscan = new Clamscan({
//       removeInfected: false,
//       quarantineInfected: false,
//       scanLog: null,
//       debugMode: false,
//       clamscan: { active: false },           // disable direct binary scan
//       clamdscan: {
//         socket: false,                       // or '/var/run/clamd.scan/clamd.sock'
//         host: '127.0.0.1',
//         port: 3310,
//         timeout: 60000,
//         localFallback: true,
//         active: true
//       },
//       preference: 'clamdscan'
//     });
//     clam = await clamscan.init();
//   } catch (err) {
//     console.error('ClamAV initialization failed:', err);
//   }
// })();

 
export function createSecureUploader({
  folder = '',
  allowedTypes = ['image/jpeg', 'image/png','application/pdf'],
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
  // fs.mkdirSync(uploadPath, { recursive: true }).catch(console.error); 
  fs.mkdir(uploadPath, { recursive: true }).catch(console.error); 

  // storage & naming
  // const storage = multer.diskStorage({
  //   destination: (_, __, cb) => cb(null, uploadPath),
  //   filename: (_, file, cb) => cb(null, rename(file.originalname)),
  // });

  // // file type filtering
  const fileFilter = (_req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Invalid file type'));
  };



  const uploader = multer({
    storage :  multer.memoryStorage(),
    limits: { fileSize: maxSize },
    fileFilter,
  });
 
 
  // mixed‐fields (profile + documents)?
  // if (Array.isArray(fieldName)) {
  //   // fieldName must be an array of { name, maxCount }
  //   return uploader.fields(fieldName);
  // }

  // // multiple files under same field?
  // if (multiple) {
  //   return uploader.array(fieldName, maxCount);
  // }

  // // single file:
  // return uploader.single(fieldName);





  
  let middleware;
  if (Array.isArray(fieldName)) middleware = uploader.fields(fieldName);
  else if (multiple) middleware = uploader.array(fieldName, maxCount);
  else middleware = uploader.single(fieldName);

  return (req, res, next) => {
    middleware(req, res, async err => {
      if (err) return res.status(400).json({ success: false, error: err.message });
      const allFiles = [];
      if (Array.isArray(fieldName)) {
        fieldName.forEach(f => (req.files[f.name] || []).forEach(file => allFiles.push({ file })));
      } else if (multiple) {
        (req.files || []).forEach(file => allFiles.push({ file }));
      } else if (req.file) {
        allFiles.push({ file: req.file });
      }

      try {
        for (const { file } of allFiles) {
          // 1. Verify signature
          const type = await fileTypeFromBuffer(file.buffer);
          if (!type || !allowedTypes.includes(type.mime)) {
            throw new Error('File signature does not match MIME type');
          }

          // 2. Virus scan via ClamAV
          // if (!clam) throw new Error('Antivirus not initialized');
          // const stream = Readable.from(file.buffer);
          // const { isInfected, viruses } = await clam.scanStream(stream);
          // if (isInfected) {
          //   throw new Error(`Malicious content detected: ${viruses.join(', ')}`);
          // }

          // 3. Re-encode images
          if (type.mime.startsWith('image/')) {
            const format = type.mime === 'image/png' ? 'png' : 'jpeg';
            file.buffer = await sharp(file.buffer).toFormat(format).toBuffer();
          }

          // 4. Write to disk
          const finalName = rename(file.originalname);
          const outPath = path.join(uploadPath, finalName);
          await fs.writeFile(outPath, file.buffer, { mode: 0o640 });

          // 5. Attach safe URL
          file.filename = finalName;
          file.safeUrl = `/view/${folder}/${finalName}`;
        }
        next();
      } catch (e) {
        console.error('Secure upload error:', e);
        res.status(400).json({ success: false, error: e.message });
      }
    });
  };
}