import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  TextField,
  Typography,
  Link,
} from '@mui/material';
import { DataService } from '../services/DataService';
import { Base, VectorStore } from '../models';

const paperStyle = { maxWidth: 720, margin: '24px auto', padding: 16 } as const;

const BaseDetails: React.FC = () => {
  const { baseId } = useParams<{ baseId: string }>();
  const navigate = useNavigate();
  const service = useMemo(() => new DataService<Base>('bases'), []);
  const vectorStoreService = useMemo(() => new DataService<VectorStore>('vectorstores'), []);

  const [form, setForm] = useState<Base>({ baseId: '', baseName: '', vectorStoreId: '', createdAt: Date.now(), storageType: 's3' });
  const [vectorStores, setVectorStores] = useState<VectorStore[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [snack, setSnack] = useState<{ open: boolean; severity: 'success' | 'error'; message: string }>({ open: false, severity: 'success', message: '' });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [vsList, base] = await Promise.all([
          vectorStoreService.getAll(),
          baseId && baseId !== 'new' ? service.get(baseId) : Promise.resolve(null as any),
        ]);
        setVectorStores(vsList || []);
        if (base) {
          setForm(base);
        }
      } catch (e) {
        console.error('Failed to load base or vector stores:', e);
        setError('Failed to load base or vector stores');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [baseId, service, vectorStoreService]);

  const onSave = useCallback(async () => {
    try {
      setLoading(true);
      const payload: Base = {
        baseId: baseId && baseId !== 'new' ? baseId : '',
        baseName: form.baseName,
        vectorStoreId: form.vectorStoreId,
        storageType: form.storageType,
        createdAt: form.createdAt || Date.now(),
      };

      if (baseId && baseId !== 'new') {
        const updated = await service.update(baseId, payload);
        setSnack({ open: true, severity: 'success', message: 'Base updated successfully' });
        setForm(updated);
      } else {
        const created = await service.create(payload);
        setSnack({ open: true, severity: 'success', message: 'Base created successfully' });
        if (created?.baseId) {
          navigate(`/bases/${created.baseId}`, { replace: true });
        }
      }
    } catch (e) {
      console.error('Failed to save base:', e);
      setSnack({ open: true, severity: 'error', message: 'Failed to save base' });
    } finally {
      setLoading(false);
    }
  }, [baseId, form, service, navigate]);

  if (loading && (!baseId || baseId !== 'new') && !form.baseId) {
    return <CircularProgress sx={{ m: 3 }} />;
  }

  return (
    <Paper elevation={1} sx={paperStyle}>
      <Typography variant="h5" gutterBottom>
        {baseId === 'new' ? 'New Base' : 'Base Details'}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2 }}>
        <TextField
          label="Base Name"
          value={form.baseName}
          onChange={(e) => setForm((prev) => ({ ...prev, baseName: e.target.value }))}
          fullWidth
        />

        <FormControl fullWidth>
          <InputLabel id="storage-type-label">Storage Type</InputLabel>
          <Select
            labelId="storage-type-label"
            label="Storage Type"
            value={form.storageType}
            onChange={(e) => setForm((prev) => ({ ...prev, storageType: String(e.target.value) }))}
          >
            <MenuItem value="s3">Amazon S3</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel id="vs-label">Vector Store</InputLabel>
          <Select
            labelId="vs-label"
            label="Vector Store"
            value={form.vectorStoreId}
            onChange={(e) => setForm((prev) => ({ ...prev, vectorStoreId: String(e.target.value) }))}
          >
            {vectorStores.map((vs) => (
              <MenuItem key={vs.vectorStoreId} value={vs.vectorStoreId}>
                {(vs as any).vectorStoreName || (vs.vectorStoreConfig as any)?.indexName || vs.vectorStoreId}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Optional owner field for future use */}
        {/* <TextField label="Owner ID" value={form.ownerId} onChange={(e) => setForm((p) => ({ ...p, ownerId: e.target.value }))} fullWidth /> */}

        {baseId && baseId !== 'new' && (
          <Box>
            <Link component={RouterLink} to={`/bases/${baseId}/documents`} underline="hover">
              View Documents in this Base
            </Link>
          </Box>
        )}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button variant="contained" color="primary" onClick={onSave} disabled={loading}>
          Save
        </Button>
      </Box>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))} variant="filled" sx={{ width: '100%' }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default BaseDetails;
