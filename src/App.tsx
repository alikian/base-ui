import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom';
import { Box, CssBaseline, Drawer, List, ListItem, ListItemText, Toolbar, AppBar, Typography, Button } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useAuthenticator } from '@aws-amplify/ui-react';
import BaseList from './components/BaseList';
import DocumentList from './components/DocumentList';
import ChatbotList from './components/ChatbotList';
import ChatbotDetails from './components/ChatbotDetails';
import VoicebotList from './components/VoicebotList';
import VoicebotDetails from './components/VoicebotDetails';
import UserList from './components/UserList';

const drawerWidth = 240;

// Define a custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#424242', // Dark grey as the primary color
    },
    secondary: {
      main: '#757575', // Medium grey as the secondary color
    },
    background: {
      default: '#e0e0e0', // Light grey as the background color
      paper: '#f5f5f5', // Slightly lighter grey for paper components
    },
    text: {
      primary: '#212121', // Almost black for primary text
      secondary: '#616161', // Dark grey for secondary text
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif', // Custom font
    h6: {
      fontWeight: 600, // Custom font weight for headings
    },
  },
});

const App: React.FC = () => {
  const { user, signOut } = useAuthenticator();
  
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Box sx={{ display: 'flex' }}>
          <CssBaseline />
          <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <Toolbar>
              <Typography variant="h6" noWrap component="div">
                Welcome, {user?.username}
              </Typography>
              <Button color="inherit" onClick={signOut} style={{ marginLeft: 'auto' }}>
                Sign out
              </Button>
            </Toolbar>
          </AppBar>
          <Drawer
            variant="permanent"
            sx={{
              width: drawerWidth,
              flexShrink: 0,
              [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
            }}
          >
            <Toolbar />
            <Box sx={{ overflow: 'auto' }}>
              <List>
                <ListItem component={Link} to="/bases">
                  <ListItemText primary="KnowlegdeBases" />
                </ListItem>
                <ListItem component={Link} to="/chatbots">
                  <ListItemText primary="Chatbots" />
                </ListItem>
                <ListItem component={Link} to="/voicebots">
                  <ListItemText primary="Voicebots" />
                </ListItem>
                <ListItem component={Link} to="/users">
                  <ListItemText primary="Users" />
                </ListItem>
              </List>
            </Box>
          </Drawer>
          <Box
            component="main"
            sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3 }}
          >
            <Toolbar />
            <Routes>
              <Route path="/" element={<Navigate to="/bases" />} />
              <Route path="/bases" element={<BaseList />} />
              <Route path="/bases/:baseId" element={<DocumentList />} />
              <Route path="/chatbots" element={<ChatbotList />} />
              <Route path="/chatbots/:chatbotId" element={<ChatbotDetails />} />
              <Route path="/voicebots" element={<VoicebotList />} />
              <Route path="/voicebots/:voicebotId" element={<VoicebotDetails />} />
              <Route path="/users" element={<UserList initialUsers={[]} />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
};

export default App;