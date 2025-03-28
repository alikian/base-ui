import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Alert, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { DataService } from '../services/DataService';
import { Voicebot } from '../models'; // Assume Voicebot is defined in your models

interface AddVoiceBotProps {
  onAddVoiceBot: (newVoiceBot: Voicebot) => void;
}

const AddVoiceBot: React.FC<AddVoiceBotProps> = ({ onAddVoiceBot }) => {
  const [voicebotId, setVoicebotId] = useState<string>(''); // Hidden field
  const [name, setName] = useState<string>(''); // Name of the voice bot
  const [provider, setProvider] = useState<string>(''); // Provider of the voice bot
  const [model, setModel] = useState<string>(''); // Model used by the voice bot
  const [phone, setPhone] = useState<string>(''); // Phone number for the voice bot
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const voicebotService = new DataService<Voicebot>('voicebots');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const voicebotData: Voicebot = {
      voicebotId,
      name,
      provider,
      model,
      createdAt: Date.now(), // Add a timestamp for creation
      temperature: 0, // Default value
      instructions: '', // Default value
      firstPrompt: '', // Default value
      maxTokens: 0, // Default value
      voice: '', // Default value
      phone, // Default value
      apiKey: '', // Default value
      recordingEnabled: false, // Default value
    };

    try {
      const newVoiceBot = await voicebotService.create(voicebotData);
      onAddVoiceBot(newVoiceBot);
      setSuccess('Voice bot created successfully!');
      setVoicebotId('');
      setName('');
      setProvider('');
      setModel('');
      setPhone('');
    } catch (error) {
      console.error('Error creating voice bot:', error);
      setError('Failed to create voice bot');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ p: 2 }}>
        Add New Voice Bot
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
      {/* Hidden field for voicebotId */}
      <TextField
        type="hidden"
        value={voicebotId}
        onChange={(e) => setVoicebotId(e.target.value)}
      />
      <TextField
        label="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        fullWidth
        margin="normal"
        required
      />
      <FormControl fullWidth margin="normal" required>
        <InputLabel>Provider</InputLabel>
        <Select
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
        >
          <MenuItem value="OpenAI">OpenAI</MenuItem>
          <MenuItem value="UltraVox">UltraVox</MenuItem>
        </Select>
      </FormControl>
      <FormControl fullWidth margin="normal" required>
        <InputLabel>Model</InputLabel>
        <Select
          value={model}
          onChange={(e) => setModel(e.target.value)}
        >
          <MenuItem value="fixie-ai/ultravox">fixie-ai/ultravox</MenuItem>
          <MenuItem value="gpt-4o-realtime-preview">gpt-4o-realtime-preview</MenuItem>
          <MenuItem value="gpt-4o-mini-realtime-preview">gpt-4o-mini-realtime-preview</MenuItem>
        </Select>
      </FormControl>
      <TextField
        label="Phone Number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        fullWidth
        margin="normal"
        required
      />
      <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
        Add Voice Bot
      </Button>
    </Box>
  );
};

export default AddVoiceBot;