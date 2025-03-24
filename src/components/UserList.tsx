import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@mui/material';
import { User } from '../models'; // Assume User is defined in your models
import AddUser from './AddUser';

interface UserListProps {
  initialUsers: User[];
}

const UserList: React.FC<UserListProps> = ({ initialUsers }) => {
  const [users, setUsers] = useState<User[]>(initialUsers);

  const handleAddUser = (newUser: User) => {
    setUsers((prevUsers) => [...prevUsers, newUser]);
  };

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
              <TableCell>User ID</TableCell>
              <TableCell>Client ID</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Name</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.userId}>
                <TableCell>{user.userId}</TableCell>
                <TableCell>{user.clientId}</TableCell>
                <TableCell>{user.email}</TableCell>
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