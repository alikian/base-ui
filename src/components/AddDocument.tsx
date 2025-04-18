import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Alert, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import BaseService from '../BaseService';
import { Document } from '../models';
import MultipleFileUpload from './MultipleFileUpload';

interface AddDocumentProps {
  baseId: string;
  onAddDocument: (newDocument: Document) => void;
  onUploadComplete: () => void;
}

const AddDocument: React.FC<AddDocumentProps> = ({ baseId, onAddDocument, onUploadComplete }) => {
  const [documentValue, setDocumentValue] = useState<string>('');
  const [documentType, setDocumentType] = useState<string>('URL');
  const [url, setUrl] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const documentData: Partial<Document> = {
      baseId,
      documentValue,
      documentType,
      createdAt: Date.now(),
    };

    if (documentType === 'URL') {
      documentData.documentValue = url;
    } else if (documentType === 'File' && file) {
      // Handle file upload logic here
      // For example, you can upload the file to S3 and get the file URL
      // documentData.url = uploadedFileUrl;
    }

    try {
      const baseService = new BaseService();
      const newDocument = await baseService.createDocument(baseId, documentData as Document);
      console.log('Document added:', newDocument);
      onAddDocument(newDocument);
      setSuccess('Document added successfully!');
      setDocumentValue('');
      setUrl('');
      setFile(null);
    } catch (error) {
      console.error('Error adding document:', error);
      setError('Failed to add document');
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        mt: 3,
        width: '100%', // Set the width to 100% of the parent container
        maxWidth: 600, // Add a maximum width for better layout
        mx: 'left', // Center the box horizontally
        backgroundColor: 'background.paper', // Add background color
        p: 3, // Add padding for better spacing
        borderRadius: 2, // Add rounded corners
        boxShadow: 3, // Add a shadow for better visual appearance
      }}
    >
      <Typography variant="h5" gutterBottom>
        Add New Document
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
      <FormControl fullWidth margin="normal">
        <InputLabel>Type</InputLabel>
        <Select value={documentType} onChange={(e) => setDocumentType(e.target.value as string)}>
          <MenuItem value="URL">URL</MenuItem>
          <MenuItem value="File">File</MenuItem>
        </Select>
      </FormControl>
      {documentType === 'URL' && (
        <TextField
          label="URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
      )}
      {documentType === 'URL' && (
        <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
          Add URL
        </Button>
      )}
      {documentType === 'File' && (
        <MultipleFileUpload onUploadComplete={onUploadComplete} baseId={baseId} />
      )}
    </Box>
  );
};

export default AddDocument;