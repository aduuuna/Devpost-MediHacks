"use client";
import { useState, useEffect, useRef } from "react";
import {
    Container,
    Box,
    Typography,
    TextField,
    Button,
    Drawer,
    List,
    ListItem,
    ListItemText,
    ListItemButton,
    Divider,
    IconButton,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import SendIcon from '@mui/icons-material/Send';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import Navbar from '../components/Navbar';

export default function WritePage() {
    const [message, setMessage] = useState("");
    const [chats, setChats] = useState([]);
    const [chatHistory, setChatHistory] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [streamingText, setStreamingText] = useState("");
    const [isStreaming, setIsStreaming] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chats, streamingText]);

    const simulateStreaming = (text) => {
        return new Promise((resolve) => {
            setIsStreaming(true);
            let currentText = "";
            let index = 0;
            
            const interval = setInterval(() => {
                if (index < text.length) {
                    currentText += text[index];
                    setStreamingText(currentText);
                    index++;
                } else {
                    clearInterval(interval);
                    setIsStreaming(false);
                    setChats(current => [...current, {
                        text,
                        type: "ai",
                        timestamp: new Date().toISOString()
                    }]);
                    setStreamingText("");
                    resolve();
                }
            }, 30);
        });
    };

    const startNewChat = () => {
        setChats([]);
        setMessage("");
    };

    const summarizeChat = (messages) => {
        if (messages.length === 0) return "New Chat";
        const firstMessage = messages[0].text;
        return firstMessage.length > 30 ? 
            firstMessage.substring(0, 30) + "..." : 
            firstMessage;
    };

    useEffect(() => {
        // Load chat history from localStorage
        const savedChats = localStorage.getItem('chatHistory');
        if (savedChats) {
            setChatHistory(JSON.parse(savedChats));
        }
    }, []);

    const sendMessageToAI = async (userMessage) => {
        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                body: userMessage,
            });

            if (!response.ok) {
                throw new Error('AI response failed');
            }

            const data = await response.json();
            return data.response;
        } catch (error) {
            console.error('Error:', error);
            return "I'm sorry, I'm having trouble responding right now. Please try again.";
        }
    };

    const handleSendMessage = async () => {
        if (message.trim() === "" || isLoading) return;

        const userMessage = {
            text: message,
            type: "user",
            timestamp: new Date().toISOString()
        };
        
        setChats(current => [...current, userMessage]);
        setMessage("");
        setIsLoading(true);

        const aiResponse = await sendMessageToAI(message);
        await simulateStreaming(aiResponse);
        setIsLoading(false);

        if (chats.length === 0) {
            const newChat = {
                title: summarizeChat([userMessage]),
                timestamp: new Date().toISOString()
            };
            setChatHistory(prev => [...prev, newChat]);
            localStorage.setItem('chatHistory', JSON.stringify([...chatHistory, newChat]));
        }
    };

    
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <Container 
            maxWidth="100vw" 
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

            {/* Main Chat Interface */}
            <Box sx={{
                display: "flex",
                height: "calc(100vh - 64px)",
                mt: 8,
            }}>
                {/* Sidebar */}
                <Drawer
                    variant={isMobile ? "temporary" : "permanent"}
                    open={isMobile ? isSidebarOpen : true}
                    onClose={() => setIsSidebarOpen(false)}
                    sx={{
                        width: 280,
                        flexShrink: 0,
                        '& .MuiDrawer-paper': {
                            width: 280,
                            boxSizing: 'border-box',
                            mt: "80px",
                            ml:'20px',
                            borderRadius: "1rem",
                            backgroundColor: "#FFFFFF",
                            borderRight: "1px solid rgba(0, 0, 0, 0.12)",
                        },
                    }}
                >
                    <Box sx={{ p: 2, display: "flex",flexDirection: "row", justifyContent:"space-between" }}>
                        <Typography variant="h6" sx={{ color: "#4682B4", fontWeight: "bold" }}>
                            Chat History
                        </Typography>
                        <Button
                            // startIcon={<AddIcon />}
                            onClick={startNewChat}
                            variant="contained"
                            sx={{
                                width: "50px",
                                height: "50px",
                                
                                backgroundColor: "#4682B4",
                                '&:hover': { backgroundColor: "#D87093" }
                            }}
                        >
                           New Chat
                        </Button>
                    </Box>
                    <Divider />
                    <List>
                        {chatHistory.map((chat, index) => (
                            <ListItemButton key={index}>
                                <ListItemText 
                                    primary={chat.title}
                                    secondary={new Date(chat.timestamp).toLocaleDateString()}
                                />
                            </ListItemButton>
                        ))}
                    </List>
                </Drawer>

                {/* Chat Area */}
                <Box sx={{
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    width: "100%",
                    p: 2,
                    ml: isMobile ? 0 : "280px",
                }}>
                    {/* Mobile Menu Button */}
                    {isMobile && (
                        <IconButton
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            sx={{ position: 'absolute', left: 16, top: 80 }}
                        >
                            <MenuIcon />
                        </IconButton>
                    )}

                    {/* Messages Area */}
                    <Box sx={{
                        flexGrow: 1,
                        overflowY: "auto",
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        mb: 2,
                        p: 2,
                    }}>
                        {chats.map((chat, index) => (
                            <Box
                                key={index}
                                sx={{
                                    alignSelf: chat.type === "user" ? "flex-end" : "flex-start",
                                    maxWidth: "70%",
                                }}
                            >
                                <Box sx={{
                                    backgroundColor: chat.type === "user" ? "#4682B4" : "#F0F2F5",
                                    color: chat.type === "user" ? "white" : "black",
                                    borderRadius: "1rem",
                                    p: 2,
                                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                }}>
                                    <Typography>{chat.text}</Typography>
                                </Box>
                                <Typography variant="caption" sx={{ 
                                    color: "#666",
                                    mt: 0.5,
                                    display: "block",
                                    textAlign: chat.type === "user" ? "right" : "left"
                                }}>
                                    {new Date(chat.timestamp).toLocaleTimeString()}
                                </Typography>
                            </Box>
                        ))}
                        {isStreaming && (
                            <Box sx={{
                                alignSelf: "flex-start",
                                maxWidth: "70%",
                            }}>
                                <Box sx={{
                                    backgroundColor: "#F0F2F5",
                                    borderRadius: "1rem",
                                    p: 2,
                                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                }}>
                                    <Typography>{streamingText}</Typography>
                                </Box>
                            </Box>
                        )}
                        <div ref={messagesEndRef} />
                    </Box>
                    
                    {/* Input Area */}
                    <Box sx={{
                        display: "flex",
                        gap: 2,
                        p: 2,
                        backgroundColor: "white",
                        borderRadius: "1rem",
                        boxShadow: "0 -2px 10px rgba(0,0,0,0.05)",
                    }}>
                        <TextField
                            fullWidth
                            multiline
                            maxRows={4}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type your message..."
                            variant="outlined"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '0.8rem',
                                }
                            }}
                        />
                        <Button
                            variant="contained"
                            onClick={handleSendMessage}
                            sx={{
                                borderRadius: '0.8rem',
                                backgroundColor: "#4682B4",
                                minWidth: '64px',
                                height: '56px',
                                '&:hover': {
                                    backgroundColor: "#D87093",
                                }
                            }}
                        >
                            <SendIcon />
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Container>
    );
}