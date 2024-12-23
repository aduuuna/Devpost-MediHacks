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
                    width: "90%",
                    margin: "auto", 
                    padding: { xs: "20px", sm: "40px" },
                    borderRadius: "24px",
                    backgroundColor: "rgba(255, 255, 255, 0.95)", 
                    backdropFilter: "blur(10px)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.1)", 
                    textAlign: "center", 
                    display: "flex", 
                    flexDirection: "column", 
                    alignItems: "center",
                    justifyContent: "center", 
                    gap: "40px",
                    position: "relative",
                    zIndex: 1,
                }}
            >
                <Box sx={{ mb: 2 }}>
                    <Image src={logo} alt="Logo" width={60} height={60} priority />
                </Box>

                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: "bold",
                        color: "#4682B4",
                        textAlign: "center",
                        mb: 3,
                    }}
                >
                    How would you like to chat?
                </Typography>

                <Box
                    sx={{
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        gap: { xs: 4, sm: 6 },
                        width: "100%",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    {/* Voice Chat Option */}
                    <Box
                        sx={{
                            textAlign: "center",
                            width: { xs: "100%", sm: "auto" },
                        }}
                    >
                        <Button
                            href="/speak"
                            sx={{
                                width: { xs: 160, sm: 180 },
                                height: { xs: 160, sm: 180 },
                                borderRadius: "50%",
                                backgroundColor: "#D87093",
                                transition: "all 0.3s ease",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 2,
                                '&:hover': {
                                    backgroundColor: "#4682B4",
                                    transform: "scale(1.05)",
                                    boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
                                },
                            }}
                        >
                            <MicIcon sx={{ fontSize: 50, color: "white" }} />
                            <Typography
                                sx={{
                                    color: "white",
                                    fontWeight: "bold",
                                    fontSize: "1.1rem",
                                }}
                            >
                                Voice Chat
                            </Typography>
                        </Button>
                        <Typography
                            variant="body2"
                            sx={{
                                mt: 2,
                                color: "#666",
                                maxWidth: "200px",
                                margin: "16px auto 0",
                            }}
                        >
                            Speak naturally and get instant responses
                        </Typography>
                    </Box>

                    {/* Text Chat Option */}
                    <Box
                        sx={{
                            textAlign: "center",
                            width: { xs: "100%", sm: "auto" },
                        }}
                    >
                        <Button
                            href="/write"
                            sx={{
                                width: { xs: 160, sm: 180 },
                                height: { xs: 160, sm: 180 },
                                borderRadius: "50%",
                                backgroundColor: "#4682B4",
                                transition: "all 0.3s ease",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 2,
                                '&:hover': {
                                    backgroundColor: "#D87093",
                                    transform: "scale(1.05)",
                                    boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
                                },
                            }}
                        >
                            <ChatIcon sx={{ fontSize: 50, color: "white" }} />
                            <Typography
                                sx={{
                                    color: "white",
                                    fontWeight: "bold",
                                    fontSize: "1.1rem",
                                }}
                            >
                                Text Chat
                            </Typography>
                        </Button>
                        <Typography
                            variant="body2"
                            sx={{
                                mt: 2,
                                color: "#666",
                                maxWidth: "200px",
                                margin: "16px auto 0",
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