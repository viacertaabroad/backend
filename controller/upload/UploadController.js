import { createSecureUploader } from "../../utils/fileUploader.js";
 
export const uploadProfilePicture = (req, res) => {
  const upload = createSecureUploader  ({
    folder: 'users/profile',
    allowedTypes: ['image/jpeg', 'image/png'],
    maxSize: 2 * 1024 * 1024, // 2MB
    rename: (name) => `${Date.now()}-profile-${name}`,
    multiple: false,
    fieldName: 'profile',
  });
  upload(req, res, (err) => {
    if (err) return res.status(400).json({ success: false, error: err.message });

    const file = req.file;
    if (!file) return res.status(400).json({ success: false, error: 'No file uploaded' });

    res.status(200).json({
      success: true,
      fileUrl: `/view/users/profile/${file.filename}`,
    });
  });
};

export const uploadDocuments = (req, res) => {
  const upload = createSecureUploader({
    folder: 'users/docs',
    allowedTypes: ['application/pdf'],
    maxSize: 5 * 1024 * 1024, // 5MB
    rename: (name) => `${Date.now()}-doc-${name}`,
    multiple: true,
    fieldName: 'documents',
    maxCount: 3,
  });

  upload(req, res, (err) => {
    if (err) return res.status(400).json({ success: false, error: err.message });

    const files = req.files.map(f => `/view/users/docs/${f.filename}`);
    res.status(200).json({ success: true, files });
  });
};


export const uploadMixedFiles = (req, res) => {
  const upload = createSecureUploader({
    folder: 'mixed',
    allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
    maxSize: 5 * 1024 * 1024, // 5MB
    rename: (name) => `${Date.now()}-${name}`,
    fieldName: [
      { name: 'profile', maxCount: 1 },
      { name: 'documents', maxCount: 5 },
    ],
  });

  upload(req, res, err => {
    if (err) return res.status(400).json({ success: false, error: err.message });

    const profileFile = req.files.profile?.[0];
    const docsFiles   = req.files.documents || [];

// 
// Validate profile image size (<= 2MB)
if (profileFile && profileFile.size > 2 * 1024 * 1024) {
  return res.status(400).json({
    success: false,
    error: 'Profile image exceeds 2MB limit',
  });
}

   // Custom size limits for each document
   const docSizeLimits = [2, 3, 1.5, 5, 4]; // in MB

   for (let i = 0; i < docsFiles.length; i++) {
     const file = docsFiles[i];
     const maxSizeMB = docSizeLimits[i] || 5; // fallback to 5MB if not specified
     const maxSizeBytes = maxSizeMB * 1024 * 1024;

     if (file.size > maxSizeBytes) {
       return res.status(400).json({
         success: false,
         error: `Document ${i + 1} exceeds ${maxSizeMB}MB limit`,
       });
     }
   }
// 


    const result = {
      profile: profileFile
        ? {
            url:  `/view/mixed/${profileFile.filename}`,
            type: profileFile.mimetype,
          }
        : null,
      documents: docsFiles.map(f => ({
        url:  `/view/mixed/${f.filename}`,
        type: f.mimetype,
      })),
    };

    res.json({ success: true, files: result });
  });
};
