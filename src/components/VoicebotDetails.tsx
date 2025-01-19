import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Voicebot} from '../models';
import { DataService } from '../services/DataService';
import { Box, Typography, TextField, CircularProgress, Alert } from '@mui/material';

const ChatbotDetails: React.FC = () => {
  const { voicebotId } = useParams<{ voicebotId: string }>();
  const [voicebot, setChatbot] = useState<Voicebot | null>(null);
  const [question, setQuestion] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const chatbotService = new DataService<Voicebot>('chatbots');

  useEffect(() => {
    const fetchChatbot = async () => {
      console.log('voicebotId:', voicebotId);
      try {
        const data = await chatbotService.get(voicebotId!);
        setChatbot(data);
      } catch (error) {
        console.error('Error fetching chatbot:', error);
        setError('Failed to fetch chatbot');
      } finally {
        setLoading(false);
      }
    };

    fetchChatbot();
  }, [voicebotId]);




  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!voicebot) {
    return <Alert severity="error">Voicebot not found</Alert>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Voicebot Details
      </Typography>
      <Typography variant="body1"><strong>Name:</strong> {voicebot.voicebotName}</Typography>
      <Typography variant="body1"><strong>Description:</strong> {voicebot.voicebotDescription}</Typography>
      <Typography variant="body1"><strong>Created At:</strong> {new Date(voicebot.createdAt).toLocaleString()}</Typography>
      <Typography variant="body1"><strong>LLM:</strong> {voicebot.llm}</Typography>
      <Typography variant="body1"><strong>LLM Model:</strong> {voicebot.llmModel}</Typography>
      <Typography variant="body1"><strong>LLM Temperature:</strong> {voicebot.llmTemperature}</Typography>
      <Typography variant="body1"><strong>Instuction:</strong> {voicebot.llmTemperature}</Typography>


      <Typography variant="h5" gutterBottom>
          Ask a Question
        </Typography>
        <TextField
          label="Question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          fullWidth
          margin="normal"
        />
    </Box>
  );
};

export default ChatbotDetails;