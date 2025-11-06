import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import { DataService } from '../services/DataService';
import { embedding } from '../models';

const paperStyle = { maxWidth: 720, margin: '24px auto', padding: 16 } as const;

const defaultForm: embedding = {
  embeddingId: '',
  embeddingVendor: '',
  embeddingModel: '',
  embeddingDimensions: 0,
  apiKey: '',
};

const EmbedingDetails: React.FC = () => {
  const { embeddingId } = useParams<{ embeddingId: string }>();
  const navigate = useNavigate();
  const service = useMemo(() => new DataService<embedding>('embeddings'), []);

  const [form, setForm] = useState<embedding>(defaultForm);
  const [loading, setLoading] = useState<boolean>(false);
  const [snack, setSnack] = useState<{ open: boolean; severity: 'success' | 'error'; message: string }>(
    { open: false, severity: 'success', message: '' }
  );
  const [error, setError] = useState<string | null>(null);

  // Load existing embedding
  useEffect(() => {
    const load = async () => {
      if (!embeddingId || embeddingId === 'new') return;
      try {
        setLoading(true);
        const existing = await service.get(embeddingId);
        setForm(existing);
      } catch (e) {
        console.error('Failed to load embedding:', e);
        setError('Failed to load embedding');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [embeddingId, service]);

  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'embeddingDimensions' ? Number(value) : value,
    }));
  }, []);

  const onSave = useCallback(async () => {
    try {
      setLoading(true);
      if (embeddingId && embeddingId !== 'new') {
        const updated = await service.update(embeddingId, form);
        setSnack({ open: true, severity: 'success', message: 'Embedding updated successfully' });
        setForm(updated);
      } else {
        const created = await service.create(form);
        setSnack({ open: true, severity: 'success', message: 'Embedding created successfully' });
        if (created?.embeddingId) {
          navigate(`/embeddings/${created.embeddingId}`, { replace: true });
        }
      }
    } catch (e) {
      console.error('Failed to save embedding:', e);
      setSnack({ open: true, severity: 'error', message: 'Failed to save embedding' });
    } finally {
      setLoading(false);
    }
  }, [embeddingId, form, service, navigate]);

  if (loading && (!embeddingId || embeddingId !== 'new') && form.embeddingId === '') {
    return <CircularProgress sx={{ m: 3 }} />;
  }

  return (
    <Paper elevation={1} sx={paperStyle}>
      <Typography variant="h5" gutterBottom>
        {embeddingId === 'new' ? 'New Embedding' : 'Embedding Details'}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
        <TextField
          label="Vendor"
          name="embeddingVendor"
          value={form.embeddingVendor}
          onChange={onChange}
          fullWidth
        />
        <TextField
          label="Model"
          name="embeddingModel"
          value={form.embeddingModel}
          onChange={onChange}
          fullWidth
        />
        <TextField
          label="Dimensions"
          name="embeddingDimensions"
          type="number"
          value={form.embeddingDimensions}
          onChange={onChange}
          fullWidth
          inputProps={{ min: 0 }}
        />
        <TextField
          label="API Key"
          name="apiKey"
          value={form.apiKey}
          onChange={onChange}
          type="password"
          fullWidth
        />
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
        <Alert
          severity={snack.severity}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default EmbedingDetails;
