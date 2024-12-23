"use client";
import { useState, useEffect } from "react";
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
import Navbar from '../components/Navbar';

export default function WritePage() {
    const [message, setMessage] = useState("");
    const [chats, setChats] = useState([]);
    const [chatHistory, setChatHistory] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    useEffect(() => {
        // Load chat history from localStorage
        const savedChats = localStorage.getItem('chatHistory');
        if (savedChats) {
            setChatHistory(JSON.parse(savedChats));
        }
    }, []);

    const handleSendMessage = () => {
        if (message.trim() !== "") {
            const newMessage = {
                text: message,
                type: "user",
                timestamp: new Date().toISOString()
            };
            
            const updatedChats = [...chats, newMessage];
            setChats(updatedChats);
            setMessage("");
            
            // Simulate AI response
            setTimeout(() => {
                const aiResponse = {
                    text: "Thank you for your message. I'm here to help with your maternal health questions.",
                    type: "ai",
                    timestamp: new Date().toISOString()
                };
                setChats(current => [...current, aiResponse]);
            }, 1000);
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
                    <Box sx={{ p: 2 }}>
                        <Typography variant="h6" sx={{ color: "#4682B4", fontWeight: "bold" }}>
                            Chat History
                        </Typography>
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