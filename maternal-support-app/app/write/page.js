"use client";
import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import {
    Container,
    Box,
    Typography,
    TextField,
    Button,
    Drawer,
    List,
    ListItemText,
    ListItemButton,
    Divider,
    IconButton,
    useMediaQuery,
    useTheme,
    CircularProgress,
    Tooltip,
    Avatar,
} from "@mui/material";
import SendIcon from '@mui/icons-material/Send';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import Image from 'next/image';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import Navbar from '../components/Navbar';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import {db} from "../../firebase";
import logo from "../../public/pregnant.png";

export default function WritePage() {
    const { isLoaded, isSignedIn, user } = useUser();
    const [message, setMessage] = useState("");
    const [chats, setChats] = useState([]);
    const [chatHistory, setChatHistory] = useState([]);
    const [selectedChatId, setSelectedChatId] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [streamingText, setStreamingText] = useState("");
    const [isStreaming, setIsStreaming] = useState(false);
    
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const messagesEndRef = useRef(null);

    // Always define these functions outside of useEffect
    const generateChatTitle = async (message) => {
        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    type: 'title'
                }),
            });
            
            if (!response.ok) throw new Error('Title generation failed');
            const data = await response.json();
            return data.title || "New Chat";
        } catch (error) {
            console.error("Error generating title:", error);
            return "New Chat";
        }
    };

    const loadChat = async (chatId) => {
        if (!chatId || !user) return;
        
        try {
            const messagesQuery = query(collection(db, "chats", chatId, "messages"));
            const querySnapshot = await getDocs(messagesQuery);
            const chatMessages = [];
            
            querySnapshot.forEach((doc) => {
                chatMessages.push(doc.data());
            });
            
            setSelectedChatId(chatId);
            setChats(chatMessages);
        } catch (error) {
            console.error("Error loading chat:", error);
        }
    };

    const loadUserChats = async () => {
        if (!user) return;
        
        try {
            const chatsQuery = query(
                collection(db, "chats"),
                where("userId", "==", user.id)
            );
            
            const querySnapshot = await getDocs(chatsQuery);
            const userChats = [];
            
            querySnapshot.forEach((doc) => {
                userChats.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            setChatHistory(userChats);
        } catch (error) {
            console.error("Error loading chats:", error);
        }
    };

    const startNewChat = async () => {
        if (!user) return;
        
        try {
            const chatRef = await addDoc(collection(db, "chats"), {
                userId: user.id,
                title: "New Chat",
                createdAt: new Date()
            });
            
            setSelectedChatId(chatRef.id);
            setChats([]);
            loadUserChats();
        } catch (error) {
            console.error("Chat creation error:", error);
        }
    };

    const deleteChat = async (chatId) => {
        if (!user) return;

        try {
            await deleteDoc(doc(db, "chats", chatId));
            
            const messagesQuery = query(collection(db, "chats", chatId, "messages"));
            const messagesSnapshot = await getDocs(messagesQuery);
            
            messagesSnapshot.forEach(async (messageDoc) => {
                await deleteDoc(doc(db, "chats", chatId, "messages", messageDoc.id));
            });

            setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
            if (selectedChatId === chatId) {
                setSelectedChatId(null);
                setChats([]);
            }
        } catch (error) {
            console.error("Error deleting chat:", error);
        }
    };

    const sendMessageToAI = async (userMessage) => {
        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMessage,
                    type: 'chat'
                }),
            });

            if (!response.ok) throw new Error('Stream failed');
            
            const reader = response.body.getReader();
            let accumulatedResponse = '';
            
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                const chunk = new TextDecoder().decode(value);
                accumulatedResponse += chunk;
                setStreamingText(accumulatedResponse);
            }
            
            return accumulatedResponse;
        } catch (error) {
            console.error('Error:', error);
            return "I'm sorry, I'm having trouble responding right now.";
        }
    };

    const handleSendMessage = async () => {
        if (message.trim() === "" || isLoading || !user) return;
        setIsLoading(true);
        setIsStreaming(true);
        
        try {
            let currentChatId = selectedChatId;
            
            if (!currentChatId) {
                const chatRef = await addDoc(collection(db, "chats"), {
                    userId: user.id,
                    title: "New Chat",
                    createdAt: new Date()
                });
                currentChatId = chatRef.id;
                setSelectedChatId(currentChatId);
            }

            const messagesRef = collection(db, "chats", currentChatId, "messages");
            
            const userMessage = {
                text: message.trim(),
                type: "user",
                timestamp: new Date()
            };
    
            await addDoc(messagesRef, userMessage);
            setChats(prev => [...prev, userMessage]);
    
            if (chats.length === 0) {
                const title = await generateChatTitle(message);
                await updateDoc(doc(db, "chats", currentChatId), { title });
                loadUserChats();
            }
    
            setMessage("");
            
            const aiResponse = await sendMessageToAI(message);
            const aiMessage = {
                text: aiResponse,
                type: "ai",
                timestamp: new Date()
            };
    
            await addDoc(messagesRef, aiMessage);
            setChats(prev => [...prev, aiMessage]);
    
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setIsLoading(false);
            setIsStreaming(false);
            setStreamingText("");
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // Effects
    useEffect(() => {
        if (isLoaded && isSignedIn) {
            loadUserChats();
        }
    }, [isLoaded, isSignedIn]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chats, streamingText]);

    if (!isLoaded || !isSignedIn) {
        return null;
    }

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
                height: "calc(100vh - 64px)",
                mt: 8,
                backgroundColor: "#F8F9FA",
            }}>
                {/* Enhanced Sidebar */}
                <Drawer
                    variant={isMobile ? "temporary" : "permanent"}
                    open={isMobile ? isSidebarOpen : true}
                    onClose={() => setIsSidebarOpen(false)}
                    sx={{
                        width: 300,
                        flexShrink: 0,
                        '& .MuiDrawer-paper': {
                            width: 300,
                            boxSizing: 'border-box',
                            mt: "64px",
                            backgroundColor: "#FFFFFF",
                            borderRight: "none",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                        },
                    }}
                >
                    <Box sx={{ 
                        p: 3, 
                        display: "flex", 
                        flexDirection: "column", 
                        gap: 2 
                    }}>
                        <Button
                            onClick={startNewChat}
                            variant="contained"
                            fullWidth
                            startIcon={<ChatBubbleOutlineIcon />}
                            sx={{
                                backgroundColor: "#4682B4",
                                py: 1.5,
                                borderRadius: "12px",
                                textTransform: "none",
                                fontSize: "1rem",
                                fontWeight: 600,
                                '&:hover': { 
                                    backgroundColor: "#D87093",
                                    transform: "translateY(-2px)",
                                    transition: "all 0.2s ease-in-out",
                                }
                            }}
                        >
                            Start New Chat
                        </Button>
                        
                        <Typography variant="h6" sx={{ 
                            color: "#1A1A1A", 
                            fontWeight: "600",
                            fontSize: "1.1rem",
                            mt: 2 
                        }}>
                            Recent Chats
                        </Typography>
                    </Box>
                    <List sx={{ px: 2 }}>
                        {chatHistory.map((chat) => (
                            <ListItemButton 
                                key={chat.id}
                                selected={selectedChatId === chat.id}
                                onClick={() => loadChat(chat.id)}
                                sx={{
                                    borderRadius: "10px",
                                    mb: 1,
                                    '&.Mui-selected': {
                                        backgroundColor: '#EBF5FF',
                                        '&:hover': {
                                            backgroundColor: '#E3F0FF',
                                        }
                                    },
                                    '&:hover': {
                                        backgroundColor: '#F5F5F5',
                                    }
                                }}
                            >
                                <ListItemText 
                                    primary={chat.title}
                                    primaryTypographyProps={{
                                        sx: {
                                            fontWeight: selectedChatId === chat.id ? 600 : 400,
                                            color: "#2C2C2C",
                                            fontSize: "0.95rem",
                                        }
                                    }}
                                />
                                <Tooltip title="Delete chat">
                                    <IconButton
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteChat(chat.id);
                                        }}
                                        sx={{
                                            color: '#666',
                                            '&:hover': { 
                                                color: '#ff4444',
                                                backgroundColor: 'rgba(255,68,68,0.1)' 
                                            }
                                        }}
                                    >
                                        <DeleteOutlineIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </ListItemButton>
                        ))}
                    </List>
                </Drawer>

                {/* Enhanced Chat Area */}
                <Box sx={{
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    width: "100%",
                    ml: isMobile ? 0 : "300px",
                    position: "relative",
                }}>
                    {/* Mobile Menu Button */}
                    {isMobile && (
                        <IconButton
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            sx={{ 
                                position: 'absolute', 
                                left: 16, 
                                top: 16,
                                backgroundColor: "white",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                '&:hover': {
                                    backgroundColor: "#F5F5F5"
                                }
                            }}
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
                        gap: 3,
                        p: 4,
                        pb: 2,
                    }}>
                        {chats.length === 0 && !isStreaming && (
                            <Box sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                height: "100%",
                                gap: 2,
                                color: "#666",
                            }}>
                                <ChatBubbleOutlineIcon sx={{ fontSize: 48, color: "#4682B4" }} />
                                <Typography variant="h6">Start a New Conversation</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Type a message below to begin chatting
                                </Typography>
                            </Box>
                        )}
                        
                        {chats.map((chat, index) => (
                            <Box
                                key={index}
                                sx={{
                                    display: "flex",
                                    flexDirection: chat.type === "user" ? "row-reverse" : "row",
                                    gap: 2,
                                    alignItems: "flex-start",
                                }}
                            >
                                
                                {chat.type === "ai" && (
                                    <Avatar 
                                        sx={{ 
                                            width: 38,
                                            height: 38,
                                            p: 0, 
                                        }}
                                    >
                                        <Image
                                            src={logo} // Replace with your image path
                                            alt="AI Assistant"
                                            width={38}
                                            height={38}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                            }}
                                        />
                                    </Avatar>
                                )}
                                <Box sx={{
                                    maxWidth: "70%",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 0.5,
                                }}>
                                    <Box sx={{
                                        backgroundColor: chat.type === "user" ? "#4682B4" : "white",
                                        color: chat.type === "user" ? "white" : "#2C2C2C",
                                        borderRadius: "16px",
                                        p: 2,
                                        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                                    }}>
                                        <Typography sx={{ 
                                            lineHeight: 1.6,
                                            fontSize: "0.95rem",
                                        }}>
                                            {chat.text}
                                        </Typography>
                                    </Box>
                                    <Typography 
                                        variant="caption" 
                                        sx={{ 
                                            color: "#666",
                                            alignSelf: chat.type === "user" ? "flex-end" : "flex-start",
                                        }}
                                    >
                                        {new Date(chat.timestamp).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </Typography>
                                </Box>
                            </Box>
                        ))}
                        
                        {isStreaming && (
                            <Box sx={{
                                display: "flex",
                                gap: 2,
                                alignItems: "flex-start",
                            }}>
                                <Avatar sx={{ p: 0, width: 38, height: 38 }}>
                                    <Image
                                        src= {logo} 
                                        alt="AI Assistant"
                                        width={38}
                                        height={38}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                        }}
                                    />
                                </Avatar>
                                <Box sx={{
                                    backgroundColor: "white",
                                    borderRadius: "16px",
                                    p: 2,
                                    maxWidth: "70%",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                                }}>
                                    <Typography sx={{ lineHeight: 1.6 }}>
                                        {streamingText}
                                    </Typography>
                                </Box>
                            </Box>
                        )}
                        <div ref={messagesEndRef} />
                    </Box>
                    
                    {/* Enhanced Input Area */}
                    <Box sx={{
                        p: 3,
                        backgroundColor: "white",
                        borderTop: "1px solid rgba(0,0,0,0.05)",
                    }}>
                        <Box sx={{
                            display: "flex",
                            gap: 2,
                            maxWidth: "900px",
                            margin: "0 auto",
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
                                disabled={isLoading}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '12px',
                                        backgroundColor: '#F8F9FA',
                                        '&:hover': {
                                            backgroundColor: '#F0F2F5',
                                        },
                                        '&.Mui-focused': {
                                            backgroundColor: '#FFFFFF',
                                        }
                                    }
                                }}
                            />
                            <Button
                                variant="contained"
                                onClick={handleSendMessage}
                                disabled={isLoading || message.trim() === ""}
                                sx={{
                                    borderRadius: '12px',
                                    backgroundColor: "#4682B4",
                                    minWidth: '56px',
                                    height: '56px',
                                    '&:hover': {
                                        backgroundColor: "#D87093",
                                        transform: "translateY(-2px)",
                                        transition: "all 0.2s ease-in-out",
                                    },
                                    '&.Mui-disabled': {
                                        backgroundColor: '#E0E0E0',
                                    }
                                }}
                            >
                                {isLoading ? (
                                    <CircularProgress size={24} color="inherit" />
                                ) : (
                                    <SendIcon />
                                )}
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Container>
    );
}