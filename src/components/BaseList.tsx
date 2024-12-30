import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, CircularProgress, Alert, IconButton, TextField, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { Base } from '../models';
import BaseService from '../BaseService';

interface BaseListProps {
  bases: Base[];
  loading: boolean;
  error: string | null;
  onDeleteBase: (baseId: string) => void;
  onUpdateBase: (updatedBase: Base) => void;
}

const BaseList: React.FC<BaseListProps> = ({ bases, loading, error, onDeleteBase, onUpdateBase }) => {
  const [editingBaseId, setEditingBaseId] = useState<string | null>(null);
  const [editedBase, setEditedBase] = useState<Partial<Base>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [baseToDelete, setBaseToDelete] = useState<string | null>(null);

  const handleDelete = async (baseId: string) => {
    try {
      const baseService = new BaseService();
      await baseService.deleteBase(baseId);
      onDeleteBase(baseId);
    } catch (error) {
      console.error('Error deleting base:', error);
    }
  };

  const handleEdit = (base: Base) => {
    setEditingBaseId(base.baseId);
    setEditedBase(base);
  };

  const handleSave = async () => {
    if (editingBaseId) {
      try {
        const baseService = new BaseService();
        const updatedBase = await baseService.updateBase(editingBaseId, editedBase);
        onUpdateBase(updatedBase);
        setEditingBaseId(null);
        setEditedBase({});
      } catch (error) {
        console.error('Error updating base:', error);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedBase((prev) => ({ ...prev, [name]: value }));
  };

  const openDeleteDialog = (baseId: string) => {
    setBaseToDelete(baseId);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setBaseToDelete(null);
    setDeleteDialogOpen(false);
  };

  const confirmDelete = () => {
    if (baseToDelete) {
      handleDelete(baseToDelete);
      closeDeleteDialog();
    }
  };

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
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bases.map((base) => (
              <TableRow key={base.baseId}>
                <TableCell>
                  {editingBaseId === base.baseId ? (
                    <TextField name="baseName" value={editedBase.baseName || ''} onChange={handleChange} />
                  ) : (
                    base.baseName
                  )}
                </TableCell>
                <TableCell>{base.ownerId}</TableCell>
                <TableCell>
                  {editingBaseId === base.baseId ? (
                    <TextField name="modelName" value={editedBase.modelName || ''} onChange={handleChange} />
                  ) : (
                    base.modelName
                  )}
                </TableCell>
                <TableCell>{base.dimensions}</TableCell>
                <TableCell>{new Date(base.createdAt * 1000).toLocaleString()}</TableCell>
                <TableCell>
                  {editingBaseId === base.baseId ? (
                    <IconButton onClick={handleSave} aria-label="save">
                      <SaveIcon />
                    </IconButton>
                  ) : (
                    <IconButton onClick={() => handleEdit(base)} aria-label="edit">
                      <EditIcon />
                    </IconButton>
                  )}
                  <IconButton onClick={() => openDeleteDialog(base.baseId)} aria-label="delete">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this base? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="secondary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default BaseList;