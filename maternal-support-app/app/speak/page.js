"use client";
import React, { useState, useEffect, useRef } from "react";
import { Container, Box, Button, Typography, CircularProgress } from "@mui/material";
import MicIcon from '@mui/icons-material/Mic';
import CancelIcon from '@mui/icons-material/Cancel';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import Navbar from '../components/Navbar';

const SpeechRecognition = 
  typeof window !== "undefined" ? window.SpeechRecognition || window.webkitSpeechRecognition : null;

const goodbyeMessages = [
    "Thanks for chatting! Have a great day!",
    "Goodbye! Looking forward to our next conversation!",
    "Take care! Come back soon!",
    "It was nice talking to you! See you next time!",
    "Farewell! Have a wonderful day ahead!"
];

export default function SpeakPage() {
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [status, setStatus] = useState("Click on the mic to start recording");
    const [transcript, setTranscript] = useState("");
    
    const recognition = useRef(null);
    const synthesisRef = useRef(null);
    const silenceTimeoutRef = useRef(null);
    const isCancelledRef = useRef(false);
    const isRecognitionActiveRef = useRef(false);
    
    const speak = (text) => {
        if (synthesisRef.current) {
            const utterance = new SpeechSynthesisUtterance(text);
            synthesisRef.current.speak(utterance);
        }
    };

    const safelyStopRecognition = () => {
        if (recognition.current && isRecognitionActiveRef.current) {
            try {
                recognition.current.stop();
                isRecognitionActiveRef.current = false;
            } catch (error) {
                console.error("Error stopping recognition:", error);
            }
        }
    };

    const safelyStartRecognition = () => {
        if (recognition.current && !isRecognitionActiveRef.current && !isCancelledRef.current && !isPaused) {
            try {
                recognition.current.start();
                isRecognitionActiveRef.current = true;
                setStatus("Listening...");
            } catch (error) {
                console.error("Error starting recognition:", error);
                isRecognitionActiveRef.current = false;
            }
        }
    };

    // Initialize recognition and synthesis
    useEffect(() => {
        if (typeof window === "undefined") return;

        synthesisRef.current = window.speechSynthesis;
        
        if (!SpeechRecognition) return;

        const initializeRecognition = () => {
            if (recognition.current) {
                safelyStopRecognition();
            }

            recognition.current = new SpeechRecognition();
            recognition.current.continuous = true;
            recognition.current.interimResults = true;
            
            recognition.current.onresult = (event) => {
                if (!isCancelledRef.current && !isPaused) {
                    const current = event.resultIndex;
                    const transcriptText = event.results[current][0].transcript;
                    setTranscript(transcriptText);
                }
            };

            recognition.current.onerror = (event) => {
                console.error("Speech recognition error:", event.error);
                isRecognitionActiveRef.current = false;
                
                if (event.error === 'no-speech') {
                    safelyStartRecognition();
                } else if (event.error === 'network') {
                    setStatus("Network error. Attempting to reconnect...");
                    safelyStartRecognition();
                } else if (event.error !== 'aborted') {
                    setStatus("Error in speech recognition. Restarting...");
                    safelyStartRecognition();
                }
            };

            recognition.current.onend = () => {
                isRecognitionActiveRef.current = false;
                if (!isCancelledRef.current && !isPaused && isRecording) {
                    safelyStartRecognition();
                }
            };
        };

        initializeRecognition();
        
        return () => {
            safelyStopRecognition();
        };
    }, [isRecording, isPaused]);

    // Handle recognition state changes
    useEffect(() => {
        if (isRecording && !isPaused && recognition.current) {
            try {
                recognition.current.start();
            } catch (error) {
                console.error("Error starting recognition:", error);
            }
        } else if (recognition.current) {
            recognition.current.stop();
        }
    }, [isRecording, isPaused]);

    // Handle transcript processing
    useEffect(() => {
        if (isRecording && transcript && !isProcessing && !isCancelledRef.current) {
            if (silenceTimeoutRef.current) {
                clearTimeout(silenceTimeoutRef.current);
            }

            silenceTimeoutRef.current = setTimeout(async () => {
                if (transcript && !isCancelledRef.current) {
                    await processAndRespond(transcript);
                }
            }, 3000);
        }

        return () => {
            if (silenceTimeoutRef.current) {
                clearTimeout(silenceTimeoutRef.current);
            }
        };
    }, [transcript, isRecording, isProcessing]);

    
    const processAndRespond = async (text) => {
        if (isCancelledRef.current) return;
        
        try {
            setIsProcessing(true);
            setStatus("Processing your message...");
            
            safelyStopRecognition();

            const response = await fetch("/api/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "text/plain",
                },
                body: text,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.response && synthesisRef.current && !isCancelledRef.current) {
                setStatus("Responding...");
                const utterance = new SpeechSynthesisUtterance(data.response);
                
                utterance.onend = () => {
                    if (!isCancelledRef.current) {
                        setIsProcessing(false);
                        setStatus("Listening...");
                        setTranscript("");
                        
                        if (isRecording && !isPaused) {
                            safelyStartRecognition();
                        }
                    }
                };

                utterance.onerror = (error) => {
                    console.error("Speech synthesis error:", error);
                    setStatus("Error in speech synthesis. Please try again.");
                    setIsProcessing(false);
                    
                    if (isRecording && !isPaused) {
                        safelyStartRecognition();
                    }
                };

                synthesisRef.current.speak(utterance);
            }
        } catch (error) {
            console.error("Error processing response:", error);
            setStatus("Error occurred. Please try again.");
            setIsProcessing(false);
            
            if (isRecording && !isPaused) {
                safelyStartRecognition();
            }
        }
    };


    const startRecording = () => {
        if (!recognition.current) {
            setStatus("Speech recognition is not supported in this browser.");
            return;
        }

        isCancelledRef.current = false;
        setIsPaused(false);
        setIsRecording(true);
        const newStatus = "Listening...";
        setStatus(newStatus);
        speak(newStatus);
        setTranscript("");

        safelyStartRecognition();
    };
    
    const pauseRecording = () => {
        setIsPaused(true);
        safelyStopRecognition();
        const newStatus = "Recording paused";
        setStatus(newStatus);
        speak(newStatus);
    };

    const resumeRecording = () => {
        setIsPaused(false);
        const newStatus = "Listening...";
        setStatus(newStatus);
        speak(newStatus);
        safelyStartRecognition();
    };

    const stopRecording = () => {
        isCancelledRef.current = true;
        safelyStopRecognition();
        
        if (synthesisRef.current) {
            synthesisRef.current.cancel();
        }
        if (silenceTimeoutRef.current) {
            clearTimeout(silenceTimeoutRef.current);
        }
        
        setIsRecording(false);
        setIsPaused(false);
        setIsProcessing(false);

        const goodbyeMessage = goodbyeMessages[Math.floor(Math.random() * goodbyeMessages.length)];
        speak(goodbyeMessage);
        
        setStatus("Click on the mic to start recording");
        setTranscript("");
    };

    return (
        <Container
            maxWidth="100vw"
            sx={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#E6E6FA",
            }}
        >
            <Navbar />
            
            <Box
                sx={{
                    maxWidth: "800px",
                    width: "80%",
                    margin: "auto",
                    padding: "40px",
                    borderRadius: "15px",
                    backgroundColor: "#ffffff",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "60px",
                    minHeight: "60vh",
                }}
            >
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
                <Box
                    sx={{
                        position: 'relative',
                        borderRadius: "15px",
                        border: "1px solid black",
                        width: "80%",
                        height: "70px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#E6E6FA",
                        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                    }}
                >
                    <Typography variant="body1" sx={{ color: "black" }}>
                        {status}
                    </Typography>
                    {isProcessing && (
                        <CircularProgress
                            size={20}
                            sx={{
                                position: 'absolute',
                                right: '20px'
                            }}
                        />
                    )}
                </Box>
                <Box
                    sx={{
                        display: 'flex',
                        gap: '20px',
                        alignItems: 'center'
                    }}
                >
                    {!isRecording ? (
                        <Box
                            sx={{
                                width: 100,
                                height: 100,
                                backgroundColor: "#D87093",
                                borderRadius: "50%",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                cursor: "pointer",
                                transition: "background-color 0.3s ease"
                            }}
                        >
                            <Button
                                disabled={isProcessing}
                                onClick={startRecording}
                                sx={{
                                    padding: "20px",
                                    fontWeight: "bold",
                                    textTransform: "none",
                                    borderRadius: "50%",
                                    width: "100%",
                                    height: "100%",
                                    '&:disabled': {
                                        opacity: 0.7,
                                        cursor: 'not-allowed'
                                    }
                                }}
                            >
                                <MicIcon sx={{ fontSize: 40, color: "black" }} />
                            </Button>
                        </Box>
                    ) : (
                        <>
                            <Box
                                sx={{
                                    width: 100,
                                    height: 100,
                                    backgroundColor: "#4682B4",
                                    borderRadius: "50%",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    cursor: "pointer",
                                }}
                            >
                                <Button
                                    disabled={isProcessing}
                                    onClick={stopRecording}
                                    sx={{
                                        padding: "20px",
                                        fontWeight: "bold",
                                        textTransform: "none",
                                        borderRadius: "50%",
                                        width: "100%",
                                        height: "100%",
                                        '&:disabled': {
                                            opacity: 0.7,
                                            cursor: 'not-allowed'
                                        }
                                    }}
                                >
                                    <CancelIcon sx={{ fontSize: 40, color: "black" }} />
                                </Button>
                            </Box>
                            <Box
                                sx={{
                                    width: 100,
                                    height: 100,
                                    backgroundColor: isPaused ? "#90EE90" : "#FFB6C1",
                                    borderRadius: "50%",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    cursor: "pointer",
                                }}
                            >
                                <Button
                                    disabled={isProcessing}
                                    onClick={isPaused ? resumeRecording : pauseRecording}
                                    sx={{
                                        padding: "20px",
                                        fontWeight: "bold",
                                        textTransform: "none",
                                        borderRadius: "50%",
                                        width: "100%",
                                        height: "100%",
                                        '&:disabled': {
                                            opacity: 0.7,
                                            cursor: 'not-allowed'
                                        }
                                    }}
                                >
                                    {isPaused ? (
                                        <PlayArrowIcon sx={{ fontSize: 40, color: "black" }} />
                                    ) : (
                                        <PauseIcon sx={{ fontSize: 40, color: "black" }} />
                                    )}
                                </Button>
                            </Box>
                        </>
                    )}
                </Box>
            </Box>
        </Container>
    );
}