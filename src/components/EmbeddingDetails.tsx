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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { DataService } from '../services/DataService';
import embeddingConfig from '../config/embeddings.json';
import { embedding } from '../models';

const paperStyle = { maxWidth: 720, margin: '24px auto', padding: 16 } as const;

const defaultForm: embedding = {
  embeddingId: '',
  embeddingVendor: '',
  embeddingModel: '',
  embeddingDimensions: 0,
  apiKey: '',
};

const EmbeddingDetails: React.FC = () => {
  const { embeddingId } = useParams<{ embeddingId: string }>();
  const navigate = useNavigate();
  const service = useMemo(() => new DataService<embedding>('embeddings'), []);

  const [form, setForm] = useState<embedding>(defaultForm);
  const [loading, setLoading] = useState<boolean>(false);
  const [snack, setSnack] = useState<{ open: boolean; severity: 'success' | 'error'; message: string }>(
    { open: false, severity: 'success', message: '' }
  );
  const [error, setError] = useState<string | null>(null);

  // Initialize defaults for new & load existing embedding by id
  useEffect(() => {
    const load = async () => {
      if (!embeddingId || embeddingId === 'new') {
        // Initialize defaults from config for new embedding (vendor -> first model)
        const config: any = embeddingConfig;
        const defKey: string = config?.defaultVendor || 'openai';
        const vendor = config?.vendors?.[defKey];
        const firstModel = vendor?.models?.[0];
        setForm((prev) => ({
          ...prev,
          embeddingVendor: vendor?.label || prev.embeddingVendor,
          embeddingModel: firstModel?.id || prev.embeddingModel,
          embeddingDimensions: typeof firstModel?.dimensions === 'number' ? firstModel.dimensions : prev.embeddingDimensions,
        }));
        return;
      }
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

  // Derived options for dropdowns
  const config: any = embeddingConfig;
  const vendorEntries: Array<{ key: string; label: string }> = Object.entries(config?.vendors || {}).map(
    ([key, v]: any) => ({ key, label: v?.label || key })
  );
  const selectedVendorKey = React.useMemo(() => {
    const byLabel = vendorEntries.find((v) => v.label === form.embeddingVendor)?.key;
    return byLabel || config?.defaultVendor || 'openai';
  }, [form.embeddingVendor]);
  const vendorModels: Array<{ id: string; label: string; dimensions: number }> =
    (config?.vendors?.[selectedVendorKey]?.models || []) as any;
  const selectedModel = vendorModels.find((m) => m.id === form.embeddingModel) || vendorModels[0];

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

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2 }}>
        <FormControl fullWidth>
          <InputLabel id="vendor-label">Vendor</InputLabel>
          <Select
            labelId="vendor-label"
            label="Vendor"
            value={form.embeddingVendor || ''}
            onChange={(e) => {
              const newVendorLabel = String(e.target.value);
              const key = vendorEntries.find((v) => v.label === newVendorLabel)?.key || selectedVendorKey;
              const first = (config?.vendors?.[key]?.models || [])[0];
              setForm((prev) => ({
                ...prev,
                embeddingVendor: newVendorLabel,
                embeddingModel: first?.id || '',
                embeddingDimensions: first?.dimensions ?? 0,
              }));
            }}
          >
            {vendorEntries.map((v) => (
              <MenuItem key={v.key} value={v.label}>{v.label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel id="model-label">Model</InputLabel>
          <Select
            labelId="model-label"
            label="Model"
            value={form.embeddingModel || ''}
            onChange={(e) => {
              const id = String(e.target.value);
              const model = vendorModels.find((m) => m.id === id);
              setForm((prev) => ({
                ...prev,
                embeddingModel: id,
                embeddingDimensions: model?.dimensions ?? prev.embeddingDimensions,
              }));
            }}
          >
            {vendorModels.map((m) => (
              <MenuItem key={m.id} value={m.id}>{m.label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel id="dim-label">Dimensions</InputLabel>
          <Select
            labelId="dim-label"
            label="Dimensions"
            value={String(form.embeddingDimensions ?? (selectedModel?.dimensions ?? ''))}
            onChange={(e) => {
              const dim = Number(e.target.value);
              setForm((prev) => ({ ...prev, embeddingDimensions: dim }));
            }}
          >
            {selectedModel ? (
              <MenuItem value={selectedModel.dimensions}>{selectedModel.dimensions}</MenuItem>
            ) : null}
          </Select>
        </FormControl>

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

export default EmbeddingDetails;
