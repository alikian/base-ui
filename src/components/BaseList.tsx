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
import { Base, VectorStore } from '../models';
import { DataService } from '../services/DataService';

const BaseList: React.FC = () => {
  const navigate = useNavigate();
  const service = useMemo(() => new DataService<Base>('bases'), []);
  const vsService = useMemo(() => new DataService<VectorStore>('vectorstores'), []);

  const [items, setItems] = useState<Base[]>([]);
  const [vsMap, setVsMap] = useState<Record<string, string>>({});
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
        const [all, vs] = await Promise.all([service.getAll(), vsService.getAll()]);
        setItems(all || []);
        const map: Record<string, string> = {};
        (vs || []).forEach((v) => {
          map[v.vectorStoreId] = (v as any).vectorStoreName || (v.vectorStoreConfig as any)?.indexName || v.vectorStoreId;
        });
        setVsMap(map);
      } catch (e) {
        console.error('Failed to fetch bases:', e);
        setError('Failed to fetch bases');
        setSnack({ open: true, severity: 'error', message: 'Failed to fetch bases' });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [service, vsService]);

  const handleAdd = () => navigate('/bases/new');

  const openConfirmDelete = (id: string, label?: string) => setConfirm({ open: true, id, label });
  const closeConfirm = () => setConfirm({ open: false });
  const confirmDelete = async () => {
    if (!confirm.id) return;
    try {
      await service.delete(confirm.id);
      setItems((prev) => prev.filter((x) => x.baseId !== confirm.id));
      setSnack({ open: true, severity: 'success', message: 'Base deleted' });
    } catch (e) {
      console.error('Failed to delete base:', e);
      setError('Failed to delete base');
      setSnack({ open: true, severity: 'error', message: 'Failed to delete base' });
    } finally {
      closeConfirm();
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <>
      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
          <Typography variant="h5" sx={{ m: 0 }}>Knowledge Bases</Typography>
          <Button variant="contained" color="primary" onClick={handleAdd}>
            Add Base
          </Button>
        </Box>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Storage Type</TableCell>
              <TableCell>Vector Store</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((it) => (
              <TableRow
                key={it.baseId}
                hover
                sx={{ cursor: 'pointer' }}
                onClick={() => navigate(`/bases/${it.baseId}`)}
              >
                <TableCell>{it.baseName || '-'}</TableCell>
                <TableCell>{it.storageType || '-'}</TableCell>
                <TableCell>{vsMap[it.vectorStoreId] || it.vectorStoreId || '-'}</TableCell>
                <TableCell>{it.createdAt ? new Date(it.createdAt).toLocaleString() : '-'}</TableCell>
                <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                  <Button variant="outlined" color="error" size="small" onClick={() => openConfirmDelete(it.baseId, it.baseName)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">No bases found.</TableCell>
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

      <Dialog open={confirm.open} onClose={closeConfirm} aria-labelledby="confirm-delete-base">
        <DialogTitle id="confirm-delete-base">Delete base</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this base{confirm.label ? ` (${confirm.label})` : ''}? This action cannot be undone.
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

export default BaseList;
