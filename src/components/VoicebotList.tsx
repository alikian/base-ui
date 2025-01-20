import React, { useEffect, useState } from 'react';
import { Voicebot } from '../models';
import { DataService } from '../services/DataService';
import { CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Paper, Alert } from '@mui/material';
import { Link } from 'react-router-dom';

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
              <TableCell>Voicebot Name</TableCell>
              <TableCell>LLM</TableCell>
              <TableCell>LLM Model</TableCell>
              <TableCell>LLM Temperature</TableCell>
              <TableCell>Instruction</TableCell>
              <TableCell>Voice</TableCell>
              <TableCell>Max Tokens</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {voicebots.map((voicebot) => (
              <TableRow key={voicebot.voicebotId}>
                <TableCell>
                  <Link to={`/voicebots/${voicebot.voicebotId}`}>{voicebot.voicebotName}</Link>
                </TableCell>
                <TableCell>{voicebot.llm}</TableCell>
                <TableCell>{voicebot.llmModel}</TableCell>
                <TableCell>{voicebot.llmTemperature}</TableCell>
                <TableCell>{voicebot.instructions}</TableCell>
                <TableCell>{voicebot.voice}</TableCell>
                <TableCell>{voicebot.maxTokens}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default VoicebotList;