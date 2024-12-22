import React from "react";

import {
    Container,
    Box,
    Button,
    Typography
} from "@mui/material";
import MicIcon from '@mui/icons-material/Mic';
import ChatIcon from '@mui/icons-material/Chat';




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
                    minHeight: "50vh",
                    gab: 4,
                }}
            >
                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: "bold",
                        color: "#4682B4",
                        marginBottom: 2,
                    }}
                >
                    Choose an option
                </Typography>
                <Box
                    sx={{
                        flexDirection: { xs: "column", md: "row" },
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center", 
                        gap: 5,
                    }}
                >
                    <Box
                        sx={{
                            width: 200,          
                            height: 200,         
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
                        href="/speak">
                          <MicIcon sx={{ fontSize: 70, color: "black"}} /> 
                        </Button>
                        {/* <MicIcon sx={{ fontSize: 70, color: 'black' }} /> */}

                    </Box>
                    <Box
                        sx={{
                            width: 200,           
                            height: 200,          
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
                        href="/write" >
                            <ChatIcon sx={{fontSize: 60, color: "black"}} />
                        </Button>
                        
                    </Box>
                </Box>
            </Box>
        </Container>
    )
}