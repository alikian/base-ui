import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Chatbot, Conversation, MessageResponse, Message } from '../models';
import { DataService } from '../services/DataService';
import { Box, Typography, TextField, Button, CircularProgress, Alert, Paper } from '@mui/material';
import ChatbotRunService from '../services/ChatbotRunService';

const ChatbotDetails: React.FC = () => {
  const { chatbotId } = useParams<{ chatbotId: string }>();
  const [chatbot, setChatbot] = useState<Chatbot | null>(null);
  const [question, setQuestion] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingChat, setLoadingChat] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const chatbotService = new DataService<Chatbot>('chatbots');
  const conversationService = new DataService<Conversation>('conversations');
  const chatbotRunService = new ChatbotRunService(chatbotId!);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      const userMessage: Message = {
        text: question,
        sender: 'user',
        timestamp: new Date().getTime(),
        conversationId: conversation?.conversationId || ''
      };
      console.log('userMessage:', userMessage);
      setMessages((prevMessages) => [...prevMessages, userMessage]);

      const response: MessageResponse = await chatbotRunService.postMessage(userMessage);
      console.log('response:', response.text);

      const chatbotMessage: Message = { sender: 'chatbot', text: response.text, timestamp: Date.now(), conversationId: conversation?.conversationId || '' };
      setMessages((prevMessages) => [...prevMessages, chatbotMessage]);
      console.log('chatbotMessage:', chatbotMessage);

      setQuestion('');
      scrollToTop();
    } catch (error) {
      console.error('Error asking question:', error);
      setError('Failed to get response');
    } finally {
      setLoadingChat(false);
    }
  };

  const scrollToTop = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = 0;
    }
  };

  useEffect(() => {
    scrollToTop();
  }, [messages]);

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
        {loadingChat && <CircularProgress />}
        {error && <Alert severity="error">{error}</Alert>}
        <Box mt={2}  ref={messagesEndRef}>
          <Typography variant="h6">Conversation:</Typography>
          {messages.map((message, index) => (
            <Paper key={index} style={{ padding: '10px', margin: '10px 0', backgroundColor: message.sender === 'user' ? '#e0f7fa' : '#f1f8e9' }}>
              <Typography variant="body2" color="textSecondary">
                {message.sender === 'user' ? 'You' : 'Chatbot'} at {new Date(message.timestamp).toLocaleTimeString()}
              </Typography>
              <Typography variant="body1">{message.text}</Typography>
            </Paper>
          ))}
        </Box>
      </Box>
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
    </Box>
  );
};

export default ChatbotDetails;