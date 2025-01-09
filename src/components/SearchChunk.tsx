import React, { useState } from 'react';
import { TextField, Button, Box, Typography, CircularProgress, Alert, List, ListItem, ListItemText } from '@mui/material';
import BaseService from '../BaseService';
import { Chunk } from '../models';

interface SearchChunkProps {
  baseId: string;
}

const SearchChunk: React.FC<SearchChunkProps> = ({ baseId }) => {
  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Chunk[]>([]);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const baseService = new BaseService();
      const searchResults = await baseService.searchChunk(baseId, query);
      if(searchResults){
        console.log('Search results:', searchResults);
        setResults(searchResults);
      }
    } catch (error) {
      console.error('Error searching chunks:', error);
      setError('Failed to search chunks');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Search Chunks
      </Typography>
      <Box display="flex" alignItems="center" mb={2}>
        <TextField
          label="Query"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          fullWidth
          margin="normal"
        />
        <Button variant="contained" color="primary" onClick={handleSearch} disabled={loading} sx={{ ml: 2 }}>
          Search
        </Button>
      </Box>
      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}
      {results.length > 0 && (
        <List>
          {results.map((result) => (
            <ListItem key={result.id}>
              <ListItemText primary={result.text}  />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default SearchChunk;