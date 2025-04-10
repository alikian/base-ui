import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Voicebot, Base } from '../models';
import { DataService } from '../services/DataService';
import { Box, Typography, Alert, TextField, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { Checkbox, FormControlLabel } from '@mui/material';
interface RouteParams extends Record<string, string> {
  voicebotId: string;
}


const VoicebotDetails: React.FC = () => {
  const [voicebot, setVoicebot] = useState<Voicebot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const voicebotService = useRef(new DataService<Voicebot>('voicebots')).current;
  const [loading, setLoading] = useState<boolean>(true);
  const { voicebotId } = useParams<RouteParams>();
  const [bases, setBases] = useState<Base[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const llms = [
    {
      'provider': 'UltraVox',
      'modeles': ['fixie-ai/ultravox'],
      'voices': ['David-English-British', 'Alex-Spanish', 'Tanya-English']
    },
    {
      'provider': 'OpenAI',
      'modeles': ['gpt-4o-realtime-preview', 'gpt-4o-mini-realtime-preview'],
      'voices': ['alloy', 'ash', 'ballad', 'coral', 'echo', 'sage', 'shimmer', 'verse']
    },
  ]

  useEffect(() => {
    const fetchVoicebot = async (
      voicebotId: string,
      voicebotService: DataService<Voicebot>,
      setVoicebot: React.Dispatch<React.SetStateAction<Voicebot | null>>,
      setError: React.Dispatch<React.SetStateAction<string | null>>,
      setLoading: React.Dispatch<React.SetStateAction<boolean>>
    ) => {
      try {
        const baseService = new DataService<Base>('bases');
        const data = await voicebotService.get(voicebotId);
        let modelesFound = llms.find((llm) => llm.provider === data.provider)?.modeles || [];
        setModels(modelesFound);

        setVoicebot(data);
        const bases = await baseService.getAll();
        setBases(bases);

      } catch (err) {
        console.error('Error fetching voicebot:', err);
        setError('Failed to fetch voicebot');
      } finally {
        setLoading(false);
      }
    };

    fetchVoicebot(voicebotId!, voicebotService, setVoicebot, setError, setLoading);
  }, [voicebotId, voicebotService]);

  const handleSave = async () => {
    if (voicebot) {
      try {
        await voicebotService.update(voicebotId!, voicebot);
        // alert('Voicebot details saved successfully');
      } catch (err) {
        console.error('Failed to save voicebot details:', err);
        // alert('Failed to save voicebot details');
      }
    }
  };

  if (loading) {
    return <Alert severity="info">Loading...</Alert>;
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
      <TextField
        label="Name"
        value={voicebot.name}
        onChange={(e) => setVoicebot({ ...voicebot, name: e.target.value })}
        fullWidth
        margin="normal"
        size="small"
      />
      <FormControl fullWidth margin="normal" required>
        <InputLabel id="base-select-label">Base</InputLabel>
        <Select
          labelId="base-select-label"
          value={voicebot.baseId || ''}
          onChange={(e) => setVoicebot({ ...voicebot, baseId: e.target.value })}
        >
          {bases.map((base) => (
            <MenuItem key={base.baseId} value={base.baseId}>
              {base.baseName}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth margin="normal" size="small">
        <InputLabel>Provider</InputLabel>
        <Select
          value={voicebot.provider || ''}
          onChange={(e) => {
            const selectedProvider = e.target.value;
            // console.log('provider change', selectedProvider);

            // Find the models for the selected provider
            const modelesFound = llms.find((llm) => llm.provider === selectedProvider)?.modeles || [];
            // console.log('modelesFound', modelesFound);

            // Update both provider and model in a single state update
            setVoicebot((prev) => {
              if (!prev) return prev; // Ensure prev is not null
              return {
                ...prev,
                provider: selectedProvider,
                model: modelesFound[0] || '', // Set the first model or an empty string
              };
            });

            // Update the models state
            setModels(modelesFound);
          }}
        >
          {llms.map((llm) => (
            <MenuItem key={llm.provider} value={llm.provider}>
              {llm.provider}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth margin="normal" size="small">
        <InputLabel>Model</InputLabel>
        <Select
          value={voicebot.model}
          onChange={(e) => setVoicebot({ ...voicebot, model: e.target.value })}
        >
          {models.map((model) => (
            <MenuItem key={model} value={model}>
              {model}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        label="Voice"
        value={voicebot.voice}
        onChange={(e) => setVoicebot({ ...voicebot, voice: e.target.value })}
        fullWidth
        margin="normal"
        size="small"
      />
      <TextField
        label="Temperature"
        type="number"
        value={voicebot.temperature}
        onChange={(e) => setVoicebot({ ...voicebot, temperature: Number(e.target.value) })}
        fullWidth
        margin="normal"
        size="small"
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={voicebot.recordingEnabled}
            onChange={(e) => setVoicebot({ ...voicebot, recordingEnabled: e.target.checked })}
          />
        }
        label="Recording Enabled"
      />
      <TextField
        label="Max Tokens"
        type="number"
        value={voicebot.maxTokens}
        onChange={(e) => setVoicebot({ ...voicebot, maxTokens: Number(e.target.value) })}
        fullWidth
        margin="normal"
        size="small"
      />
      <TextField
        label="Instruction"
        value={voicebot.instructions}
        onChange={(e) => setVoicebot({ ...voicebot, instructions: e.target.value })}
        fullWidth
        margin="normal"
        size="small"
        multiline
      />
      <TextField
        label="First Prompt"
        value={voicebot.firstPrompt}
        onChange={(e) => setVoicebot({ ...voicebot, firstPrompt: e.target.value })}
        fullWidth
        margin="normal"
        size="small"

      />
      <TextField
        label="Phone"
        value={voicebot.phone}
        onChange={(e) => setVoicebot({ ...voicebot, phone: e.target.value })}
        fullWidth
        margin="normal"
        size="small"
      />
      <TextField
        label="Api Key"
        value={voicebot.apiKey}
        onChange={(e) => setVoicebot({ ...voicebot, apiKey: e.target.value })}
        fullWidth
        margin="normal"
        size="small"
      />
      <Button variant="contained" color="primary" onClick={handleSave}>
        Save
      </Button>
    </Box>
  );
};

export default VoicebotDetails;