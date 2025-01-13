import React, { useEffect, useState } from 'react';
import { Chatbot } from '../models';
import { DataService } from '../services/DataService';
import { CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Paper, Alert } from '@mui/material';
import { Link } from 'react-router-dom';

const ChatbotList: React.FC = () => {
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const chatbotService = new DataService<Chatbot>('chatbots');

  useEffect(() => {
    const fetchChatbots = async () => {
      try {
        const response = await chatbotService.getAll();
        setChatbots(response);
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
        Chatbot List
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Chatbot Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Base ID</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>LLM</TableCell>
              <TableCell>LLM Model</TableCell>
              <TableCell>LLM Temperature</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {chatbots.map((chatbot) => (
              <TableRow key={chatbot.chatbotId}>
                <TableCell>
                  <Link to={`/chatbots/${chatbot.chatbotId}`}>{chatbot.chatbotName}</Link>
                </TableCell>
                <TableCell>{chatbot.chatbotDescription}</TableCell>
                <TableCell>{chatbot.baseId}</TableCell>
                <TableCell>{new Date(chatbot.createdAt).toLocaleString()}</TableCell>
                <TableCell>{chatbot.llm}</TableCell>
                <TableCell>{chatbot.llmModel}</TableCell>
                <TableCell>{chatbot.llmTemperature}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default ChatbotList;