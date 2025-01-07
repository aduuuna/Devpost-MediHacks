
"use client";
import { useState, useEffect } from "react";
import { Container, Box, Typography, Button, Card } from "@mui/material";
import MicIcon from '@mui/icons-material/Mic';
import ChatIcon from '@mui/icons-material/Chat';
import Image from 'next/image';
import logo from "../../public/pregnant.png";

export default function ChoosePage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }
    
    return (
        <Container
            disableGutters
            maxWidth={false} 
            sx={{
                height: "100vh", 
                width: "100%", 
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                background: "linear-gradient(135deg, #E6E6FA 0%, #F8F9FA 100%)",
                position: "relative",
                overflow: "hidden", 
                px: 0,
            }}
        >
            {/* Background Pattern */}
            <Box 
                sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    opacity: 0.08,
                    background: "radial-gradient(circle at 25px 25px, #4682B4 2%, transparent 0%), radial-gradient(circle at 75px 75px, #D87093 2%, transparent 0%)",
                    backgroundSize: "100px 100px",
                    zIndex: 0,
                }}
            />

            <Box
                sx={{
                    width: "100%",
                    maxWidth: "800px",
                    mx: "auto",
                    px: { xs: 3, sm: 4 }, 
                    py: { xs: 2, sm: 3 },
                }}
            >
                <Card
                    sx={{
                        width: "85%",
                        
                        padding: { xs: "20px 16px", sm: "28px", md: "32px" }, 
                        borderRadius: "24px",
                        backgroundColor: "rgba(255, 255, 255, 0.97)",
                        backdropFilter: "blur(12px)",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                        textAlign: "center",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: { xs: "16px", sm: "24px" }, 
                        position: "relative",
                        zIndex: 1,
                        transition: "transform 0.3s ease",
                        "&:hover": {
                            transform: "translateY(-4px)",
                        },
                    }}
                >
                    <Box 
                        sx={{ 
                            animation: "float 3s ease-in-out infinite",
                            "@keyframes float": {
                                "0%, 100%": { transform: "translateY(0)" },
                                "50%": { transform: "translateY(-10px)" },
                            },
                        }}
                    >
                        <Image 
                            src={logo} 
                            alt="Logo" 
                            width={48} 
                            height={48} 
                            priority 
                            style={{
                                maxWidth: '48px',
                                maxHeight: '48px',
                                width: '48px',
                                height: '48px',
                            }}
                        />
                    </Box>

                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 700,
                            color: "#4682B4",
                            textAlign: "center",
                            fontSize: { xs: "1.5rem", sm: "2rem" },
                            letterSpacing: "-0.02em",
                        }}
                    >
                        How would you like to chat?
                    </Typography>

                    <Box sx={{
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        gap: { xs: 3, sm: 6 }, 
                        width: "100%",
                        justifyContent: "center",
                        alignItems: "center",
                        my: { xs: 1, sm: 2 }, 
                    }}>
                        {/* Voice Chat Option */}
                        <ChatOption 
                            icon={<MicIcon sx={{ fontSize: { xs: 28, sm: 32 }, color: "white" }} />}
                            title="Voice Chat"
                            description="Speak naturally and get instant responses"
                            href="/speak"
                            bgColor="#D87093"
                            hoverColor="#4682B4"
                        />

                        {/* Text Chat Option */}
                        <ChatOption 
                            icon={<ChatIcon sx={{ fontSize: { xs: 28, sm: 32 }, color: "white" }} />}
                            title="Text Chat"
                            description="Type your questions and concerns"
                            href="/write"
                            bgColor="#4682B4"
                            hoverColor="#D87093"
                        />
                    </Box>
                </Card>
            </Box>
        </Container>
    );
}

// ChatOption component with reduced sizes
const ChatOption = ({ icon, title, description, href, bgColor, hoverColor }) => (
    <Box sx={{
        textAlign: "center",
        width: { xs: "100%", sm: "auto" },
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    }}>
        <Button
            href={href}
            sx={{
                width: { xs: 90, sm: 120 }, 
                height: { xs: 90, sm: 120 }, 
                borderRadius: "50%",
                backgroundColor: bgColor,
                transition: "all 0.3s ease",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: { xs: 1, sm: 1.5 },
                '&:hover': {
                    backgroundColor: hoverColor,
                    transform: "scale(1.05)",
                    boxShadow: "0 12px 28px rgba(0,0,0,0.15)",
                },
            }}
        >
            {icon}
            <Typography sx={{
                color: "white",
                fontWeight: "bold",
                fontSize: { xs: "0.85rem", sm: "0.95rem" }, 
            }}>
                {title}
            </Typography>
        </Button>
        <Typography
            variant="body2"
            sx={{
                mt: 1.5,
                color: "#555",
                maxWidth: { xs: "140px", sm: "160px" }, 
                fontSize: { xs: "0.75rem", sm: "0.85rem" }, 
                lineHeight: 1.4,
            }}
        >
            {description}
        </Typography>
    </Box>
);



