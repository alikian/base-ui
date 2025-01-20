import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Voicebot } from '../models';
import { DataService } from '../services/DataService';
import { Box, Typography, CircularProgress, Alert, TextField, Button } from '@mui/material';
import SessionControls from './SessionControls';
import AuthService from '../services/AuthService';

interface RouteParams extends Record<string, string > {
  voicebotId: string;
}


const fetchVoicebot = async (
    voicebotId: string,
    voicebotService: DataService<Voicebot>,
    setVoicebot: React.Dispatch<React.SetStateAction<Voicebot | null>>,
    setError: React.Dispatch<React.SetStateAction<string | null>>,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  try {
    const data = await voicebotService.get(voicebotId);
    setVoicebot(data);
  } catch (err) {
    console.error('Error fetching voicebot:', err);
    setError('Failed to fetch voicebot');
  } finally {
    setLoading(false);
  }
};

const VoicebotDetails: React.FC = () => {
  const { voicebotId } = useParams<RouteParams>();
  const [voicebot, setVoicebot] = useState<Voicebot | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [dataChannel, setDataChannel] = useState<RTCDataChannel | null>(null);

  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const audioElement = useRef<HTMLAudioElement | null>(null);
  const voicebotService = useRef(new DataService<Voicebot>('voicebots')).current;
  const authService = useRef(new AuthService()).current;

  const initializeAudioElement = useCallback(() => {
    const audio = document.createElement('audio');
    audio.autoplay = true;
    audioElement.current = audio;
  }, []);

  const initializePeerConnection = useCallback(async (EPHEMERAL_KEY: string, model: string) => {
    const pc = new RTCPeerConnection();
    initializeAudioElement();

    pc.ontrack = (e) => {
      if (audioElement.current) {
        audioElement.current.srcObject = e.streams[0];
      }
    };

    const localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    localStream.getTracks().forEach((track) => pc.addTrack(track));

    const dc = pc.createDataChannel('oai-events');
    setDataChannel(dc);

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    const sdpResponse = await fetch(`https://api.openai.com/v1/realtime?model=${model}`, {
      method: 'POST',
      body: offer.sdp,
      headers: {
        Authorization: `Bearer ${EPHEMERAL_KEY}`,
        'Content-Type': 'application/sdp',
      },
    });

    const answer: RTCSessionDescriptionInit = {
      type: 'answer',
      sdp: await sdpResponse.text(),
    };
    await pc.setRemoteDescription(answer);

    peerConnection.current = pc;
  }, [initializeAudioElement]);

  const startSession = useCallback(async () => {
    try {
      const headersData = await authService.getAuthHeaders();
      const tokenResponse = await fetch(
          `https://api.vectorsystem.net/voicebots/${voicebotId}/token`,
          {
            headers: headersData,
            method: 'POST',
          }
      );
      const { client_secret } = await tokenResponse.json();
      const EPHEMERAL_KEY = client_secret.value;

      if (voicebot) {
        await initializePeerConnection(EPHEMERAL_KEY, voicebot.llmModel);
      }
    } catch (err) {
      console.error('Failed to start session:', err);
    }
  }, [authService, voicebotId, voicebot, initializePeerConnection]);

  const stopSession = useCallback(() => {
    if (dataChannel) {
      dataChannel.close();
    }
    if (peerConnection.current) {
      peerConnection.current.close();
    }

    setIsSessionActive(false);
    setDataChannel(null);
    peerConnection.current = null;
  }, [dataChannel]);

  

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

  useEffect(() => {
    fetchVoicebot(voicebotId!, voicebotService, setVoicebot, setError, setLoading);
  }, [voicebotId, voicebotService]);

  useEffect(() => {
    if (dataChannel) {
      dataChannel.addEventListener('message', (e) => {
        console.log('dataChannel message:', typeof e);
        console.log('dataChannel message:', e.data);
      });

      dataChannel.addEventListener('open', () => {
        setIsSessionActive(true);

      });
    }
  }, [dataChannel]);

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
        <TextField
            label="Name"
            value={voicebot.voicebotName}
            onChange={(e) => setVoicebot({ ...voicebot, voicebotName: e.target.value })}
            fullWidth
            margin="normal"
            size="small"

        />
        <TextField
            label="LLM Model"
            value={voicebot.llmModel}
            onChange={(e) => setVoicebot({ ...voicebot, llmModel: e.target.value })}
            fullWidth
            margin="normal"
            // variant="filled"
            size="small"
        />
        <TextField
            label="LLM Temperature"
            type="number"
            value={voicebot.llmTemperature}
            onChange={(e) => setVoicebot({ ...voicebot, llmTemperature: Number(e.target.value) })}
            fullWidth
            margin="normal"
            size="small"

        />
        <TextField
            label="Max Tokens"
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

        />
        <TextField
            label="Voice"
            value={voicebot.voice}
            onChange={(e) => setVoicebot({ ...voicebot, voice: e.target.value })}
            fullWidth
            margin="normal"
            size="small"

        />
        <Button variant="contained" color="primary" onClick={handleSave}>
          Save
        </Button>
        <nav className="absolute top-0 left-0 right-0 h-16 flex items-center">
          <div className="flex items-center gap-4 w-full m-4 pb-2 border-0 border-b border-solid border-gray-200">
            <h3>Realtime Console</h3>
          </div>
        </nav>
        <SessionControls
            startSession={startSession}
            stopSession={stopSession}
            isSessionActive={isSessionActive}
        />
      </Box>
  );
};

export default VoicebotDetails;