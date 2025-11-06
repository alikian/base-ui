import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { embedding } from '../models';
import { DataService } from '../services/DataService';

interface EmbeddingListProps {
  initialEmbeddings?: embedding[];
}

const EmbeddingList: React.FC<EmbeddingListProps> = ({ initialEmbeddings = [] }) => {
  const [embeddings, setEmbeddings] = useState<embedding[]>(initialEmbeddings);
  const [loading, setLoading] = useState<boolean>(true);
  const [, setError] = useState<string | null>(null);
  const [snack, setSnack] = useState<{ open: boolean; severity: 'success' | 'error' | 'info' | 'warning'; message: string }>(
    { open: false, severity: 'info', message: '' }
  );
  const [confirm, setConfirm] = useState<{ open: boolean; id?: string; label?: string }>({ open: false });
  const navigate = useNavigate();

  const embeddingService = new DataService<embedding>('embeddings');

  useEffect(() => {
    const fetchEmbeddings = async () => {
      try {
        const response = await embeddingService.getAll();
        setEmbeddings(response || []);
      } catch (err) {
        console.error('Error fetching embeddings:', err);
        setError('Failed to fetch embeddings');
        setSnack({ open: true, severity: 'error', message: 'Failed to fetch embeddings' });
      } finally {
        setLoading(false);
      }
    };

    fetchEmbeddings();
  }, []);

  const handleAdd = () => navigate('/embeddings/new');

  const openConfirmDelete = (id: string, label?: string) => setConfirm({ open: true, id, label });
  const closeConfirm = () => setConfirm({ open: false });
  const confirmDelete = async () => {
    if (!confirm.id) return;
    try {
      await embeddingService.delete(confirm.id);
      setEmbeddings((prev) => prev.filter((e) => e.embeddingId !== confirm.id));
      setSnack({ open: true, severity: 'success', message: 'Embedding deleted' });
    } catch (err) {
      console.error('Error deleting embedding:', err);
      setError('Failed to delete embedding');
      setSnack({ open: true, severity: 'error', message: 'Failed to delete embedding' });
    } finally {
      closeConfirm();
    }
  };

  const maskApiKey = (key?: string) => {
    if (!key) return '-';
    const visible = key.slice(-4);
    return `••••••••••${visible}`;
  };

  if (loading) return <CircularProgress />;

  return (
    <>
    <TableContainer component={Paper} sx={{ mt: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
        <Typography variant="h5" sx={{ m: 0 }}>Embeddings</Typography>
        <Button variant="contained" color="primary" onClick={handleAdd}>
          Add Embedding
        </Button>
      </Box>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Vendor</TableCell>
            <TableCell>Model</TableCell>
            <TableCell align="right">Dimensions</TableCell>
            <TableCell>API Key</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {embeddings.map((e) => (
            <TableRow
              key={e.embeddingId}
              hover
              sx={{ cursor: 'pointer' }}
              onClick={() => navigate(`/embeddings/${e.embeddingId}`)}
            >
              <TableCell>{e.embeddingVendor}</TableCell>
              <TableCell>{e.embeddingModel}</TableCell>
              <TableCell align="right">{e.embeddingDimensions}</TableCell>
              <TableCell>{maskApiKey(e.apiKey)}</TableCell>
              <TableCell align="right" onClick={(evt) => evt.stopPropagation()}>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={() => openConfirmDelete(e.embeddingId, `${e.embeddingVendor} / ${e.embeddingModel}`)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {embeddings.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} align="center">
                No embeddings found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
    <Snackbar
      open={snack.open}
      autoHideDuration={3000}
      onClose={(_, reason) => {
        if (reason === 'clickaway') return;
        setSnack((s) => ({ ...s, open: false }));
      }}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert
        elevation={6}
        variant="filled"
        severity={snack.severity}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        sx={{ width: '100%' }}
      >
        {snack.message}
      </Alert>
    </Snackbar>

    <Dialog open={confirm.open} onClose={closeConfirm} aria-labelledby="confirm-delete-title">
      <DialogTitle id="confirm-delete-title">Delete embedding</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete this embedding{confirm.label ? ` (${confirm.label})` : ''}? This action cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeConfirm}>Cancel</Button>
        <Button color="error" variant="contained" onClick={confirmDelete}>Delete</Button>
      </DialogActions>
    </Dialog>
    </>
  );
};

export default EmbeddingList;
