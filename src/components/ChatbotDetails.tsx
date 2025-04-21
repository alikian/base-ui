import { useParams } from 'react-router-dom';
import { DataService } from '../services/DataService';
import React, { useEffect, useState, useRef } from 'react';
import { Chatbot, Conversation, MessageResponse, Message, Base } from '../models';
import { Box, Typography, TextField, Button, CircularProgress, Alert, Paper, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import ChatbotRunService from '../services/ChatbotRunService';

const ChatbotDetails: React.FC = () => {
  const { chatbotId } = useParams<{ chatbotId: string }>();
  const [chatbot, setChatbot] = useState<Chatbot | null>(null);
  const [updatedChatbot, setUpdatedChatbot] = useState<Partial<Chatbot>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const chatbotService = new DataService<Chatbot>('chatbots');
  const [models, setModels] = useState<string[]>([]);
  const [question, setQuestion] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loadingChat, setLoadingChat] = useState<boolean>(false);
  const conversationService = new DataService<Conversation>('conversations');
  const baseService = new DataService<Base>('bases');
  const [bases, setBases] = useState<Base[]>([]);
  const chatbotRunService = new ChatbotRunService(chatbotId!);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const llms =
    [{
      'llm': 'openai',
      'modeles': ['gpt-4o', 'gpt-4o-mini']
    },
    {
      'llm': 'anthropic',
      'modeles': ['claude-3-7-sonnet-latest', 'claude-3-5-haiku-latest']
    },
    {
      'llm': 'google',
      'modeles': ['gemini-2.0-flash', 'gemini-2.0-flash-lite']
    }
    ]
    ;

  useEffect(() => {
    const fetchChatbot = async () => {
      try {
        const bases = await baseService.getAll();
        setBases(bases);

        const chatbot = await chatbotService.get(chatbotId!);
        const newConversation: Conversation = {
          conversationId: '', // Generate or assign a unique ID
          createdAt: new Date().getTime(),
          chatbotId: chatbotId!,
          // Add other required properties if any
        };
        const convResult = await conversationService.create(newConversation);
        newConversation.conversationId = convResult.conversationId;
        setConversation(newConversation);
        setChatbot(chatbot);
        setUpdatedChatbot(chatbot); // Initialize updatedChatbot with fetched data

        let modelesFound = llms.find((llm) => llm.llm === chatbot.llm)?.modeles || [];
        setModels(modelesFound);
        handleChange('llmModel', modelesFound[0]);

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
        conversationId: conversation?.conversationId || '',
      };
      console.log('userMessage:', userMessage);
      setMessages((prevMessages) => [...prevMessages, userMessage]);

      const response: MessageResponse = await chatbotRunService.postMessage(userMessage);
      console.log('response:', response.text);

      const chatbotMessage: Message = {
        sender: 'chatbot',
        text: response.text,
        timestamp: Date.now(),
        conversationId: conversation?.conversationId || '',
      };
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

  const handleSave = async () => {
    try {
      if (chatbotId && updatedChatbot) {
        const updatedData = await chatbotService.update(chatbotId, updatedChatbot as Chatbot);
        setChatbot(updatedData);
        setError(null);
      }
    } catch (error) {
      console.error('Error updating chatbot:', error);
      setError('Failed to update chatbot');
    }
  };

  const handleChange = (field: keyof Chatbot, value: string | number) => {
    console.log('Updated field:', field, 'New value:', value);
    setUpdatedChatbot((prev) => ({ ...prev, [field]: value }));
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
    <>
      <Box
        sx={{
          display: 'flex', // Use flexbox to arrange child boxes side by side
          gap: 3, // Add spacing between the boxes
          mt: 3,
          width: '100%', // Ensure the parent box takes full width
        }}
      >
        {/* Left Box: Chatbot Details */}
        <Box
          sx={{
            flex: 1, // Allow the box to take equal space
            maxWidth: '50%', // Limit the width to 50% of the parent container
            backgroundColor: 'background.paper',
            p: 3,
            borderRadius: 2,
            boxShadow: 3,
          }}
        >
          <Typography variant="h4" gutterBottom>
            Chatbot Details
          </Typography>
          <>
            <TextField
              label="Name"
              value={updatedChatbot.chatbotName || ''}
              onChange={(e) => handleChange('chatbotName', e.target.value)}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Description"
              value={updatedChatbot.chatbotDescription || ''}
              onChange={(e) => handleChange('chatbotDescription', e.target.value)}
              fullWidth
              margin="normal"
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel id="base-select-label">Base</InputLabel>
              <Select
                labelId="base-select-label"
                value={updatedChatbot.baseId || ''}
                onChange={(e) => {
                  handleChange('baseId', e.target.value);
                }}
              >
                {bases.map((base) => (
                  <MenuItem key={base.baseId} value={base.baseId}>
                    {base.baseName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="aqPrompt"
              value={updatedChatbot.aqPrompt || ''}
              onChange={(e) => handleChange('aqPrompt', e.target.value)}
              multiline
              fullWidth
              margin="normal"
            />
            <TextField
              label="cqPrompt"
              value={updatedChatbot.cqPrompt || ''}
              onChange={(e) => handleChange('cqPrompt', e.target.value)}
              multiline
              fullWidth
              margin="normal"
            />

            <FormControl fullWidth margin="normal" required>
              <InputLabel id="llm-select-label">LLM</InputLabel>
              <Select
                labelId="llm-select-label"
                value={updatedChatbot.llm || ''}
                onChange={(e) => {
                  handleChange('llm', e.target.value);
                  let modelesFound = llms.find((llm) => llm.llm === e.target.value)?.modeles || [];
                  setModels(modelesFound);
                  handleChange('llmModel', modelesFound[0]);
                }}
              >
                {llms.map((llm) => (
                  <MenuItem key={llm.llm} value={llm.llm}>
                    {llm.llm}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal" required>
              <InputLabel id="llm-model-select-label">LLM Model</InputLabel>
              <Select
                labelId="llm-model-select-label"
                value={updatedChatbot.llmModel || ''}
                onChange={(e) => {
                  handleChange('llmModel', e.target.value);
                }}
              >
                {models.map((model) => (
                  <MenuItem key={model} value={model}>
                    {model}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="LLM Temperature"
              type="number"
              value={updatedChatbot.llmTemperature || ''}
              onChange={(e) => handleChange('llmTemperature', parseFloat(e.target.value))}
              fullWidth
              margin="normal"
            />
            <Button variant="contained" color="primary" onClick={handleSave} sx={{ mt: 2 }}>
              Save
            </Button>
          </>
        </Box>

        {/* Right Box: Conversation */}
        <Box
          sx={{
            flex: 1, // Allow the box to take equal space
            maxWidth: '50%', // Limit the width to 50% of the parent container
            backgroundColor: 'background.paper',
            p: 3,
            borderRadius: 2,
            boxShadow: 3,
          }}
        >
          <Box mt={4}>
            {loadingChat && <CircularProgress />}
            {error && <Alert severity="error">{error}</Alert>}
            <Box mt={2} ref={messagesEndRef}>
              <Typography variant="h6">Conversation:</Typography>
              {messages.map((message, index) => (
                <Paper
                  key={index}
                  style={{
                    padding: '10px',
                    margin: '10px 0',
                    backgroundColor: message.sender === 'user' ? '#e0f7fa' : '#f1f8e9',
                  }}
                >
                  <Typography variant="body2" color="textSecondary">
                    {message.sender === 'user' ? 'You' : 'Chatbot'} at{' '}
                    {new Date(message.timestamp).toLocaleTimeString()}
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
      </Box>
    </>
  );
};

export default ChatbotDetails;