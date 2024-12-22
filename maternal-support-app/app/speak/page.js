import React from "react";
import {
    Container,
    Box,
    Button,
    Typography
} from "@mui/material";
import logo from "../../public/pregnant.png"
import Image from 'next/image';
import MicIcon from '@mui/icons-material/Mic';

export default function SpeakPage() {
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
                  <Typography variant="body1" sx={{color: "black"}}>Hold to record...</Typography>  
                </Box>
                <Box>
                    <Image src={logo} alt="Logo" width={80} height={80} />
                </Box>
                <Box
                        sx={{
                            width: 100,          
                            height: 100,         
                            backgroundColor: "#D87093",  
                            borderRadius: "50%",  
                            display: "flex",     
                            justifyContent: "center",
                            alignItems: "center",
                            color: "white",       
                            fontSize: 20,        
                        }}
                    >
                        <Button 
                         sx={{
                            padding: "20px",
                            fontWeight: "bold",
                            textTransform: "none", 
                            borderRadius: "50%",
                            
                          }}
                        href="">
                          <MicIcon sx={{ fontSize: 40, color: "black"}} /> 
                        </Button>
                      
                    </Box>
            </Box>

        </Container>
    )
}