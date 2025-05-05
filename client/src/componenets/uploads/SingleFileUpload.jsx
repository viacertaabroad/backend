import React, { useState } from 'react';
import axios from 'axios';

const SingleFileUpload = () => {
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');

  const handleChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return alert('Please select a file');

    const formData = new FormData();
    formData.append('profile', file);

    try {
      const res = await axios.post('http://localhost:8000/api/upload/profile', formData);
      console.log('Image URL:', res.data.fileUrl);
      setImageUrl(`http://localhost:8000${res.data.fileUrl}`);
    } catch (err) {
      alert(err.response?.data?.error || 'Upload failed');
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleChange} />
      <button onClick={handleUpload}>Upload</button>

      {imageUrl && (
        <div style={{ marginTop: 10 }}>
          <p>Preview:</p>
          <img src={imageUrl} alt="Uploaded" width={150} crossOrigin="anonymous" />
          <p>
            <a href={imageUrl} target="_blank" rel="noopener noreferrer">View Full Image</a>
          </p>
        </div>
      )}
    </div>
  );
};

export default SingleFileUpload;
