import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom';
import { Box, CssBaseline, Drawer, List, ListItem, ListItemText, Toolbar, AppBar, Typography, Button } from '@mui/material';
import { useAuthenticator } from '@aws-amplify/ui-react';
import BaseList from './components/BaseList';
import AddBase from './components/AddBase';
import BaseService from './BaseService';
import { Base } from './models';
import DocumentList from './components/DocumentList';
import ChatbotList from './components/ChatbotList';
import ChatbotDetails from './components/ChatbotDetails';
import VoicebotList from './components/VoicebotList';
import VoicebotDetails from './components/VoicebotDetails';

const drawerWidth = 240;

const App: React.FC = () => {
  const { user, signOut } = useAuthenticator();
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

  const handleAddBase = (newBase: Base) => {
    setBases((prevBases) => [...prevBases, newBase]);
  };

  const handleDeleteBase = (baseId: string) => {
    setBases((prevBases) => prevBases.filter(base => base.baseId !== baseId));
  };

  const handleUpdateBase = (updatedBase: Base) => {
    setBases((prevBases) => prevBases.map(base => (base.baseId === updatedBase.baseId ? updatedBase : base)));
  };

  return (
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
            <Route path="/bases" element={
              <>
                <BaseList bases={bases} loading={loading} error={error} onDeleteBase={handleDeleteBase} onUpdateBase={handleUpdateBase} />
                <AddBase onAddBase={handleAddBase} />
              </>
            } />
            <Route path="/bases/:baseId" element={<DocumentList />} />
            <Route path="/chatbots" element={<ChatbotList />} />
            <Route path="/chatbots/:chatbotId" element={<ChatbotDetails />} />
            <Route path="/voicebots" element={<VoicebotList />} />
            <Route path="/voicebots/:voicebotId" element={<VoicebotDetails />} />
          </Routes>
        </Box>
      </Box>
    </Router>
  );
};

export default App;