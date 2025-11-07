import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
} from '@mui/material';
import { DataService } from '../services/DataService';
import { VectorStore, embedding } from '../models';

const paperStyle = { maxWidth: 720, margin: '24px auto', padding: 16 } as const;

const VENDOR_OPTIONS = [
  { value: 'pinecone', label: 'Pinecone' },
  { value: 'faiss', label: 'FAISS' },
  { value: 'chroma', label: 'Chroma' },
];

// Local form type extends backend schema with UI-only fields (like pinecone apiKey)
interface VectorStoreForm extends VectorStore {
  vectorStoreConfig: any & { indexName?: string; apiKey?: string };
}

const defaultForm: VectorStoreForm = {
  vectorStoreId: '',
  vectorStoreName: '',
  embeddingId: '',
  vectorStoreVendor: 'pinecone',
  vectorStoreConfig: { indexName: '', apiKey: '' },
};

const VectorStoreDetails: React.FC = () => {
  const { vectorStoreId } = useParams<{ vectorStoreId: string }>();
  const navigate = useNavigate();
  const service = useMemo(() => new DataService<VectorStore>('vectorstores'), []);
  const embeddingService = useMemo(() => new DataService<embedding>('embeddings'), []);

  const [form, setForm] = useState<VectorStoreForm>(defaultForm);
  const [embeddings, setEmbeddings] = useState<embedding[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [snack, setSnack] = useState<{ open: boolean; severity: 'success' | 'error'; message: string }>({ open: false, severity: 'success', message: '' });
  const [error, setError] = useState<string | null>(null);

  // Load embeddings and existing vector store (if editing)
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [embedList, vs] = await Promise.all([
          embeddingService.getAll(),
          vectorStoreId && vectorStoreId !== 'new' ? service.get(vectorStoreId) : Promise.resolve(null as any),
        ]);
        setEmbeddings(embedList || []);
        if (vs) {
          setForm({
            vectorStoreId: vs.vectorStoreId,
            vectorStoreName: (vs as any).vectorStoreName || '',
            embeddingId: vs.embeddingId,
            vectorStoreVendor: vs.vectorStoreVendor || 'pinecone',
            vectorStoreConfig: (vs.vectorStoreConfig as any) || { indexName: '', apiKey: '' },
          });
        } else {
          // defaults already set
        }
      } catch (e) {
        console.error('Failed to load vector store or embeddings:', e);
        setError('Failed to load vector store or embeddings');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [vectorStoreId, service, embeddingService]);

  const onSave = useCallback(async () => {
    try {
      setLoading(true);
      const payload: VectorStore = {
        vectorStoreId: vectorStoreId && vectorStoreId !== 'new' ? vectorStoreId : '',
        vectorStoreName: form.vectorStoreName,
        embeddingId: form.embeddingId,
        vectorStoreVendor: form.vectorStoreVendor,
        vectorStoreConfig: form.vectorStoreConfig,
      } as any; // allow apiKey in config for UI purposes

      if (vectorStoreId && vectorStoreId !== 'new') {
        const updated = await service.update(vectorStoreId, payload);
        setSnack({ open: true, severity: 'success', message: 'Vector store updated successfully' });
        setForm({ ...form, ...updated } as any);
      } else {
        const created = await service.create(payload);
        setSnack({ open: true, severity: 'success', message: 'Vector store created successfully' });
        if (created?.vectorStoreId) {
          navigate(`/vectorstores/${created.vectorStoreId}`, { replace: true });
        }
      }
    } catch (e) {
      console.error('Failed to save vector store:', e);
      setSnack({ open: true, severity: 'error', message: 'Failed to save vector store' });
    } finally {
      setLoading(false);
    }
  }, [vectorStoreId, form, service, navigate]);

  if (loading && (!vectorStoreId || vectorStoreId !== 'new') && !form.vectorStoreId) {
    return <CircularProgress sx={{ m: 3 }} />;
  }

  return (
    <Paper elevation={1} sx={paperStyle}>
      <Typography variant="h5" gutterBottom>
        {vectorStoreId === 'new' ? 'New Vector Store' : 'Vector Store Details'}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2 }}>
        <TextField
          label="Vector Store Name"
          value={form.vectorStoreName}
          onChange={(e) => setForm((prev) => ({ ...prev, vectorStoreName: e.target.value }))}
          fullWidth
        />
        <FormControl fullWidth>
          <InputLabel id="vendor-label">Vector Store Vendor</InputLabel>
          <Select
            labelId="vendor-label"
            label="Vector Store Vendor"
            value={form.vectorStoreVendor}
            onChange={(e) => {
              const v = String(e.target.value) as VectorStore['vectorStoreVendor'];
              setForm((prev) => ({
                ...prev,
                vectorStoreVendor: v,
                vectorStoreConfig: v === 'pinecone' ? { indexName: '', apiKey: '' } : {},
              }));
            }}
          >
            {VENDOR_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {form.vectorStoreVendor === 'pinecone' && (
          <>
            <TextField
              label="Pinecone Index Name"
              value={(form.vectorStoreConfig as any)?.indexName || ''}
              onChange={(e) => setForm((prev) => ({ ...prev, vectorStoreConfig: { ...prev.vectorStoreConfig, indexName: e.target.value } }))}
              fullWidth
            />
            <TextField
              label="Pinecone API Key"
              type="password"
              value={(form.vectorStoreConfig as any)?.apiKey || ''}
              onChange={(e) => setForm((prev) => ({ ...prev, vectorStoreConfig: { ...prev.vectorStoreConfig, apiKey: e.target.value } }))}
              fullWidth
            />
          </>
        )}

        <FormControl fullWidth>
          <InputLabel id="embedding-label">Embedding</InputLabel>
          <Select
            labelId="embedding-label"
            label="Embedding"
            value={form.embeddingId}
            onChange={(e) => setForm((prev) => ({ ...prev, embeddingId: String(e.target.value) }))}
          >
            {embeddings.map((em) => (
              <MenuItem key={em.embeddingId} value={em.embeddingId}>
                {em.embeddingVendor} / {em.embeddingModel} ({em.embeddingDimensions})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
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

export default VectorStoreDetails;
