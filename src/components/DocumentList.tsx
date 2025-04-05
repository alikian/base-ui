import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, IconButton, Alert, Box, CircularProgress, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { useParams } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Document,VectorStore } from '../models';
import BaseService from '../BaseService';
import AddDocument from './AddDocument';
import { DataService } from '../services/DataService';
import { Base } from '../models';

const DocumentList: React.FC = () => {
  const { baseId } = useParams<{ baseId: string }>();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [base, setBase] = useState<Base | null>(null);
  const [vectorStore, setVectorStore] = useState<VectorStore | null>(null);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const baseDataService = new DataService<Base>('bases');
  const vectoreDataService = new DataService<VectorStore>('vectorstores');
  const baseService = new BaseService();

  const fetchDocuments = async () => {
    if (!baseId) {
      setError('Base ID is missing');
      setLoading(false);
      return;
    }

    try {

      const base = await baseDataService.get(baseId);
      setBase(base);

      const vectorStore = await vectoreDataService.get(base.vectorStoreId);
      console.log('Vector Store:', vectorStore);
      setVectorStore(vectorStore);

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


  if(!baseId){
    return <Alert severity="info">No documents found.</Alert>;
  }
  return (
    <div>
      <Box display="flex" alignItems="center" mb={2}>
        <Typography variant="h4" gutterBottom>
          KnowlegdeBase: {base?.baseName}
        </Typography>
      </Box>
      <Box display="flex" alignItems="center" mb={2}>
          Embeding : {vectorStore?.embedingVendorName}: {vectorStore?.embedingModeName}
      </Box>
      <Box display="flex" alignItems="center" mb={2}>
        <Typography variant="h5" gutterBottom>
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
              <TableCell>Document</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Chunks</TableCell>
              <TableCell>Actions</TableCell>
              {/* You can add more columns as needed */}
            </TableRow>
          </TableHead>
          <TableBody>
            {documents.map((document) => (
              <TableRow key={document.documentId}>
                <TableCell>{document.documentValue}</TableCell>
                <TableCell>{document.documentType}</TableCell>
                <TableCell>{new Date(document.createdAt * 1000).toLocaleString()}</TableCell>
                <TableCell>{document.status}</TableCell>
                <TableCell>{document.chunks}</TableCell>
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