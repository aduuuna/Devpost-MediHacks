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


export default function Home() {
  const router = useRouter();
  return (
    <>
      <Box  
        sx={{
            flexGrow: 1,
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#E6E6FA",
          }}
        >
        <Head>
          <title>Maternal Chat Support</title>
          <meta name="description" content="A maternal chat support system designed for pregnant women to seek assistance and guidance."/>
        </Head>
        <AppBar position="static"  width="100%" sx={{backgroundColor: " #4682B4"}}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{flexGrow: 1, textAlign: "left",  fontWeight: "bold" }}>
              Maternal Chat Support
            </Typography>
            <>
            <SignedOut>
                <Button
                  color="inherit"
                  sx={{ "&:hover": { color: "#FAEBEFFF" } }}
                  href="/sign-in"
                >
                  Sign In
                </Button>
                <Button
                  color="inherit"
                  sx={{ "&:hover": { color: " #FAEBEFFF" } }}
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

      </Box>
    </>
  );
}
