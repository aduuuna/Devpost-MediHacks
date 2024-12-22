"use client";
import React, {useState} from "react"

import {
  Container,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
 
} from "@mui/material";


import Head from "next/head";
import { SignedOut,  SignedIn, UserButton  } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import logo from "../public/pregnant.png"
import Image from 'next/image';


export default function Home() {
  const router = useRouter();
  return (
    <Container maxWidth="100vw" sx={{
           
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      backgroundColor: "#E6E6FA",
    
    }}>
      
        <Head>
          <title>Maternal Chat Support</title>
          <meta name="description" content="A maternal chat support system designed for pregnant women to seek assistance and guidance."/>
        </Head>
        <AppBar position="static"  width="80%" sx={{backgroundColor: " #4682B4", borderRadius: "15px", boxShadow: "0 4px 10px rgba(0,0,0,0.2)"}}>
          <Toolbar >
            <Image src={logo} alt="Logo" width={40} height={40} />
            
            <Typography variant="h6" component="div"  sx={{ flexGrow: 1, textAlign: "center",  fontWeight: "bold",
                color: "white", 
                fontWeight: "bold",
                transition: "color 0.3s ease, transform 0.3s ease", 
                "&:hover": {
                  color: "white", 
                  transform: "scale(1.1)", 
                  cursor: "pointer",
                },
              }}>
              Maternal Chat Support
            </Typography>
            <>
            <SignedOut>
                <Button
                  color="inherit"
                  sx={{ "&:hover": { color: "#D87093" } }}
                  href="/sign-in"
                >
                  Sign In
                </Button>
                <Button
                  color="inherit"
                  sx={{ "&:hover": { color: " #D87093" } }}
                  href="/sign-up"
                >
                  Sign Up
                </Button>
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </>
          </Toolbar> 
        </AppBar>
        {/* Body section */}
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
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              color: "#4682B4",
            }}
          >
            Welcome to Maternal Chat Support
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: "#333",
              lineHeight: "1.9", 
              transition: "color 0.3s ease, transform 0.3s ease", 
              "&:hover": {
                transform: "scale(1.1)", 
                cursor: "pointer",
              },
            }}
          >
            A platform designed to assist and guide pregnant women through their 
            maternal journey. Get personalized support anytime, anywhere!
          </Typography>
          <SignedIn>
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#D87093", 
                color: "#fff", 
                padding: "10px 20px",
                fontWeight: "bold",
                textTransform: "none", 
                borderRadius: "8px",
                "&:hover": {
                  backgroundColor: "#4682B4", 
                },
              }}
              href="/choose"
            >
              Get Started
            </Button>
          </SignedIn>
          <SignedOut>
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#D87093", 
                color: "#fff", 
                padding: "10px 20px",
                fontWeight: "bold",
                textTransform: "none", 
                borderRadius: "8px",
                "&:hover": {
                  backgroundColor:  "#4682B4", 
                },
              }}
              href="/sign-up"
            >
              Sign Up to Get Started
            </Button>
          </SignedOut>
        </Box>
            {/* Footer Section */}
        <Box
          component="footer"
          sx={{ bgcolor: "#E6E6FA", color: "white", py: 2, mt: "auto" }}
        >
          <Container maxWidth="lg">
            <Typography variant="body1" align="center"
               sx={{
                color: "white", 
                fontWeight: "bold",
                transition: "color 0.3s ease, transform 0.3s ease", 
                "&:hover": {
                  color: "#4682B4", 
                  transform: "scale(1.1)", 
                  cursor: "pointer",
                },
              }}
            >
              © 2024 Maternal Chat Support System. All rights reserved.
            </Typography>
          </Container>
        </Box>
    </Container>
  );
}
