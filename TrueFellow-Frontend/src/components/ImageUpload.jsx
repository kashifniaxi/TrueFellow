import React, { useState } from 'react';
import { Box, Button, CircularProgress, Typography, IconButton } from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';

const ImageUpload = ({ onUploadSuccess, folder = 'profiles', multiple = false, initialImages = [] }) => {
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState(initialImages);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

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
      const res = await fetch(`http://localhost:4000${endpoint}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');
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
      alert('Failed to upload image(s)');
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (index) => {
    const updated = images.filter((_, i) => i !== index);
    setImages(updated);
    onUploadSuccess(multiple ? updated : null);
  };

  return (
    <Box>
      <Box display="flex" flexDirection="column" gap={2} alignItems="center">
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
        
        <Box display="flex" flexWrap="wrap" gap={2} mt={1}>
          {images.map((img, idx) => (
            <Box
              key={idx}
              position="relative"
              border="1px solid #E2EBE5"
              borderRadius={2}
              overflow="hidden"
              width={100}
              height={100}
            >
              <img src={img} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
