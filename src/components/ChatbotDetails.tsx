import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Chatbot, Conversation, MessageResponse, Message } from '../models';
import { DataService } from '../services/DataService';
import { Box, Typography, TextField, Button, CircularProgress, Alert } from '@mui/material';
import ChatbotRunService from '../services/ChatbotRunService';



const ChatbotDetails: React.FC = () => {
  const { chatbotId } = useParams<{ chatbotId: string }>();
  const [chatbot, setChatbot] = useState<Chatbot | null>(null);
  const [question, setQuestion] = useState<string>('');
  const [response, setResponse] = useState<string>('');
  const [conversation, setConversation] = useState<Conversation |  null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingChat, setLoadingChat] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const chatbotService = new DataService<Chatbot>('chatbots');
  const conversationService = new DataService<Conversation>('conversations');
  const chatbotRunService = new ChatbotRunService(chatbotId!)

  useEffect(() => {
    const fetchChatbot = async () => {
      console.log('chatbotId:', chatbotId);
      try {
        const data = await chatbotService.get(chatbotId!);
        const newConversation: Conversation = {
          conversationId: '', // Generate or assign a unique ID
          createdAt: new Date().getTime(),
          chatbotId: chatbotId!,
          // Add other required properties if any
        };
        const convResult = await conversationService.create(newConversation);
        newConversation.conversationId = convResult.conversationId;
        setConversation(newConversation);
        setChatbot(data);
      } catch (error) {
        console.error('Error fetching chatbot:', error);
        setError('Failed to fetch chatbot');
      } finally {
        setLoading(false);
      }
    };

    fetchChatbot();
  }, [chatbotId]);

  const handleAskQuestion = async () => {
    setLoadingChat(true);
    setError(null);
    try {
      const message: Message = { text: question, conversationId: conversation?.conversationId || '' };
      const response: MessageResponse = await chatbotRunService.postMessage(message);
      setResponse(response.text);
    } catch (error) {
      console.error('Error asking question:', error);
      setError('Failed to get response');
    } finally {
      setLoadingChat(false);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!chatbot) {
    return <Alert severity="error">Chatbot not found</Alert>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Chatbot Details
      </Typography>
      <Typography variant="body1"><strong>Base ID:</strong> {chatbot.baseId}</Typography>
      <Typography variant="body1"><strong>Name:</strong> {chatbot.chatbotName}</Typography>
      <Typography variant="body1"><strong>Description:</strong> {chatbot.chatbotDescription}</Typography>
      <Typography variant="body1"><strong>Created At:</strong> {new Date(chatbot.createdAt).toLocaleString()}</Typography>
      <Typography variant="body1"><strong>aqPrompt:</strong> {chatbot.aqPrompt}</Typography>
      <Typography variant="body1"><strong>cqPrompt:</strong> {chatbot.cqPrompt}</Typography>
      <Typography variant="body1"><strong>LLM:</strong> {chatbot.llm}</Typography>
      <Typography variant="body1"><strong>LLM Model:</strong> {chatbot.llmModel}</Typography>
      <Typography variant="body1"><strong>LLM Temperature:</strong> {chatbot.llmTemperature}</Typography>

      <Typography variant="body1"><strong>Conversation Id:</strong> {conversation?.conversationId}</Typography>

      <Box mt={4}>
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
        <Button variant="contained" color="primary" onClick={handleAskQuestion} disabled={loadingChat}>
          Ask
        </Button>
        {loadingChat && <CircularProgress />}
        {loading && <CircularProgress />}
        {error && <Alert severity="error">{error}</Alert>}
        {response && (
          <Box mt={2}>
            <Typography variant="h6">Response:</Typography>
            <Typography variant="body1">{response}</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ChatbotDetails;