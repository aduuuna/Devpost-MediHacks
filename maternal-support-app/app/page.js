"use client";
import React, {useState} from "react"

import {
  Container,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar
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
            
            <Typography variant="h6" component="div" sx={{flexGrow: 1, textAlign: "center",  fontWeight: "bold" }}>
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
    </Container>
  );
}
