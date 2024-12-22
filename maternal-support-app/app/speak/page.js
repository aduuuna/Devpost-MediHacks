"use client";
import React, { useState, useEffect, useRef } from "react";
import {
    Container,
    Box,
    Button,
    Typography,
    CircularProgress
} from "@mui/material";
import logo from "../../public/pregnant.png";
import Image from 'next/image';
import MicIcon from '@mui/icons-material/Mic';
import CancelIcon from '@mui/icons-material/Cancel';
import SpeechRecognition, {useSpeechRecognition} from "react-speech-recognition";
import { generateResponse } from "../generate/page";

export default function SpeakPage() {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [status, setStatus] = useState("Click on the mic to start recording");
    const [synth, setSynth] = useState(null);
    const silenceTimer = useRef(null);
    const processingRef = useRef(false);

    // Initialize speech synthesis on client side only
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setSynth(window.speechSynthesis);
        }
    }, []);

    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();

    // Debug logging
    useEffect(() => {
        console.log("Current transcript:", transcript);
        console.log("Is listening:", listening);
    }, [transcript, listening]);

    // Handle speech detection and silence
    useEffect(() => {
        if (isRecording && transcript && !processingRef.current) {
            // Clear existing timer when new speech is detected
            if (silenceTimer.current) {
                clearTimeout(silenceTimer.current);
            }

            setStatus("Listening...");

            // Set new timer for silence detection (reduced to 3 seconds)
            silenceTimer.current = setTimeout(async () => {
                if (transcript && !processingRef.current) {
                    try {
                        processingRef.current = true;
                        setIsProcessing(true);
                        setStatus("Processing your question...");

                        const aiResponse = await generateResponse(transcript);
                        
                        if (aiResponse) {
                            setStatus("Responding...");

                            if (synth) {
                                // Cancel any ongoing speech
                                synth.cancel();

                                const utterance = new SpeechSynthesisUtterance(aiResponse);
                                
                                utterance.onend = () => {
                                    processingRef.current = false;
                                    setIsProcessing(false);
                                    if (isRecording) {
                                        setStatus("Listening...");
                                        resetTranscript();
                                    } else {
                                        setStatus("Click on the mic to start recording");
                                    }
                                };

                                utterance.onerror = () => {
                                    console.error("Speech synthesis error");
                                    setStatus("Error in speech synthesis. Please try again.");
                                    processingRef.current = false;
                                    setIsProcessing(false);
                                };
                                
                                synth.speak(utterance);
                            }
                        }
                    } catch (error) {
                        console.error("Error generating response:", error);
                        setStatus("Error occurred. Please try again.");
                        processingRef.current = false;
                        setIsProcessing(false);
                    }
                }
            }, 3000); // Reduced to 3 seconds silence timer
        }

        return () => {
            if (silenceTimer.current) {
                clearTimeout(silenceTimer.current);
            }
        };
    }, [transcript, isRecording, synth, resetTranscript]);

    const cancellationMessages = [
        "I'm here whenever you need me. Take care!",
        "Feel free to return anytime - I'm always here to help.",
        "Don't hesitate to ask questions when you're ready.",
        "Looking forward to supporting you when you return.",
        "Remember, I'm here 24/7 whenever you need support.",
        "Take your time - I'll be here when you want to chat.",
        "Wishing you a wonderful day ahead. Come back anytime!",
        "Your wellbeing matters - I'm here when you need to talk."
    ];
    
    const getRandomCancellationMessage = () => {
        return cancellationMessages[Math.floor(Math.random() * cancellationMessages.length)];
    };

    const handleRecording = async () => {
        if (isRecording) {
            // Cancel recording
            SpeechRecognition.stopListening();
            setIsRecording(false);
            setStatus("Click on the mic to start recording");
            
            // Clear any existing timers
            if (silenceTimer.current) {
                clearTimeout(silenceTimer.current);
            }
            
            // Stop any ongoing speech
            if (synth) {
                synth.cancel();
                const message = getRandomCancellationMessage();
                const utterance = new SpeechSynthesisUtterance(message);
                utterance.onend = () => {
                    processingRef.current = false;
                    setIsProcessing(false);
                };
                synth.speak(utterance);
            }
            
            resetTranscript();
            processingRef.current = false;
            setIsProcessing(false);
        } else {
            // Start recording
            try {
                await SpeechRecognition.startListening({ continuous: true });
                setIsRecording(true);
                setStatus("Listening...");
                resetTranscript();
                processingRef.current = false;
                setIsProcessing(false);
            } catch (error) {
                console.error("Error starting speech recognition:", error);
                setStatus("Error starting recording. Please try again.");
            }
        }
    };

    // Check browser support
    if (!browserSupportsSpeechRecognition) {
        return (
            <Typography variant="h6" sx={{ textAlign: 'center', padding: 4 }}>
                Your browser does not support speech recognition. Please use Google Chrome for the best experience.
            </Typography>
        );
    }

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
                {/* Status Box */}
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

                {/* Logo */}
                <Box>
                    <Image src={logo} alt="Logo" width={80} height={80} priority />
                </Box>

                {/* Mic/Cancel Button */}
                <Box
                    sx={{
                        width: 100,
                        height: 100,
                        backgroundColor: isRecording ? "#4682B4" : "#D87093",
                        borderRadius: "50%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        color: "white",
                        fontSize: 20,
                        cursor: "pointer",
                        transition: "background-color 0.3s ease"
                    }}
                >
                    <Button
                        disabled={isProcessing}
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
                        onClick={handleRecording}
                    >
                        {isRecording ? (
                            <CancelIcon sx={{ fontSize: 40, color: "black" }} />
                        ) : (
                            <MicIcon sx={{ fontSize: 40, color: "black" }} />
                        )}
                    </Button>
                </Box>
            </Box>
        </Container>
    );
}