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
import { 
    collection, 
    addDoc, 
    getDocs, 
    query, 
    where, 
    deleteDoc,
    doc,
    getDoc,
    updateDoc
} from 'firebase/firestore';
import {db} from "../../firebase";

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

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chats, streamingText]);

    //This function helps stream the response from the AI

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

    // This function is responsible for starting a new chat

    const startNewChat = async () => {
        if (!user) return;

        try {
            // Create a new chat document
            const chatRef = await addDoc(collection(db, "chats"), {
                userId: user.id,
                title: "New Chat",
                timestamp: new Date().toISOString(),
                lastMessage: null
            });

            // Create messages subcollection for this chat
            const newChat = {
                id: chatRef.id,
                userId: user.id,
                title: "New Chat",
                timestamp: new Date().toISOString(),
                lastMessage: null
            };

            setChatHistory(prev => [...prev, newChat]);
            setSelectedChatId(chatRef.id);
            setChats([]);
            console.log("New chat created with ID:", chatRef.id);
        } catch (error) {
            console.error("Error creating chat:", error);
        }
    };

    const summarizeChat = (messages) => {
        if (messages.length === 0) return "New Chat";
        const firstMessage = messages[0].text;
        return firstMessage.length > 30 ? 
            firstMessage.substring(0, 30) + "..." : 
            firstMessage;
    };

    // Loading user's chat History

    useEffect(() => {
        async function loadUserChats() {
            if (!user) return;
            
            try {
                // Get all chats where userId matches current user
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
        }

        if (isLoaded && isSignedIn) {
            loadUserChats();
        }
    }, [user, isLoaded, isSignedIn]);



    // This function loads a specific chat

    const loadChat = async (chatId) => {
        if (!user) return;

        try {
            // Get all messages for this chat
            const messagesQuery = query(collection(db, "chats", chatId, "messages"));
            const querySnapshot = await getDocs(messagesQuery);
            
            const messages = [];
            querySnapshot.forEach((doc) => {
                messages.push(doc.data());
            });

            setChats(messages);
            setSelectedChatId(chatId);
        } catch (error) {
            console.error("Error loading messages:", error);
        }
    };

    // This function deletes a chat

    const deleteChat = async (chatId) => {
        if (!user) return;

        try {
            // Delete the chat document
            await deleteDoc(doc(db, "chats", chatId));
            
            // Delete all messages in the subcollection
            const messagesQuery = query(collection(db, "chats", chatId, "messages"));
            const messagesSnapshot = await getDocs(messagesQuery);
            
            messagesSnapshot.forEach(async (messageDoc) => {
                await deleteDoc(doc(db, "chats", chatId, "messages", messageDoc.id));
            });

            // Update local state
            setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
            if (selectedChatId === chatId) {
                setSelectedChatId(null);
                setChats([]);
            }
        } catch (error) {
            console.error("Error deleting chat:", error);
        }
    };



    // app/write/page.js - Update the sendMessageToAI function

    const sendMessageToAI = async (userMessage) => {
        console.log("Sending message to AI:", userMessage);
        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain',
                },
                body: userMessage,
            });
            console.log("Response status:", response.status);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'AI response failed');
            }
    
            const data = await response.json();
            console.log("AI response:", data);
            return data.response;
        } catch (error) {
            console.error('Error:', error);
            return "I'm sorry, I'm having trouble responding right now. Please try again.";
        }
    };

    // Modifing handleSendMessage function to store messages in Firebase
    const handleSendMessage = async () => {
        console.log("handleSendMessage called", message);
        if (message.trim() === "" || isLoading || !user || !selectedChatId) return;

        const userMessage = {
            text: message,
            type: "user",
            timestamp: new Date().toISOString()
        };

        try {
            // Add message to messages subcollection
            await addDoc(collection(db, "chats", selectedChatId, "messages"), userMessage);

            // Update chat title if it's the first message
            const chatDoc = await getDoc(doc(db, "chats", selectedChatId));
            if (chatDoc.data().title === "New Chat") {
                await updateDoc(doc(db, "chats", selectedChatId), {
                    title: message.substring(0, 30) + (message.length > 30 ? "..." : ""),
                    lastMessage: message
                });
            }

            setChats(prev => [...prev, userMessage]);
            setMessage("");

            // Handle AI response
            const aiResponse = await sendMessageToAI(message);
            const aiMessage = {
                text: aiResponse,
                type: "ai",
                timestamp: new Date().toISOString()
            };

            await addDoc(collection(db, "chats", selectedChatId, "messages"), aiMessage);
            setChats(prev => [...prev, aiMessage]);

        } catch (error) {
            console.error("Error sending message:", error);
        }
    };
    
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    if (!isLoaded || !isSignedIn) {
        return null;
    }

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
                    <Box sx={{ p: 2, display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                        <Typography variant="h6" sx={{ color: "#4682B4", fontWeight: "bold" }}>
                            Chat History
                        </Typography>
                        <Button
                            onClick={startNewChat}
                            variant="contained"
                            sx={{
                                backgroundColor: "#4682B4",
                                '&:hover': { backgroundColor: "#D87093" }
                            }}
                        >
                            New Chat
                        </Button>
                    </Box>
                    <Divider />
                    <List>
                        {chatHistory.map((chat) => (
                            <ListItemButton 
                                key={chat.id}
                                selected={selectedChatId === chat.id}
                                onClick={() => loadChat(chat.id)}
                            >
                                <ListItemText 
                                    primary={chat.title}
                                    secondary={new Date(chat.timestamp?.seconds * 1000).toLocaleDateString()}
                                />
                                <IconButton
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteChat(chat.id);
                                    }}
                                    sx={{
                                        color: 'error.main',
                                        '&:hover': { backgroundColor: 'error.light' }
                                    }}
                                >
                                    <CloseIcon />
                                </IconButton>
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