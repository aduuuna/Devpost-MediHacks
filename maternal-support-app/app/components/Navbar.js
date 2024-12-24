"use client";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { SignedOut, SignedIn, UserButton } from "@clerk/nextjs";
import Image from 'next/image';
import Link from 'next/link';
import logo from "../../public/pregnant.png";

export default function Navbar() {
  return (
    <AppBar position="fixed" sx={{ 
      backgroundColor: "rgba(255, 255, 255, 0.95)", 
      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
      backdropFilter: "blur(8px)",
      margin: { xs: "0.5rem", md: "1rem" },
      width: { xs: "calc(100% - 1rem)", md: "calc(100% - 2rem)" },
      borderRadius: { xs: "0.5rem", md: "1rem" },
    }}>
      <Toolbar 
        sx={{ 
          borderRadius: "inherit",
          minHeight: { xs: '48px', sm: '64px' },
          padding: { xs: '0 4px', sm: '0 16px' },
        }}
      >
        <Link href="/" style={{ 
          display: 'flex', 
          alignItems: 'center',
          textDecoration: 'none',
          cursor: 'pointer'
        }}>
          <Image 
            src={logo} 
            alt="Logo" 
            width={28} 
            height={28} 
            style={{ 
              width: 'auto',
              height: 'auto',
            }}
          />
          <Typography variant="h6" sx={{ 
            flexGrow: 1, 
            ml: { xs: 0.5, sm: 2 },
            color: "#4682B4",
            fontWeight: "bold",
            fontSize: { xs: '0.875rem', sm: '1.25rem' },
            '&:hover': {
              color: "#D87093",
            }
          }}>
            Maternal Chat
          </Typography>
        </Link>

        <Box sx={{ flexGrow: 1 }} />

        <SignedOut>
          <Button
            variant="outlined"
            size="small"
            sx={{ 
              mr: { xs: 0.5, sm: 2 },
              borderColor: "#4682B4",
              color: "#4682B4",
              fontSize: { xs: '0.7rem', sm: '0.875rem' },
              padding: { xs: '2px 6px', sm: '6px 16px' },
              minWidth: { xs: '60px', sm: 'auto' },
              "&:hover": { 
                borderColor: "#D87093",
                color: "#D87093"
              }
            }}
            href="/sign-in"
          >
            Sign In
          </Button>
          <Button
            variant="contained"
            size="small"
            sx={{ 
              backgroundColor: "#4682B4",
              fontSize: { xs: '0.7rem', sm: '0.875rem' },
              padding: { xs: '2px 6px', sm: '6px 16px' },
              minWidth: { xs: '60px', sm: 'auto' },
              "&:hover": { backgroundColor: "#D87093" }
            }}
            href="/sign-up"
          >
            Sign Up
          </Button>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </Toolbar>
    </AppBar>
  );
} 