import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Alert } from '@mui/material';
import { DataService } from '../services/DataService';
import { User } from '../models'; // Assume User is defined in your models

interface AddUserProps {
  onAddUser: (newUser: User) => void;
}

const AddUser: React.FC<AddUserProps> = ({ onAddUser }) => {
  const [userId, setUserId] = useState<string>(''); // Hidden field
  const [clientId, setClientId] = useState<string>(''); // Hidden field
  const [email, setEmail] = useState<string>('');
  const [name, setName] = useState<string>(''); // Added state for name
  const [phone, setPhone] = useState<string>(''); // Added state for phone
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const userService = new DataService<User>('users');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const userData: User = {
      userId,
      clientId,
      email,
      name,
      phone, // Include phone in the user data
    };

    try {
      const newUser = await userService.create(userData);
      onAddUser(newUser);
      setName(''); // Reset name field
      setUserId('');
      setClientId('');
      setEmail('');
      setName(''); // Reset name field
      setPhone(''); // Reset phone field
    } catch (error) {
      console.error('Error creating user:', error);
      setError('Failed to create user');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ p: 2 }}>
        Add New User
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
      {/* Hidden fields for userId and clientId */}
      <TextField
        type="hidden"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
      />
      <TextField
        type="hidden"
        value={clientId}
        onChange={(e) => setClientId(e.target.value)}
      />
      <TextField
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        fullWidth
        margin="normal"
        required
      />
      <TextField
        label="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        fullWidth
        margin="normal"
        required
      />
      <TextField
        label="Phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        fullWidth
        margin="normal"
        required
      />
      <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
        Add User
      </Button>
    </Box>
  );
};

export default AddUser;