import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, IconButton, Alert, Box, CircularProgress } from '@mui/material';
import { Link, useParams } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import { Document } from '../models';
import BaseService from '../BaseService';

const DocumentList: React.FC = () => {
  const { baseId } = useParams<{ baseId: string }>();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
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
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Document Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Size</TableCell>
              <TableCell>Created At</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {documents.map((document) => (
              <TableRow key={document.documentId}>
                <TableCell>{document.documentName}</TableCell>
                <TableCell>{document.documentType}</TableCell>
                <TableCell>{document.size}</TableCell>
                <TableCell>{new Date(document.createdAt * 1000).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

    </div>
  );
};

export default DocumentList;