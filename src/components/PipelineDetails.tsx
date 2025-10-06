import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { PipelineEditor, type PipelineGraph } from './PipelineEditor';
import { Pipeline } from '../models'; 
import { DataService } from '../services/DataService';
import { useParams, useNavigate } from 'react-router-dom';
import { Snackbar, Alert } from '@mui/material';


const PipelineDetails: React.FC = () => {
  let { pipelineId } = useParams<{ pipelineId: string }>();
  const navigate = useNavigate();
  const [pipelineName] = useState<string>(''); // Optional external name source
  const pipelineService = useMemo(() => new DataService<Pipeline>('pipelines'), []);
  const [initialGraph, setInitialGraph] = useState<Partial<PipelineGraph>>({
    pipelineName: pipelineName || 'New Pipeline',
    nodes: [],
    edges: [],
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [snack, setSnack] = useState<{ open: boolean; severity: 'success' | 'error' | 'info' | 'warning'; message: string }>(
    { open: false, severity: 'success', message: '' }
  );

  // Load existing pipeline by id when present
  useEffect(() => {
    const load = async () => {
      // Guard: only fetch when we actually have a concrete id (not "new")
      if (!pipelineId || pipelineId === 'new') return;
      try {
        setLoading(true);
        const pipeline = await pipelineService.get(pipelineId);

        // pipelineData may be a JSON string or an object; normalize it
        let parsed: any = { nodes: [], edges: [] };
        try {
          parsed = typeof pipeline?.pipelineData === 'string'
            ? JSON.parse(pipeline.pipelineData as unknown as string)
            : (pipeline?.pipelineData ?? parsed);
        } catch (e) {
          console.warn('Invalid pipelineData JSON; starting empty.', e);
        }

        setInitialGraph({
          pipelineName: pipeline?.pipelineName || 'Pipeline',
          nodes: parsed?.nodes ?? [],
          edges: parsed?.edges ?? [],
        });
      } catch (e) {
        console.error('Failed to load pipeline:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [pipelineId, pipelineService]);

  const handleSave = useCallback(async (graph: PipelineGraph) => {
    const payload: Pipeline = {
      pipelineId: pipelineId || '',
      pipelineName: graph.pipelineName,
      pipelineData: { nodes: graph.nodes, edges: graph.edges },
    };
    try {
      if (pipelineId !== 'new') {
        const updated = await pipelineService.update(pipelineId || '', payload);
        console.log('Pipeline updated:', updated);
        setSnack({ open: true, severity: 'success', message: 'Pipeline updated successfully' });
      } else {
        const created = await pipelineService.create(payload);
        console.log('Pipeline created:', created);
        if (created?.pipelineId) {
          navigate(`/pipelines/${created.pipelineId}`, { replace: true });
        }
        setSnack({ open: true, severity: 'success', message: 'Pipeline created successfully' });

      }
    } catch (err) {
      console.error('Failed to save pipeline:', err);
      setSnack({ open: true, severity: 'error', message: 'Failed to save pipeline' });
    }
  }, [pipelineId, pipelineService, navigate]);

  const pipelineDataObj: Partial<PipelineGraph> = initialGraph;

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      {loading ? (
        <div style={{ padding: 16 }}>Loading...</div>
      ) : (
        <PipelineEditor pipelineData={pipelineDataObj} style={{ background: '#d5d5d5' }} onSave={handleSave} />
      )}

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
    </div>
  );
};

export default PipelineDetails;