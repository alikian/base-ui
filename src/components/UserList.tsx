import React, { useEffect, useState } from 'react';
import { CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Alert } from '@mui/material';
import { User } from '../models'; // Assume User is defined in your models
import AddUser from './AddUser';
import { DataService } from '../services/DataService';

interface UserListProps {
  initialUsers: User[];
}

const UserList: React.FC<UserListProps> = ({ initialUsers }) => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const userService = new DataService<User>('users');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
   useEffect(() => {
      const fetchUsers = async () => {
        try {
          const response = await userService.getAll();
          setUsers(response);
        } catch (error) {
          console.error('Error fetching users:', error);
          setError('Failed to fetch users');
        } finally {
        setLoading(false);
      }
      };
  
      fetchUsers();
    }, []);

  const handleAddUser = (newUser: User) => {
    setUsers((prevUsers) => [...prevUsers, newUser]);
  };

    if (loading) {
      return <CircularProgress />;
    }
  
    if (error) {
      return <Alert severity="error">{error}</Alert>;
    }

  return (
    <>
      <AddUser onAddUser={handleAddUser} />
      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ p: 2 }}>
          User List
        </Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Name</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.email}>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user.name}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default UserList;