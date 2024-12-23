"use client";
import React, { useState, useEffect, useRef } from "react";
import { Container, Box, Button, Typography, CircularProgress } from "@mui/material";
import Image from 'next/image';
import MicIcon from '@mui/icons-material/Mic';
import CancelIcon from '@mui/icons-material/Cancel';
import logo from "../../public/pregnant.png";


const SpeechRecognition = 
  typeof window !== "undefined" ? window.SpeechRecognition || window.webkitSpeechRecognition : null;

export default function SpeakPage() {
    
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [status, setStatus] = useState("Click on the mic to start recording");
    const [transcript, setTranscript] = useState("");
    
    const recognition = useRef(null);
    const synthesisRef = useRef(null);
    const silenceTimeoutRef = useRef(null);
    const isCancelledRef = useRef(false);
    
    
    useEffect(() => {
        if (typeof window !== "undefined") {
            synthesisRef.current = window.speechSynthesis;
            
            if (SpeechRecognition) {
                recognition.current = new SpeechRecognition();
                recognition.current.continuous = true;
                recognition.current.interimResults = true;
                
                recognition.current.onresult = (event) => {
                    if (!isCancelledRef.current) {
                        const current = event.resultIndex;
                        const transcriptText = event.results[current][0].transcript;
                        setTranscript(transcriptText);
                    }
                };

                recognition.current.onerror = (event) => {
                    console.error("Speech recognition error:", event.error);
                    setStatus("Error in speech recognition. Please try again.");
                    stopRecording();
                };
            }
        }
        
        return () => {
            stopRecording();
        };
    }, []);

    useEffect(() => {
        if (isRecording && transcript && !isProcessing && !isCancelledRef.current) {
            if (silenceTimeoutRef.current) {
                clearTimeout(silenceTimeoutRef.current);
            }

            silenceTimeoutRef.current = setTimeout(async () => {
                if (transcript && !isCancelledRef.current) {
                    await processAndRespond(transcript);
                }
            }, 5000);
        }

        return () => {
            if (silenceTimeoutRef.current) {
                clearTimeout(silenceTimeoutRef.current);
            }
        };
    }, [transcript, isRecording]);

    const processAndRespond = async (text) => {
        if (isCancelledRef.current) return;
        
        try {
            setIsProcessing(true);
            setStatus("Processing your message...");

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
                        setStatus(isRecording ? "Listening..." : "Click on the mic to start recording");
                        setTranscript("");
                    }
                };

                utterance.onerror = (error) => {
                    console.error("Speech synthesis error:", error);
                    setStatus("Error in speech synthesis. Please try again.");
                    setIsProcessing(false);
                };

                synthesisRef.current.speak(utterance);
            }
        } catch (error) {
            console.error("Error processing response:", error);
            setStatus("Error occurred. Please try again.");
            setIsProcessing(false);
        }
    };

    const startRecording = () => {
        if (!recognition.current) {
            setStatus("Speech recognition is not supported in this browser.");
            return;
        }

        try {
            isCancelledRef.current = false;
            recognition.current.start();
            setIsRecording(true);
            setStatus("Listening...");
            setTranscript("");
        } catch (error) {
            console.error("Error starting recording:", error);
            setStatus("Error starting recording. Please try again.");
        }
    };

    const stopRecording = () => {
        isCancelledRef.current = true;
        
        if (recognition.current) {
            recognition.current.stop();
        }
        if (synthesisRef.current) {
            synthesisRef.current.cancel();
        }
        if (silenceTimeoutRef.current) {
            clearTimeout(silenceTimeoutRef.current);
        }
        
        setIsRecording(false);
        setIsProcessing(false);
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

                <Box>
                    <Image src={logo} alt="Logo" width={80} height={80} priority />
                </Box>

                <Box
                    sx={{
                        width: 100,
                        height: 100,
                        backgroundColor: isRecording ? "#4682B4" : "#D87093",
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
                        onClick={isRecording ? stopRecording : startRecording}
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