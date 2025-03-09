import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, IconButton, Alert, Box, CircularProgress, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { Link, useParams } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Document } from '../models';
import BaseService from '../BaseService';
import AddDocument from './AddDocument';

const DocumentList: React.FC = () => {
  const { baseId } = useParams<{ baseId: string }>();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);

  const fetchDocuments = async () => {
    if (!baseId) {
      setError('Base ID is missing');
      setLoading(false);
      return;
    }

    try {
      const baseService = new BaseService();
      const documentsData = await baseService.listDocuments(baseId);
      setDocuments(documentsData);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setError('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (documentId: string) => {
    setSelectedDocumentId(documentId);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedDocumentId(null);
  };

  const deleteDocument = async () => {
    if (!baseId || !selectedDocumentId) {
      setError('Base ID or Document ID is missing');
      handleClose();
      return;
    }

    try {
      const baseService = new BaseService();
      await baseService.deleteDocument(baseId, selectedDocumentId);
      setDocuments(documents.filter(doc => doc.documentId !== selectedDocumentId));
    } catch (error) {
      console.error('Error deleting document:', error);
      setError('Failed to delete document');
    } finally {
      handleClose();
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [baseId]);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (documents.length === 0) {
    if(!baseId){
      return <Alert severity="info">No documents found.</Alert>;
    }
    return <div><Alert severity="info">No documents found.</Alert>
    </div>;
  }

  if(!baseId){
    return <Alert severity="info">No documents found.</Alert>;
  }
  return (
    <div>
      <Box display="flex" alignItems="center" mb={2}>
        <Link to="/bases">
          <IconButton aria-label="home">
            <HomeIcon />
          </IconButton>
        </Link>
        <Typography variant="h4" gutterBottom>
          Document List
        </Typography>
        <IconButton aria-label="refresh" onClick={fetchDocuments}>
          <RefreshIcon />
        </IconButton>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Document Value</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {documents.map((document) => (
              <TableRow key={document.documentId}>
                <TableCell>{document.documentValue}</TableCell>
                <TableCell>{document.documentType}</TableCell>
                <TableCell>{new Date(document.createdAt * 1000).toLocaleString()}</TableCell>
                <TableCell>{document.status}</TableCell>
                <TableCell>
                  <IconButton aria-label="delete" onClick={() => handleDeleteClick(document.documentId)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      <AddDocument baseId={baseId} onAddDocument={fetchDocuments} onUploadComplete={fetchDocuments} />

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Delete Document"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this document? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={deleteDocument} color="primary" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default DocumentList;