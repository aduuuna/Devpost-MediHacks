"use client";
import React, {useState} from "react";

import {
    Container,
    Box,
    Typography,
    TextField,
    Button,
} from "@mui/material"

export default function WritePage() {
    const [message, setMessage] = useState(" ");
    const [chats, setChats] = useState([]);

    // Handling sending message

    const handleSendMessage = () => {
        if (message.trim() !== "") {
            setChats([...chats, {text: message, type: "user" }]);
            setMessage("");
        }
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
            {/* // This Box represents the white background */}
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
                    minHeight: "70vh",
                    overflowY: "auto"
                                
                }}
            >   
                {chats.length === 0 ? (
                    <Typography color="grey" textAlign="center">
                        No messages yet. Start Typing!
                    </Typography>
                ) : (
                    chats.map((chat, index) => (
                        <Typography
                            key={index}
                            sx={{
                                textAlign: chat.type === "user" ? "right" : "left",
                                marginBottom: "10px",
                                padding: "10px",
                                borderRadius: "10px",
                                backgroundColor:
                                chat.type === "user" ? "#DCF86" : "#F1F0F0",
                            }}
                        >
                            {chat.text}
                        </Typography>
                    ))
                )}
                <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px",
                    borderRadius: "15px",
                    backgroundColor: "#FFFFFF",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                }}
                >
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    sx={{ flexGrow: 1 }}
                />
                <Button
                    variant="contained"
                    onClick={handleSendMessage}
                    sx={{backgroundColor: "#4CAF50"}}
                >
                    Send
                </Button>
            </Box>
            </Box>
            {/* Text Box*/}
            

        </Container>
    )
}