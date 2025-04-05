import React, { useState,useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, CircularProgress, Alert, IconButton, TextField, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { Link } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { Base,VectorStore } from '../models';
import BaseService from '../BaseService';
import AddBase from './AddBase';
import { DataService } from '../services/DataService';



const BaseList: React.FC = () => {
  const [editingBaseId, setEditingBaseId] = useState<string | null>(null);
  const [editedBase, setEditedBase] = useState<Partial<Base>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [baseToDelete, setBaseToDelete] = useState<string | null>(null);
  const [bases, setBases] = useState<Base[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const vectoreDataService = new DataService<VectorStore>('vectorstores');
  const [vectorStoresCache, setVectorStoresCache] = useState<Record<string, string>>({});


  const handleAddBase = (newBase: Base) => {
    setBases((prevBases) => [...prevBases, newBase]);
  };

  const handleDeleteBase = (baseId: string) => {
    setBases((prevBases) => prevBases.filter(base => base.baseId !== baseId));
  };

  const handleUpdateBase = (updatedBase: Base) => {
    setBases((prevBases) => prevBases.map(base => (base.baseId === updatedBase.baseId ? updatedBase : base)));
  };

  useEffect(() => {
    const fetchBases = async () => {
      try {
        const baseService = new BaseService();
        const basesData = await baseService.listBases();
        const vectorStores = await vectoreDataService.getAll();
        // Create a hash table for vectorStores
        const vectorStoresCache = vectorStores.reduce((acc, store) => {
          acc[store.vectorStoreId] = store.embedingVendorName+'::'+store.embedingModeName+'::'+store.embedingModeDimensions;
          return acc;
        }, {} as Record<string, string>);
        setVectorStoresCache(vectorStoresCache);

        setBases(basesData);
      } catch (error) {
        console.error('Error fetching bases:', error);
        setError('Failed to fetch bases');
      } finally {
        setLoading(false);
      }
    };

    fetchBases();
  }, []);


  const handleDelete = async (baseId: string) => {
    try {
      const baseService = new BaseService();
      await baseService.deleteBase(baseId);
      handleDeleteBase(baseId);
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
        handleUpdateBase(updatedBase);
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
              <TableCell>Vector Store</TableCell>
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
                    <Link to={`/bases/${base.baseId}`}>{base.baseName}</Link>
                  )}
                </TableCell>
                <TableCell>
                  {editingBaseId === base.baseId ? (
                    <TextField name="modelName" value={editedBase.vectorStoreId || ''} onChange={handleChange} />
                  ) : (
                    vectorStoresCache[base.vectorStoreId] || 'Unknown'
                  )}
                </TableCell>
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
      <AddBase onAddBase={handleAddBase} />
    </div>
  );
};

export default BaseList;