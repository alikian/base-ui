import React, { useEffect, useState } from 'react';
import { Voicebot } from '../models';
import { DataService } from '../services/DataService';
import { CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Paper, Alert } from '@mui/material';
import { Link } from 'react-router-dom';
import AddVoiceBot from './AddVoiceBot';

const VoicebotList: React.FC = () => {
  const [voicebots, setVoicebots] = useState<Voicebot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const voicebotService = new DataService<Voicebot>('voicebots');

  useEffect(() => {
    const fetchChatbots = async () => {
      try {
        const response = await voicebotService.getAll();
        setVoicebots(response);
      } catch (error) {
        console.error('Error fetching chatbots:', error);
        setError('Failed to fetch chatbots');
      } finally {
        setLoading(false);
      }
    };

    fetchChatbots();
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
        Voicebot List
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Provider</TableCell>
              <TableCell>Model</TableCell>
              <TableCell>Temperature</TableCell>
              {/* <TableCell>Instruction</TableCell> */}
              <TableCell>Voice</TableCell>
              <TableCell>Max Tokens</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {voicebots.map((voicebot) => (
              <TableRow key={voicebot.voicebotId}>
                <TableCell>
                  <Link to={`/voicebots/${voicebot.voicebotId}`}>{voicebot.name}</Link>
                </TableCell>
                <TableCell>{voicebot.phone}</TableCell>
                <TableCell>{voicebot.provider}</TableCell>
                <TableCell>{voicebot.model}</TableCell>
                <TableCell>{voicebot.temperature}</TableCell>
                {/* <TableCell>{voicebot.instructions}</TableCell> */}
                <TableCell>{voicebot.voice}</TableCell>
                <TableCell>{voicebot.maxTokens}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <AddVoiceBot onAddVoiceBot={(newVoiceBot) => setVoicebots([...voicebots, newVoiceBot])} />
    </div>
  );
};

export default VoicebotList;