import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, CircularProgress, Alert, IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Document } from '../models';
import BaseService from '../BaseService';
import { useParams } from 'react-router-dom';
import AddDocument from './AddDocument';
import { Link } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';

interface DocumentListProps {
  baseId: string;
  onDeleteDocument: (documentId: string) => void;
}

interface RouteParams {
  baseId: string;
}

const DocumentList: React.FC<DocumentListProps> = () => {
  const { baseId } = useParams<RouteParams>();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);

  const fetchDocuments = async () => {
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

  useEffect(() => {
    fetchDocuments();
  }, [baseId]);

  const handleAddDocument = (newDocument: Document) => {
    setDocuments((prevDocuments) => [...prevDocuments, newDocument]);
  };

  const handleDelete = async (documentId: string) => {
    try {
      const baseService = new BaseService();
      await baseService.deleteDocument(baseId, documentId);
      fetchDocuments(); // Refetch documents after deletion
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const openDeleteDialog = (documentId: string) => {
    setDocumentToDelete(documentId);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDocumentToDelete(null);
    setDeleteDialogOpen(false);
  };

  const confirmDelete = () => {
    if (documentToDelete) {
      handleDelete(documentToDelete);
      closeDeleteDialog();
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (documents.length === 0) {
    return <idv><Alert severity="info">No documents found.</Alert>
    <AddDocument baseId={baseId} onAddDocument={handleAddDocument} /></idv>;
  }

  return (
    <div>
      <Box display="flex" alignItems="center" mb={2}>
        <Link to="/">
          <IconButton aria-label="home">
            <HomeIcon />
          </IconButton>
        </Link>
        <Typography variant="h4" gutterBottom>
          Document List
        </Typography>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Document Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Size</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {documents.map((document) => (
              <TableRow key={document.documentId}>
                <TableCell>{document.documentName}</TableCell>
                <TableCell>{document.documentType}</TableCell>
                <TableCell>{document.size}</TableCell>
                <TableCell>{new Date(document.createdAt * 1000).toLocaleString()}</TableCell>
                <TableCell>
                  <IconButton onClick={() => openDeleteDialog(document.documentId)} aria-label="delete">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <AddDocument baseId={baseId} onAddDocument={handleAddDocument} />

      <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this document? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="secondary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default DocumentList;