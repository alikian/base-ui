import React, { useEffect, useState } from 'react';
import { CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Alert, Button, Box } from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Pipeline } from '../models'; // Assume User is defined in your models
import { DataService } from '../services/DataService';

interface PipelineListProps {
  initialPipelines?: Pipeline[];
}

const PipelineList: React.FC<PipelineListProps> = ({ initialPipelines = [] }) => {
  const [pipelines, setPipelines] = useState<Pipeline[]>(initialPipelines);
  const pipelineService = new DataService<Pipeline>('pipelines');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
   useEffect(() => {
      const fetchUsers = async () => {
        try {
          const response = await pipelineService.getAll();
          setPipelines(response);
        } catch (error) {
          console.error('Error fetching pipelines:', error);
          setError('Failed to fetch pipelines');
        } finally {
        setLoading(false);
      }
      };
  
      fetchUsers();
    }, []);

  // Removed unused handleDetailsPipeline to satisfy linter

    if (loading) {
      return <CircularProgress />;
    }
  
    if (error) {
      return <Alert severity="error">{error}</Alert>;
    }

  return (
    <>
      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
          <Typography variant="h4" gutterBottom sx={{ m: 0 }}>
            Pipeline List
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/pipelines/new')}
          >
            Add Pipeline
          </Button>
        </Box>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Pipeline Name</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pipelines.map((pipeline) => (
              <TableRow key={pipeline.pipelineId} hover>
                <TableCell>
                  <RouterLink
                    to={`/pipelines/${pipeline.pipelineId}`}
                    style={{ textDecoration: 'none', color: '#1976d2', fontWeight: 500 }}
                  >
                    {pipeline.pipelineName || '(unnamed)'}
                  </RouterLink>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default PipelineList;