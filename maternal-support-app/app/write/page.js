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
        if (user && !selectedChatId) {
            startNewChat();
        }
    }, [user]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chats, streamingText]);

    useEffect(() => {
        console.log("Current state:", {
            selectedChatId,
            user: user?.id,
            db: !!db,
            chats: chats.length
        });
    }, [selectedChatId, user, chats]);

    

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

    // This function is responsible for starting a new chat

    const startNewChat = async () => {
        if (!user) return;

        try {
            const chatRef = await addDoc(collection(db, "chats"), {
                userId: user.id,
                title: "New Chat",
                timestamp: new Date().toISOString(),
                lastMessage: null
            });
            
            setSelectedChatId(chatRef.id);
            setChats([]);
            
        } catch (error) {
            console.error("Chat creation error:", error);
        }
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

    // Modifing handleSendMessage function to store messages in Firebase
    const handleSendMessage = async () => {
        if (!selectedChatId) {
            await startNewChat();
        }
        
        if (message.trim() === "" || isLoading || !user) return;
        setIsLoading(true);
        setIsStreaming(true);
        
        try {
            const userMessage = {
                text: message.trim(),
                type: "user",
                timestamp: new Date().toISOString()
            };

            // Add user message to database
            await addDoc(collection(db, "chats", selectedChatId, "messages"), userMessage);
            setChats(prev => [...prev, userMessage]);
            
            // Generate and update chat title if this is the first message
            if (chats.length === 0) {
                const title = await generateChatTitle(message);
                await updateDoc(doc(db, "chats", selectedChatId), { title });
                setChatHistory(prev => 
                    prev.map(chat => 
                        chat.id === selectedChatId ? { ...chat, title } : chat
                    )
                );
            }

            setMessage("");
            
            // Handle AI response with streaming
            const aiResponse = await sendMessageToAI(message);
            const aiMessage = {
                text: aiResponse,
                type: "ai",
                timestamp: new Date().toISOString()
            };

            await addDoc(collection(db, "chats", selectedChatId, "messages"), aiMessage);
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