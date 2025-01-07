"use client";
import React, { useState, useEffect, useRef } from "react";
import { Container, Box, Button, Typography, CircularProgress } from "@mui/material";
import MicIcon from '@mui/icons-material/Mic';
import CancelIcon from '@mui/icons-material/Cancel';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import WavesIcon from '@mui/icons-material/Waves';
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
    const [isRecognitionActive, setIsRecognitionActive] = useState(false);
    const [lastTranscriptTime, setLastTranscriptTime] = useState(Date.now());
    const SILENCE_CHECK_THRESHOLD = 20000; 
    const INACTIVITY_MESSAGES = [
        "Are you still there? I'm here to help if you need anything.",
        "Just checking if you're still with me. Let me know if you have any questions.",
        "I notice you've been quiet. Would you like to continue our conversation?",
        "I'm still here to support you. Feel free to ask any questions when you're ready."
    ];
    
    const lastInteractionRef = useRef(Date.now());
    const inactivityCheckRef = useRef(null);
    const recognition = useRef(null);
    const synthesisRef = useRef(null);
    const silenceTimeoutRef = useRef(null);
    const isCancelledRef = useRef(false);
    const isRecognitionActiveRef = useRef(false);
    const [pausedTranscript, setPausedTranscript] = useState("");
    
    const [isInConversation, setIsInConversation] = useState(false);
    const [lastResponseTime, setLastResponseTime] = useState(null);
    const MIN_SILENCE_FOR_CHECK = 10000;

    const speak = (text) => {
        if (synthesisRef.current) {
            // Cancel any ongoing speech
            synthesisRef.current.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            
            utterance.onend = () => {
                // Reset interaction timer after speaking
                lastInteractionRef.current = Date.now();
                
                // Restart recognition if needed
                if (isRecording && !isPaused && !isProcessing) {
                    safelyStartRecognition();
                }
            };

            synthesisRef.current.speak(utterance);
        }
    };

    // Silence checker handler

    const handleSilenceCheck = () => {
        if (!isPaused && isRecording && !isProcessing && !isCurrentlySpeaking()) {
            const timeSinceLastInteraction = Date.now() - lastInteractionRef.current;
            const timeSinceLastResponse = lastResponseTime ? Date.now() - lastResponseTime : Infinity;
    
            if (!isInConversation && 
                timeSinceLastResponse > MIN_SILENCE_FOR_CHECK && 
                timeSinceLastInteraction >= SILENCE_CHECK_THRESHOLD) {
                
                const checkMessage = INACTIVITY_MESSAGES[Math.floor(Math.random() * INACTIVITY_MESSAGES.length)];
                setStatus("Checking in...");
                
                // Stop recognition before speaking
                safelyStopRecognition();
                cancelOngoingSpeech();
                
                const utterance = new SpeechSynthesisUtterance(checkMessage);
                utterance.onend = () => {
                    setLastResponseTime(Date.now());
                    if (!isPaused && isRecording) {
                        setTimeout(() => {
                            safelyStartRecognition();
                        }, 1000);
                    }
                };
                
                synthesisRef.current.speak(utterance);
                lastInteractionRef.current = Date.now();
            }
        }
    };

    const cancelOngoingSpeech = () => {
        if (synthesisRef.current) {
            synthesisRef.current.cancel();
        }
    };
    
    const isCurrentlySpeaking = () => {
        return synthesisRef.current && synthesisRef.current.speaking;
    };

    // silence monitoring

    useEffect(() => {
        // Clear any existing interval
        if (inactivityCheckRef.current) {
            clearInterval(inactivityCheckRef.current);
        }

        // Only set up the interval if we're recording and not paused
        if (isRecording && !isPaused) {
            inactivityCheckRef.current = setInterval(handleSilenceCheck, SILENCE_CHECK_THRESHOLD);
        }

        return () => {
            if (inactivityCheckRef.current) {
                clearInterval(inactivityCheckRef.current);
            }
        };
    }, [isRecording, isPaused, isProcessing]);


    const safelyStopRecognition = () => {
        if (recognition.current && isRecognitionActiveRef.current) {
            try {
                recognition.current.stop();
                isRecognitionActiveRef.current = false;
                setIsRecognitionActive(false);
            } catch (error) {
                console.error("Error stopping recognition:", error);
            }
        }
    };

    const safelyStartRecognition = () => {
        if (recognition.current && !isRecognitionActiveRef.current && !isCancelledRef.current && !isPaused) {
            try {
                if (!isRecognitionActive) {
                    // Reset recognition instance before starting
                    recognition.current.abort();
                    recognition.current = new SpeechRecognition();
                    recognition.current.continuous = true;
                    recognition.current.interimResults = true;
                    
                    // Set up event handlers again
                    setupRecognitionHandlers();
                    
                    // Add small delay before starting
                    setTimeout(() => {
                        recognition.current.start();
                        isRecognitionActiveRef.current = true;
                        setIsRecognitionActive(true);
                        setStatus("Listening...");
                    }, 300);
                }
            } catch (error) {
                console.error("Error starting recognition:", error);
                isRecognitionActiveRef.current = false;
                setIsRecognitionActive(false);
            }
        }
    };

    const setupRecognitionHandlers = () => {
        if (!recognition.current) return;
        
        recognition.current.onresult = (event) => {
            if (!isCancelledRef.current && !isPaused) {
                const current = event.resultIndex;
                const transcriptText = event.results[current][0].transcript;
    
                // Only process new transcript if system isn't speaking
                if (!isCurrentlySpeaking()) {
                    handleTranscriptUpdate(transcriptText);
                }
            }
        };
    
        recognition.current.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
            isRecognitionActiveRef.current = false;
            setIsRecognitionActive(false);
            
            if (!isPaused && isRecording && !isCurrentlySpeaking()) {
                setTimeout(() => {
                    if (isRecording && !isPaused && !isProcessing) {
                        safelyStartRecognition();
                    }
                }, 1000);
            }
        };
    
        recognition.current.onend = () => {
            isRecognitionActiveRef.current = false;
            setIsRecognitionActive(false);
            
            if (!isCancelledRef.current && !isPaused && isRecording && !isCurrentlySpeaking()) {
                setTimeout(() => {
                    safelyStartRecognition();
                }, 1000);
            }
        };
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
                    
                    // Only update transcript if there's actual new content
                    if (transcriptText.trim().length > 0) {
                        setTranscript(transcriptText);
                        setLastTranscriptTime(Date.now());
                    }
                }
            };

            recognition.current.onerror = (event) => {
                console.error("Speech recognition error:", event.error);
                isRecognitionActiveRef.current = false;
                setIsRecognitionActive(false);
                
                if (!isPaused && isRecording) {
                    if (event.error === 'no-speech') {
                        // Don't restart immediately on no-speech
                        const timeSinceLastTranscript = Date.now() - lastTranscriptTime;
                        if (timeSinceLastTranscript >= SILENCE_THRESHOLD) {
                            processAndRespond(transcript);
                        } else {
                            safelyStartRecognition();
                        }
                    } else if (event.error === 'aborted' && !isPaused) {
                        // Only restart if we're not paused
                        setTimeout(() => {
                            safelyStartRecognition();
                        }, 300);
                    } else if (event.error === 'network') {
                        setStatus("Network error. Attempting to reconnect...");
                        setTimeout(() => {
                            safelyStartRecognition();
                        }, 1000);
                    }
                }
            };

            recognition.current.onend = () => {
                isRecognitionActiveRef.current = false;
                setIsRecognitionActive(false);
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
        if (isRecording && !isPaused && recognition.current && !isProcessing) {
            safelyStartRecognition();
        } else if (isPaused || !isRecording) {
            safelyStopRecognition();
        }
    }, [isRecording, isPaused, isProcessing]);


    const handleTranscriptUpdate = (transcriptText) => {
        // Only update transcript if we're not speaking and text is new
        if (transcriptText.trim().length > 0 && !isCurrentlySpeaking()) {
            setTranscript(transcriptText);
            lastInteractionRef.current = Date.now();
            setIsInConversation(true);
        }
    };


    // Handle transcript processing
    useEffect(() => {
        if (isRecording && transcript && !isProcessing && !isCancelledRef.current && !isPaused) {
            if (silenceTimeoutRef.current) {
                clearTimeout(silenceTimeoutRef.current);
            }
    
            // Only set timeout if we have new transcript content
            if (transcript.trim().length > 0) {
                silenceTimeoutRef.current = setTimeout(async () => {
                    if (transcript && !isCancelledRef.current && !isPaused) {
                        await processAndRespond(transcript);
                    }
                }, 3000);
            }
        }
    
        return () => {
            if (silenceTimeoutRef.current) {
                clearTimeout(silenceTimeoutRef.current);
            }
        };
    }, [transcript, isRecording, isProcessing]);

    
    const processAndRespond = async (text) => {
        if (isCancelledRef.current || !text.trim() || isPaused || isCurrentlySpeaking()) return;
        
        try {
            setIsProcessing(true);
            setStatus("Processing your message...");
            safelyStopRecognition();
            
            // Cancel any ongoing speech before processing
            cancelOngoingSpeech();
    
            setTranscript("");
            lastInteractionRef.current = Date.now();
            
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
                
                return new Promise((resolve, reject) => {
                    const utterance = new SpeechSynthesisUtterance(data.response);
                    
                    utterance.onstart = () => {
                        // Ensure recognition is stopped while speaking
                        safelyStopRecognition();
                    };
                    
                    utterance.onend = () => {
                        if (!isCancelledRef.current && !isPaused) {
                            setIsProcessing(false);
                            setStatus("Listening...");
                            setLastResponseTime(Date.now());
                            
                            // Add delay before restarting recognition
                            setTimeout(() => {
                                if (!isPaused && isRecording) {
                                    setIsInConversation(false);
                                    safelyStartRecognition();
                                }
                                resolve();
                            }, 1500); // Increased delay to prevent immediate restart
                        }
                    };
    
                    utterance.onerror = (error) => {
                        console.error("Speech synthesis error:", error);
                        setStatus("Error in speech synthesis. Please try again.");
                        setIsProcessing(false);
                        setIsInConversation(false);
                        
                        if (isRecording && !isPaused) {
                            setTimeout(() => {
                                safelyStartRecognition();
                            }, 1000);
                        }
                        reject(error);
                    };
    
                    synthesisRef.current.speak(utterance);
                });
            }
        } catch (error) {
            console.error("Error processing response:", error);
            setStatus("Error occurred. Please try again.");
            setIsProcessing(false);
            setIsInConversation(false);
            
            if (isRecording && !isPaused) {
                setTimeout(() => {
                    safelyStartRecognition();
                }, 1000);
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
        
        // First speak the status
        if (synthesisRef.current) {
            const utterance = new SpeechSynthesisUtterance(newStatus);
            utterance.onend = () => {
                // Only start recognition after status is spoken
                setTranscript("");
                setTimeout(() => {
                    if (!isRecognitionActive) {
                        safelyStartRecognition();
                    }
                }, 500); // Add delay before starting recognition
            };
            synthesisRef.current.speak(utterance);
        }
    };
    
    const pauseRecording = () => {
        // Store current transcript before pausing
        if (transcript.trim()) {
            setPausedTranscript(transcript);
        }
        
        setIsPaused(true);
        setStatus("Recording paused");
        
        // Stop recognition
        safelyStopRecognition();
        
        // Clear any ongoing timeouts
        if (silenceTimeoutRef.current) {
            clearTimeout(silenceTimeoutRef.current);
        }
        
        // Cancel any ongoing speech and speak pause message
        if (synthesisRef.current) {
            synthesisRef.current.cancel();
            const utterance = new SpeechSynthesisUtterance("Recording paused");
            utterance.onend = () => {
                // Don't restart recognition after speaking pause message
                setStatus("Recording paused - Click resume to continue");
            };
            synthesisRef.current.speak(utterance);
        }
    };

    const resumeRecording = () => {
        setIsPaused(false);
        const newStatus = "Resuming recording...";
        setStatus(newStatus);
        
        // Restore paused transcript if it exists
        if (pausedTranscript) {
            setTranscript(pausedTranscript);
        }
        
        // Wait for the speech to finish before starting recognition
        if (synthesisRef.current) {
            synthesisRef.current.cancel(); // Cancel any ongoing speech
            const utterance = new SpeechSynthesisUtterance(newStatus);
            utterance.onend = () => {
                setStatus("Listening...");
                if (!isRecognitionActive) {
                    safelyStartRecognition();
                }
                // Clear paused transcript after successfully resuming
                setPausedTranscript("");
            };
            synthesisRef.current.speak(utterance);
        }
    };

    const stopRecording = () => {
        isCancelledRef.current = true;
        safelyStopRecognition();
        
        // Clear all states
        if (synthesisRef.current) {
            synthesisRef.current.cancel();
        }
        if (silenceTimeoutRef.current) {
            clearTimeout(silenceTimeoutRef.current);
        }
        
        setIsRecording(false);
        setIsPaused(false);
        setIsProcessing(false);
        setPausedTranscript(""); // Clear any stored paused transcript
        
        const goodbyeMessage = goodbyeMessages[Math.floor(Math.random() * goodbyeMessages.length)];
        
        // Speak goodbye message
        if (synthesisRef.current) {
            const utterance = new SpeechSynthesisUtterance(goodbyeMessage);
            utterance.onend = () => {
                setStatus("Click on the mic to start recording");
                setTranscript("");
            };
            synthesisRef.current.speak(utterance);
        }
    };

    useEffect(() => {
        if (isPaused) {
            safelyStopRecognition();
        } else if (isRecording && !isProcessing) {
            // Small delay before restarting recognition when unpausing
            setTimeout(() => {
                safelyStartRecognition();
            }, 500);
        }
    }, [isPaused]);
    
    return (
        <Container 
            maxWidth={false} 
            sx={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                backgroundColor: "#F8F9FA",
                p: 0,
                position: "relative",
            }}
        >
            <Navbar />
            
            <Box sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "calc(100vh - 64px)",
                mt: 8,
                px: { xs: 2, sm: 4 },
            }}>
                <Box
                    sx={{
                        maxWidth: "80%",
                        width: "100%",
                        borderRadius: "24px",
                        backgroundColor: "white",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                        p: { xs: 3, sm: 6 },
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 4,
                    }}
                >
                    <Box sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mb: 2
                    }}>
                        <WavesIcon sx={{ 
                            fontSize: { xs: 32, sm: 40 }, 
                            color: "#4682B4" 
                        }} />
                        <Typography 
                            variant="h1"
                            sx={{
                                fontWeight: 600,
                                color: "#2C2C2C",
                                fontSize: { xs: '1.75rem', sm: '2.25rem' },
                                letterSpacing: "-0.5px",
                            }}
                        >
                            Voice Assistant
                        </Typography>
                    </Box>

                    <Box
                        sx={{
                            width: "80%",
                            p: 3,
                            borderRadius: "16px",
                            backgroundColor: "#F8F9FA",
                            border: "1px solid rgba(0,0,0,0.08)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            position: "relative",
                            minHeight: "80px",
                        }}
                    >
                        <Typography 
                            variant="body1" 
                            sx={{ 
                                color: "#2C2C2C",
                                fontWeight: 500,
                                textAlign: "center",
                            }}
                        >
                            {status}
                        </Typography>
                        {isProcessing && (
                            <CircularProgress
                                size={24}
                                sx={{
                                    position: 'absolute',
                                    right: '24px',
                                    color: "#4682B4"
                                }}
                            />
                        )}
                    </Box>
                    <Box
                        sx={{
                            display: 'flex',
                            gap: '24px',
                            alignItems: 'center',
                            mt: 4
                        }}
                    >
                        {!isRecording ? (
                            <Button
                                disabled={isProcessing}
                                onClick={startRecording}
                                sx={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: "50%",
                                    backgroundColor: "#4682B4",
                                    color: "white",
                                    '&:hover': {
                                        backgroundColor: "#D87093",
                                        transform: "translateY(-2px)",
                                        transition: "all 0.2s ease-in-out",
                                    },
                                    '&:disabled': {
                                        backgroundColor: '#E0E0E0',
                                    }
                                }}
                            >
                                <MicIcon sx={{ fontSize: 32 }} />
                            </Button>
                        ) : (
                            <>
                                <Button
                                    disabled={isProcessing}
                                    onClick={stopRecording}
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        borderRadius: "50%",
                                        backgroundColor: "#ff4444",
                                        color: "white",
                                        '&:hover': {
                                            backgroundColor: "#ff6666",
                                            transform: "translateY(-2px)",
                                            transition: "all 0.2s ease-in-out",
                                        },
                                        '&:disabled': {
                                            backgroundColor: '#E0E0E0',
                                        }
                                    }}
                                >
                                    <CancelIcon sx={{ fontSize: 32 }} />
                                </Button>
                                <Button
                                    disabled={isProcessing}
                                    onClick={isPaused ? resumeRecording : pauseRecording}
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        borderRadius: "50%",
                                        backgroundColor: isPaused ? "#4CAF50" : "#FFB6C1",
                                        color: "white",
                                        '&:hover': {
                                            backgroundColor: isPaused ? "#66BB6A" : "#FFC1CC",
                                            transform: "translateY(-2px)",
                                            transition: "all 0.2s ease-in-out",
                                        },
                                        '&:disabled': {
                                            backgroundColor: '#E0E0E0',
                                        }
                                    }}
                                >
                                    {isPaused ? (
                                        <PlayArrowIcon sx={{ fontSize: 32 }} />
                                    ) : (
                                        <PauseIcon sx={{ fontSize: 32 }} />
                                    )}
                                </Button>
                            </>
                        )}
                    </Box>
                </Box>
            </Box>
        </Container>
    );
}