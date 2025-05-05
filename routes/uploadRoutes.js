import express from 'express';
import { uploadDocuments, uploadMixedFiles, uploadProfilePicture } from '../controller/upload/UploadController.js';
;
 

const router = express.Router();

router.post('/profile', uploadProfilePicture);
router.post('/documents', uploadDocuments);
router.post('/mixed', uploadMixedFiles);


export default router;
