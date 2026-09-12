import React, { useState, useEffect } from 'react';
import { Box, Button, CircularProgress, IconButton, Alert } from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';
import { API_BASE_URL } from '../utils/config';
import { getImageUrl } from '../utils/imageUrl';

const ImageUpload = ({ onUploadSuccess, multiple = false, initialImages = [] }) => {
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState(initialImages);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    setImages(initialImages || []);
  }, [initialImages]);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setErrorMsg('');

    // Pre-validate file sizes (max 5MB) and mime types
    const invalidFile = files.find((f) => !f.type.startsWith('image/') || f.size > 5 * 1024 * 1024);
    if (invalidFile) {
      setErrorMsg('Files must be valid images under 5MB each.');
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('token');

    const formData = new FormData();
    const endpoint = multiple ? '/api/upload/tour-images' : '/api/upload/profile-picture';
    
    if (multiple) {
      files.forEach((f) => formData.append('images', f));
    } else {
      formData.append('image', files[0]);
    }

    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Upload failed');
      }
      const data = await res.json();

      if (multiple) {
        const updated = [...images, ...data.urls];
        setImages(updated);
        onUploadSuccess(updated);
      } else {
        setImages([data.url]);
        onUploadSuccess(data.url);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to upload image(s). Please try again.');
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  const removeImage = (index) => {
    const updated = images.filter((_, i) => i !== index);
    setImages(updated);
    onUploadSuccess(multiple ? updated : null);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
        {errorMsg && (
          <Alert severity="error" sx={{ width: '100%', mb: 1 }} onClose={() => setErrorMsg('')}>
            {errorMsg}
          </Alert>
        )}
        <Button
          variant="outlined"
          component="label"
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PhotoCamera />}
          disabled={loading}
          sx={{ borderRadius: 2 }}
        >
          {loading ? 'Uploading...' : multiple ? 'Upload Tour Images' : 'Upload Profile Picture'}
          <input
            hidden
            accept="image/*"
            type="file"
            multiple={multiple}
            onChange={handleFileChange}
          />
        </Button>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
          {images.map((img, idx) => (
            <Box
              key={idx}
              sx={{
                position: 'relative',
                border: '1px solid #E2EBE5',
                borderRadius: 2,
                overflow: 'hidden',
                width: 100,
                height: 100,
              }}
            >
              <img
                src={getImageUrl(img)}
                alt="preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <IconButton
                size="small"
                onClick={() => removeImage(idx)}
                sx={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  backgroundColor: 'rgba(255,255,255,0.8)',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.95)' },
                }}
              >
                <DeleteIcon fontSize="small" color="error" />
              </IconButton>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default ImageUpload;
