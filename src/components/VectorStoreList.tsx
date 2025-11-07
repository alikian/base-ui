import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { VectorStore, embedding } from '../models';
import { DataService } from '../services/DataService';

const VectorStoreList: React.FC = () => {
  const navigate = useNavigate();
  const service = useMemo(() => new DataService<VectorStore>('vectorstores'), []);
  const embeddingService = useMemo(() => new DataService<embedding>('embeddings'), []);

  const [items, setItems] = useState<VectorStore[]>([]);
  const [embeddingMap, setEmbeddingMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [, setError] = useState<string | null>(null);
  const [snack, setSnack] = useState<{ open: boolean; severity: 'success' | 'error' | 'info' | 'warning'; message: string }>({
    open: false,
    severity: 'info',
    message: '',
  });
  const [confirm, setConfirm] = useState<{ open: boolean; id?: string; label?: string }>({ open: false });

  useEffect(() => {
    const load = async () => {
      try {
        const [all, embeds] = await Promise.all([service.getAll(), embeddingService.getAll()]);
        setItems(all || []);
        const map: Record<string, string> = {};
        (embeds || []).forEach((e) => {
          map[e.embeddingId] = `${e.embeddingVendor} / ${e.embeddingModel}`;
        });
        setEmbeddingMap(map);
      } catch (e) {
        console.error('Failed to fetch vector stores:', e);
        setError('Failed to fetch vector stores');
        setSnack({ open: true, severity: 'error', message: 'Failed to fetch vector stores' });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [service, embeddingService]);

  const handleAdd = () => navigate('/vectorstores/new');

  const openConfirmDelete = (id: string, label?: string) => setConfirm({ open: true, id, label });
  const closeConfirm = () => setConfirm({ open: false });
  const confirmDelete = async () => {
    if (!confirm.id) return;
    try {
      await service.delete(confirm.id);
      setItems((prev) => prev.filter((x) => x.vectorStoreId !== confirm.id));
      setSnack({ open: true, severity: 'success', message: 'Vector store deleted' });
    } catch (e) {
      console.error('Failed to delete vector store:', e);
      setError('Failed to delete vector store');
      setSnack({ open: true, severity: 'error', message: 'Failed to delete vector store' });
    } finally {
      closeConfirm();
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <>
      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
          <Typography variant="h5" sx={{ m: 0 }}>Vector Stores</Typography>
          <Button variant="contained" color="primary" onClick={handleAdd}>
            Add Vector Store
          </Button>
        </Box>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Vendor</TableCell>
              <TableCell>Index Name</TableCell>
              <TableCell>Embedding</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((it) => (
              <TableRow
                key={it.vectorStoreId}
                hover
                sx={{ cursor: 'pointer' }}
                onClick={() => navigate(`/vectorstores/${it.vectorStoreId}`)}
              >
                <TableCell>{(it as any).vectorStoreName || '-'}</TableCell>
                <TableCell>{it.vectorStoreVendor || '-'}</TableCell>
                <TableCell>{(it.vectorStoreConfig as any)?.indexName || '-'}</TableCell>
                <TableCell>{embeddingMap[it.embeddingId] || it.embeddingId || '-'}</TableCell>
                <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                  <Button variant="outlined" color="error" size="small" onClick={() => openConfirmDelete(it.vectorStoreId, (it as any).vectorStoreName || (it.vectorStoreConfig as any)?.indexName)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">No vector stores found.</TableCell>
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
        <Alert elevation={6} variant="filled" severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))} sx={{ width: '100%' }}>
          {snack.message}
        </Alert>
      </Snackbar>

      <Dialog open={confirm.open} onClose={closeConfirm} aria-labelledby="confirm-delete-vs">
        <DialogTitle id="confirm-delete-vs">Delete vector store</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this vector store{confirm.label ? ` (${confirm.label})` : ''}? This action cannot be undone.
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

export default VectorStoreList;
