"use client";
import { Container, Box, Typography, Button, CircularProgress, Dialog, DialogTitle, DialogContent, List, ListItem, ListItemText, IconButton, Tooltip } from "@mui/material";
import MicIcon from '@mui/icons-material/Mic';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import StopIcon from '@mui/icons-material/Stop';
import HistoryIcon from '@mui/icons-material/History';
import CloseIcon from '@mui/icons-material/Close';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import Navbar from '../components/Navbar';
import { useState, useEffect } from 'react';

export default function SpeakPage() {
    const [status, setStatus] = useState("Click the microphone to start speaking");
    const [isProcessing, setIsProcessing] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [audioChunks, setAudioChunks] = useState([]);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [messageHistory, setMessageHistory] = useState([]);

    useEffect(() => {
        // Cleanup function
        return () => {
            if (mediaRecorder && mediaRecorder.state !== 'inactive') {
                mediaRecorder.stop();
            }
        };
    }, [mediaRecorder]);

    useEffect(() => {
        // Load message history from localStorage on component mount
        const savedHistory = localStorage.getItem('voiceMessageHistory');
        if (savedHistory) {
            setMessageHistory(JSON.parse(savedHistory));
        }
    }, []);

    const saveToHistory = (blob, timestamp) => {
        const newMessage = {
            id: Date.now(),
            timestamp: timestamp || new Date().toISOString(),
            audioUrl: URL.createObjectURL(blob),
            duration: '00:00' // You could calculate actual duration if needed
        };

        const updatedHistory = [newMessage, ...messageHistory].slice(0, 50); // Keep last 50 messages
        setMessageHistory(updatedHistory);
        localStorage.setItem('voiceMessageHistory', JSON.stringify(updatedHistory));
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunks.push(e.data);
                }
            };

            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/wav' });
                setAudioBlob(blob);
                setAudioChunks(chunks);
                setIsProcessing(true);
                setStatus("Processing your message...");
                // Here you would typically send the blob to your API
                processAudioMessage(blob);
            };

            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
            setStatus("Recording... Click stop when finished");
            setAudioBlob(null);

        } catch (error) {
            console.error('Error accessing microphone:', error);
            setStatus("Error accessing microphone. Please check permissions.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);
        }
    };

    const processAudioMessage = async (blob) => {
        try {
            const formData = new FormData();
            formData.append('audio', blob, 'recording.wav');
            
            const response = await fetch('/api/process-audio', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to process audio');
            }

            const data = await response.json();
            saveToHistory(blob);
            setStatus("Message processed! Click listen to hear the response.");
            setIsProcessing(false);

        } catch (error) {
            console.error('Error processing audio:', error);
            setStatus("Error processing your message. Please try again.");
            setIsProcessing(false);
        }
    };

    const playResponse = () => {
        // Implement playback functionality here
        setStatus("Playing response...");
        // Example: play audio from response
    };

    const playHistoryMessage = (audioUrl) => {
        const audio = new Audio(audioUrl);
        audio.play();
    };

    const HistoryDialog = () => (
        <Dialog 
            open={isHistoryOpen} 
            onClose={() => setIsHistoryOpen(false)}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                bgcolor: '#4682B4',
                color: 'white'
            }}>
                <Typography 
                    component="div"
                    sx={{ 
                        fontSize: '1.25rem',
                        fontWeight: 'bold'
                    }}
                >
                    Voice Message History
                </Typography>
                <IconButton 
                    onClick={() => setIsHistoryOpen(false)}
                    sx={{ color: 'white' }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
                {messageHistory.length === 0 ? (
                    <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                        No voice messages yet
                    </Typography>
                ) : (
                    <List>
                        {messageHistory.map((message) => (
                            <ListItem 
                                key={message.id}
                                secondaryAction={
                                    <IconButton 
                                        edge="end" 
                                        onClick={() => playHistoryMessage(message.audioUrl)}
                                        sx={{ color: '#4682B4' }}
                                    >
                                        <PlayArrowIcon />
                                    </IconButton>
                                }
                                sx={{
                                    bgcolor: 'rgba(70, 130, 180, 0.1)',
                                    borderRadius: '8px',
                                    mb: 1,
                                    '&:hover': {
                                        bgcolor: 'rgba(70, 130, 180, 0.2)',
                                    }
                                }}
                            >
                                <ListItemText
                                    primary={new Date(message.timestamp).toLocaleString()}
                                    secondary={`Duration: ${message.duration}`}
                                />
                            </ListItem>
                        ))}
                    </List>
                )}
            </DialogContent>
        </Dialog>
    );

    return (
        <Container maxWidth="100vw" sx={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            background: "linear-gradient(135deg, #E6E6FA 0%, #F8F9FA 100%)",
            position: "relative",
            pt: 12,
            overflow: "hidden",
        }}>
            <Navbar />
            <HistoryDialog />
            
            {/* Background Pattern */}
            <Box sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                opacity: 0.1,
                background: "radial-gradient(circle at 25px 25px, #4682B4 2%, transparent 0%), radial-gradient(circle at 75px 75px, #D87093 2%, transparent 0%)",
                backgroundSize: "100px 100px",
                zIndex: 0,
            }} />

            {/* History Button - Moved after background pattern and updated styles */}
            <Box
                sx={{
                    position: 'fixed',
                    right: 24,
                    bottom: 24,
                    zIndex: 10, // Increased z-index to ensure it's above other elements
                }}
            >
                <Tooltip title="View Message History">
                    <IconButton
                        onClick={() => setIsHistoryOpen(true)}
                        sx={{
                            backgroundColor: '#4682B4',
                            color: 'white',
                            '&:hover': {
                                backgroundColor: '#D87093',
                            },
                            width: 56,
                            height: 56,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            cursor: 'pointer', // Explicitly set cursor
                        }}
                    >
                        <HistoryIcon />
                    </IconButton>
                </Tooltip>
            </Box>

            {/* Main content box */}
            <Box sx={{
                maxWidth: "800px",
                width: "90%",
                margin: "auto",
                padding: { xs: "20px", sm: "40px" },
                borderRadius: "24px",
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(10px)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "40px",
                position: "relative",
                zIndex: 1,
            }}>
                <Typography 
                    variant="h1"
                    sx={{
                        fontWeight: "bold",
                        color: "#4682B4",
                        mb: 2,
                        fontSize: { xs: '2rem', sm: '2.5rem' },
                    }}
                >
                    Voice Chat Support
                </Typography>

                <Box sx={{
                    position: 'relative',
                    width: "100%",
                    p: 3,
                    borderRadius: "15px",
                    backgroundColor: "#F8F9FA",
                    border: "1px solid rgba(70, 130, 180, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "70px",
                }}>
                    <Typography variant="body1" sx={{ 
                        color: isProcessing ? "#4682B4" : "#666",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                    }}>
                        {status}
                        {isProcessing && <CircularProgress size={20} sx={{ ml: 2 }} />}
                    </Typography>
                </Box>

                <Box sx={{
                    display: "flex",
                    gap: 4,
                    justifyContent: "center",
                    flexWrap: "wrap",
                }}>
                    <Button
                        onClick={isRecording ? stopRecording : startRecording}
                        disabled={isProcessing}
                        sx={{
                            width: 120,
                            height: 120,
                            borderRadius: "50%",
                            backgroundColor: isRecording ? "#ff4444" : "#D87093",
                            transition: "all 0.3s ease",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 1,
                            '&:hover': {
                                backgroundColor: isRecording ? "#ff6666" : "#4682B4",
                                transform: "scale(1.05)",
                                boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
                            },
                            '&:disabled': {
                                backgroundColor: "#cccccc",
                            }
                        }}
                    >
                        {isRecording ? (
                            <StopIcon sx={{ fontSize: 40, color: "white" }} />
                        ) : (
                            <MicIcon sx={{ fontSize: 40, color: "white" }} />
                        )}
                        <Typography sx={{ color: "white", fontSize: "0.9rem" }}>
                            {isRecording ? "Stop" : "Speak"}
                        </Typography>
                    </Button>

                    <Button
                        onClick={playResponse}
                        disabled={isRecording || isProcessing || !audioBlob}
                        sx={{
                            width: 120,
                            height: 120,
                            borderRadius: "50%",
                            backgroundColor: "#4682B4",
                            transition: "all 0.3s ease",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 1,
                            '&:hover': {
                                backgroundColor: "#D87093",
                                transform: "scale(1.05)",
                                boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
                            },
                            '&:disabled': {
                                backgroundColor: "#cccccc",
                            }
                        }}
                    >
                        <VolumeUpIcon sx={{ fontSize: 40, color: "white" }} />
                        <Typography sx={{ color: "white", fontSize: "0.9rem" }}>
                            Listen
                        </Typography>
                    </Button>
                </Box>

                <Typography variant="body2" sx={{ color: "#666", maxWidth: "600px" }}>
                    Click the microphone button to start speaking. Your voice will be processed and you'll receive a response that can be played back using the listen button.
                </Typography>
            </Box>
        </Container>
    );
}