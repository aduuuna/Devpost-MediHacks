"use client";
import { Container, Box, Typography, Button, Card } from "@mui/material";
import MicIcon from '@mui/icons-material/Mic';
import ChatIcon from '@mui/icons-material/Chat';
import Image from 'next/image';
import logo from "../../public/pregnant.png";

export default function ChoosePage() {
    return (
        <Container
            maxWidth="100vw" 
            sx={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                background: "linear-gradient(135deg, #E6E6FA 0%, #F8F9FA 100%)",
                position: "relative",
                overflow: "hidden",
                px: { xs: 3, sm: 3 },
            }}
        >
            {/* Background Pattern */}
            <Box sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                opacity: 0.1,
                background: "radial-gradient(circle at 25px 25px, #4682B4 2%, transparent 0%), radial-gradient(circle at 75px 75px, #D87093 2%, transparent 0%)",
                backgroundSize: "100px 100px",
                zIndex: 0,
            }} />

            <Card
                sx={{
                    maxWidth: "800px",
                    width: { xs: "90%", sm: "100%" },
                    margin: "auto",
                    padding: { xs: "32px 16px", sm: "40px" },
                    borderRadius: { xs: "20px", sm: "24px" },
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(10px)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: { xs: "24px", sm: "40px" },
                    position: "relative",
                    zIndex: 1,
                    minHeight: { xs: "70vh", sm: "auto" },
                    my: { xs: 4, sm: 0 },
                }}
            >
                <Box sx={{ mb: { xs: 1, sm: 2 } }}>
                    <Image 
                        src={logo} 
                        alt="Logo" 
                        width={48} 
                        height={48} 
                        priority 
                    />
                </Box>

                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: "bold",
                        color: "#4682B4",
                        textAlign: "center",
                        mb: { xs: 2, sm: 3 },
                        fontSize: { xs: "1.5rem", sm: "2rem" },
                    }}
                >
                    How would you like to chat?
                </Typography>

                <Box sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    gap: { xs: 6, sm: 6 },
                    width: "100%",
                    justifyContent: "center",
                    alignItems: "center",
                    flex: { xs: 1, sm: "none" },
                    my: { xs: "auto", sm: 0 },
                }}>
                    {/* Voice Chat Option */}
                    <Box sx={{
                        textAlign: "center",
                        width: { xs: "100%", sm: "auto" },
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                    }}>
                        <Button
                            href="/speak"
                            sx={{
                                width: { xs: 120, sm: 180 },
                                height: { xs: 120, sm: 180 },
                                borderRadius: "50%",
                                backgroundColor: "#D87093",
                                transition: "all 0.3s ease",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: { xs: 1, sm: 2 },
                                '&:hover': {
                                    backgroundColor: "#4682B4",
                                    transform: "scale(1.05)",
                                    boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
                                },
                            }}
                        >
                            <MicIcon sx={{ 
                                fontSize: { xs: 36, sm: 50 },
                                color: "white" 
                            }} />
                            <Typography sx={{
                                color: "white",
                                fontWeight: "bold",
                                fontSize: { xs: "0.9rem", sm: "1.1rem" },
                            }}>
                                Voice Chat
                            </Typography>
                        </Button>
                        <Typography
                            variant="body2"
                            sx={{
                                mt: { xs: 2, sm: 2 },
                                color: "#666",
                                maxWidth: { xs: "200px", sm: "200px" },
                                margin: "16px auto 0",
                                fontSize: { xs: "0.8rem", sm: "0.875rem" },
                            }}
                        >
                            Speak naturally and get instant responses
                        </Typography>
                    </Box>

                    {/* Text Chat Option */}
                    <Box sx={{
                        textAlign: "center",
                        width: { xs: "100%", sm: "auto" },
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                    }}>
                        <Button
                            href="/write"
                            sx={{
                                width: { xs: 120, sm: 180 },
                                height: { xs: 120, sm: 180 },
                                borderRadius: "50%",
                                backgroundColor: "#4682B4",
                                transition: "all 0.3s ease",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: { xs: 1, sm: 2 },
                                '&:hover': {
                                    backgroundColor: "#D87093",
                                    transform: "scale(1.05)",
                                    boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
                                },
                            }}
                        >
                            <ChatIcon sx={{ 
                                fontSize: { xs: 36, sm: 50 },
                                color: "white" 
                            }} />
                            <Typography sx={{
                                color: "white",
                                fontWeight: "bold",
                                fontSize: { xs: "0.9rem", sm: "1.1rem" },
                            }}>
                                Text Chat
                            </Typography>
                        </Button>
                        <Typography
                            variant="body2"
                            sx={{
                                mt: { xs: 2, sm: 2 },
                                color: "#666",
                                maxWidth: { xs: "200px", sm: "200px" },
                                margin: "16px auto 0",
                                fontSize: { xs: "0.8rem", sm: "0.875rem" },
                            }}
                        >
                            Type your questions and concerns
                        </Typography>
                    </Box>
                </Box>
            </Card>
        </Container>
    );
}