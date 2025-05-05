import React, { useState } from 'react';
import axios from 'axios';

const MixedUpload = () => {
  const [profile, setProfile] = useState(null);
  const [documents, setDocuments] = useState({
    document1: null,
    document2: null,
    document3: null,
    document4: null,
    document5: null,
  });
  const [uploaded, setUploaded] = useState(null);

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    setDocuments(prev => ({ ...prev, [field]: file }));
  };

  const validateFiles = () => {
    if (!profile) return 'Please upload a profile image.';
    if (profile.size > 2 * 1024 * 1024) return 'Profile image must be ≤ 2MB.';

    const limits = {
      document1: 2,
      document2: 3,
      document3: 1.5,
      document4: 5,
      document5: 4,
    };

    for (const [key, file] of Object.entries(documents)) {
      if (file && file.size > limits[key] * 1024 * 1024) {
        return `${key} exceeds its limit of ${limits[key]}MB.`;
      }
    }

    return null;
  };

  const handleSubmit = async () => {
    const error = validateFiles();
    if (error) return alert(error);

    const formData = new FormData();
    formData.append('profile', profile);
    Object.values(documents).forEach(file => {
      if (file) formData.append('documents', file);
    });

    try {
      const res = await axios.post('http://localhost:8000/api/upload/mixed', formData);
      setUploaded(res.data.files);
    } catch (err) {
      alert(err.response?.data?.error || 'Upload failed');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h3>Upload Profile + 5 Documents</h3>

      <div>
        <label>Profile Image (JPEG/PNG, ≤2MB):</label><br />
        <input type="file" accept="image/jpeg,image/png" onChange={e => setProfile(e.target.files[0])} />
      </div>

      {['document1', 'document2', 'document3', 'document4', 'document5'].map((docKey, idx) => (
        <div key={docKey} style={{ marginTop: 10 }}>
          <label>{`Document ${idx + 1} (PDF)`}:</label><br />
          <input
            type="file"
            accept="application/pdf"
            onChange={e => handleFileChange(e, docKey)}
          />
        </div>
      ))}

      <button onClick={handleSubmit} style={{ marginTop: 20 }}>Upload</button>

      {uploaded && (
        <div style={{ marginTop: 30 }}>
          <h4>Uploaded Files</h4>
          {uploaded.profile && (
            <div>
              <p>🖼️ Profile Image:</p>
              <img
                src={`http://localhost:8000${uploaded.profile.url}`}
                alt="Profile"
                width={150}
              />
            </div>
          )}
          {uploaded.documents.length > 0 && (
            <div>
              <p>📄 Documents:</p>
              <ul>
                {uploaded.documents.map((doc, i) => (
                  <li key={i}>
                    <a
                      href={`http://localhost:8000${doc.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Document {i + 1}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MixedUpload;
