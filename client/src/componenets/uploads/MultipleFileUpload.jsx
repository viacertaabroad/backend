import React, { useState } from 'react';
import axios from 'axios';

const MultiFileUpload = () => {
  const [files, setFiles] = useState([]);
  const [uploadedLinks, setUploadedLinks] = useState([]);

  const handleChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleUpload = async () => {
    if (files.length === 0) return alert('Select files first');

    const formData = new FormData();
    files.forEach(file => formData.append('documents', file));

    try {
      const res = await axios.post('http://localhost:8000/api/upload/documents', formData);
      console.log('Uploaded files:', res.data.files);
      setUploadedLinks(res.data.files.map(url => `http://localhost:8000${url}`));
    } catch (err) {
      alert(err.response?.data?.error || 'Upload failed');
    }
  };

  return (
    <div>
      <input type="file" accept="application/pdf" multiple onChange={handleChange} />
      <button onClick={handleUpload}>Upload</button>

      {uploadedLinks.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <p>Uploaded Documents:</p>
          <ul>
            {uploadedLinks.map((link, idx) => (
              <li key={idx}>
                <a href={link} target="_blank" rel="noopener noreferrer">View Document {idx + 1}</a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MultiFileUpload;
