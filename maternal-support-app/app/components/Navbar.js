"use client";
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem } from "@mui/material";
import { SignedOut, SignedIn, UserButton } from "@clerk/nextjs";
import Image from 'next/image';
import Link from 'next/link';
import MenuIcon from '@mui/icons-material/Menu';
import logo from "../../public/pregnant.png";
import { useState } from 'react';

export default function Navbar() {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="fixed" sx={{ 
      backgroundColor: "rgba(255, 255, 255, 0.95)", 
      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
      backdropFilter: "blur(8px)",
      margin: { xs: "0.5rem", md: "1rem" },
      width: { xs: "calc(100% - 1rem)", md: "calc(100% - 2rem)" },
      borderRadius: { xs: "0.5rem", md: "1rem" },
      maxWidth: "100%",
    }}>
      <Toolbar 
        sx={{ 
          borderRadius: "inherit",
          minHeight: { xs: '48px', sm: '64px' },
          padding: { xs: '0 8px', sm: '0 16px' },
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'nowrap',
        }}
      >
        <Link href="/" style={{ 
          display: 'flex', 
          alignItems: 'center',
          textDecoration: 'none',
          cursor: 'pointer',
          minWidth: 0,
        }}>
          <Image 
            src={logo} 
            alt="Logo" 
            width={24} 
            height={24} 
            style={{ 
              width: '24px',
              height: '24px',
              flexShrink: 0,
            }}
          />
          <Typography 
            variant="h6" 
            noWrap
            sx={{ 
              ml: { xs: 0.5, sm: 1 },
              color: "#4682B4",
              fontWeight: "bold",
              fontSize: { xs: '1rem', sm: '1.5rem' },
              '&:hover': {
                color: "#D87093",
              }
            }}
          >
            Maternal Chat Support
          </Typography>
        </Link>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <SignedOut>
            {/* Desktop view */}
            <Box sx={{ 
              display: { xs: 'none', md: 'flex' },
              gap: '8px'
            }}>
              <Button
                variant="outlined"
                size="small"
                sx={{ 
                  borderColor: "#4682B4",
                  color: "#4682B4",
                  fontSize: '0.875rem',
                  padding: '6px 16px',
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
                  fontSize: '0.875rem',
                  padding: '6px 16px',
                  "&:hover": { backgroundColor: "#D87093" }
                }}
                href="/sign-up"
              >
                Sign Up
              </Button>
            </Box>

            {/* Mobile view */}
            <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
              <IconButton
                size="large"
                onClick={handleMenu}
                color="inherit"
                sx={{ color: "#4682B4" }}
              >
                <MenuIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                sx={{
                  '& .MuiPaper-root': {
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(8px)",
                    borderRadius: "0.5rem",
                    marginTop: "0.5rem",
                  }
                }}
              >
                <MenuItem onClick={handleClose}>
                  <Link href="/sign-in" style={{ 
                    textDecoration: 'none', 
                    color: "#4682B4",
                    width: '100%',
                  }}>
                    Sign In
                  </Link>
                </MenuItem>
                <MenuItem onClick={handleClose}>
                  <Link href="/sign-up" style={{ 
                    textDecoration: 'none', 
                    color: "#4682B4",
                    width: '100%',
                  }}>
                    Sign Up
                  </Link>
                </MenuItem>
              </Menu>
            </Box>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </Box>
      </Toolbar>
    </AppBar>
  );
} 