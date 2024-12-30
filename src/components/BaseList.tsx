import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, CircularProgress, Alert } from '@mui/material';
import { Base } from '../models';

interface BaseListProps {
  bases: Base[];
  loading: boolean;
  error: string | null;
}

const BaseList: React.FC<BaseListProps> = ({ bases, loading, error }) => {
  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Base List
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Owner ID</TableCell>
              <TableCell>Model</TableCell>
              <TableCell>Dimensions</TableCell>
              <TableCell>Created At</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bases.map((base) => (
              <TableRow key={base.baseId}>
                <TableCell>{base.baseName}</TableCell>
                <TableCell>{base.ownerId}</TableCell>
                <TableCell>{base.modelName}</TableCell>
                <TableCell>{base.dimensions}</TableCell>
                <TableCell>{new Date(base.createdAt * 1000).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default BaseList;