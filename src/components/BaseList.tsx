import React, { useEffect, useState } from 'react';
import BaseService from '../BaseService';
import { List, ListItem, ListItemText, Typography, CircularProgress, Alert } from '@mui/material';

interface Base {
  id: string;
  ownerId: string;
  name: string;
  model: string;
  dimensions: number;
  createdAt: Date;
  // Add other properties as needed
}

const BaseList: React.FC = () => {
    const [bases, setBases] = useState<Base[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
  
    useEffect(() => {
      const fetchBases = async () => {
        try {
          const baseService = new BaseService();
          const basesData = await baseService.listBases();
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
        <List>
          {bases.map((base) => (
            <ListItem key={base.id}>
              <ListItemText
                primary={base.name}
                secondary={
                  <>
                    <Typography component="span" variant="body2" color="textPrimary">
                      Owner ID: {base.ownerId}
                    </Typography>
                    <br />
                    Model: {base.model}
                    <br />
                    Dimensions: {base.dimensions}
                    <br />
                    Created At: {new Date(base.createdAt).toLocaleString()}
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      </div>
    );
  };
  
  export default BaseList;