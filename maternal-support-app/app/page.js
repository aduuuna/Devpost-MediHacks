"use client";
import React, { useEffect } from "react";
import AOS from 'aos';
import 'aos/dist/aos.css';
import {
  Container,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import Head from "next/head";
import { SignedOut, SignedIn, UserButton } from "@clerk/nextjs";
import Image from 'next/image';
import logo from "../public/pregnant.png";
import ChatIcon from '@mui/icons-material/Chat';
import SupportIcon from '@mui/icons-material/Support';
import SecurityIcon from '@mui/icons-material/Security';
import PregnancyImage from "../public/images/hero-bg.avif";
import SupportImage from "../public/images/hero-bg.avif";
import ExpertImage from "../public/images/hero-bg.avif";
import SecurityImage from "../public/images/hero-bg.avif";
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';

export default function Home() {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false,
      easing: 'ease-out',
    });
  }, []);

  return (
    <Container maxWidth="100vw" sx={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      backgroundColor: "#F8F9FA",
      position: "relative",
      pt: 12,
    }}>
      <Head>
        <title>Maternal Chat Support</title>
        <meta name="description" content="A maternal chat support system designed for pregnant women to seek assistance and guidance." />
      </Head>

      {/* Updated Navigation Bar */}
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
            padding: { xs: '0 8px', sm: '0 16px' },
          }}
        >
          <Image 
            src={logo} 
            alt="Logo" 
            width={32} 
            height={32} 
            style={{ 
              width: 'auto',
              height: 'auto',
            }}
          />
          <Typography variant="h6" sx={{ 
            flexGrow: 1, 
            ml: { xs: 1, sm: 2 },
            color: "#4682B4",
            fontWeight: "bold",
            fontSize: { xs: '1rem', sm: '1.25rem' },
          }}>
            Maternal Chat Support
          </Typography>
          <SignedOut>
            <Button
              variant="outlined"
              size="small"
              sx={{ 
                mr: { xs: 1, sm: 2 },
                borderColor: "#4682B4",
                color: "#4682B4",
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                padding: { xs: '4px 8px', sm: '6px 16px' },
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
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                padding: { xs: '4px 8px', sm: '6px 16px' },
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

      {/* Enhanced Hero Section - Added Stats */}
      <Box sx={{ 
        py: { xs: 6, md: 8 },
        textAlign: "center",
        background: "linear-gradient(135deg, #E6E6FA 0%, #F8F9FA 100%)",
        borderRadius: "20px",
        mb: 6,
        mx: 2,
        position: "relative",
        overflow: "hidden",
      }}>
        <Box sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          opacity: 0.5,
          zIndex: 0,
        }}>
          <Image
            src={PregnancyImage}
            alt="Background Pattern"
            layout="fill"
            objectFit="cover"
            quality={100}
          />
        </Box>
        <Box sx={{ position: "relative", zIndex: 1 }}>
          <Typography data-aos="zoom-out" variant="h3" sx={{ 
            fontWeight: "bold",
            color: "#4682B4",
            mb: 3
          }}>
            Your Trusted Pregnancy Companion
          </Typography>
          <Typography data-aos="fade-up" variant="h6" sx={{ 
            color: "white",
            mb: 4,
            maxWidth: "800px",
            mx: "auto"
          }}>
            Get personalized support and guidance throughout your maternal journey
          </Typography>
          <SignedIn>
            <Button
              variant="contained"
              size="large"
              sx={{
                backgroundColor: "#D87093",
                padding: "12px 30px",
                fontSize: "1.1rem",
                "&:hover": { backgroundColor: "#4682B4" }
              }}
              href="/choose"
            >
              Get Started
            </Button>
          </SignedIn>
          <SignedOut>
            <Button
              variant="contained"
              size="large"
              sx={{
                backgroundColor: "#D87093",
                padding: "12px 30px",
                fontSize: "1.1rem",
                "&:hover": { backgroundColor: "#4682B4" }
              }}
              href="/sign-up"
            >
              Join Now
            </Button>
          </SignedOut>
        </Box>
      </Box>

      {/* New Technology Stack Section */}
      <Box sx={{ mb: 6, px: 2 }}>
        <Typography variant="h4" sx={{ 
          textAlign: 'center', 
          mb: 4,
          color: "#4682B4",
          fontWeight: "bold"
        }}>
          Powered by Cutting-Edge Technology
        </Typography>
        <Grid container spacing={3} justifyContent="center">
          {[
            { 
              icon: <SmartToyIcon sx={{ fontSize: 40 }}/>, 
              label: "Google Gemini AI", 
              desc: "Advanced language model for accurate responses",
              animation: "fade-right"
            },
            { 
              icon: <VolumeUpIcon sx={{ fontSize: 40 }}/>, 
              label: "Text-to-Speech", 
              desc: "Voice interaction for accessibility",
              animation: "fade-up"
            },
            { 
              icon: <HealthAndSafetyIcon sx={{ fontSize: 40 }}/>, 
              label: "Clerk Auth", 
              desc: "Secure user authentication",
              animation: "fade-up"
            },
            { 
              icon: <AccessibilityNewIcon sx={{ fontSize: 40 }}/>, 
              label: "Accessibility", 
              desc: "WCAG compliant design",
              animation: "fade-left"
            }
          ].map((tech, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card 
                data-aos={tech.animation}
                data-aos-delay={index * 100}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  p: 2,
                  backgroundColor: 'rgb(255, 255, 255)',
                  border: '1px solid rgba(70, 130, 180, 0.1)',
                  boxShadow: '2px 2px 10px rgba(0,0,0,0.1)',
                }}
              >
                <Box sx={{ 
                  color: "#4682B4",
                  mb: 2,
                }}>
                  {tech.icon}
                </Box>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: "bold" }}>
                  {tech.label}
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center">
                  {tech.desc}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Enhanced Features Section - Added images */}
      <Box sx={{ mb: 6, px: 2 }}>
        <Typography variant="h4" sx={{ 
          textAlign: 'center', 
          mb: 2,
          mt: 4,
          color: "#4682B4",
          fontWeight: "bold"
        }}>
          Features and Services 
        </Typography>
      <Grid container spacing={4} sx={{ px: 2, mb: 6 }}>
        <Grid item xs={12} md={4}>
          <Card 
            data-aos="flip-left"
            data-aos-delay="100"
            sx={{ 
              height: '100%',
              transition: 'all 0.3s ease',
              '&:hover': { 
                transform: 'translateY(-5px)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
              },
              borderRadius: '16px',
              overflow: 'hidden',
            }}
          >
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <ChatIcon sx={{ 
                fontSize: 50, 
                color: "#4682B4", 
                mb: 2,
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
              }} />
              <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
                24/7 Support
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Access instant support through text or voice chat whenever you need it.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card 
            data-aos="flip-left"
            data-aos-delay="200"
            sx={{ 
              height: '100%',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-5px)' }
            }}
          >
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <SupportIcon sx={{ fontSize: 50, color: "#D87093", mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
                Expert Guidance
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Receive reliable information and support from our AI-powered system.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card 
            data-aos="flip-left"
            data-aos-delay="300"
            sx={{ 
              height: '100%',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-5px)' }
            }}
          >
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <SecurityIcon sx={{ fontSize: 50, color: "#4682B4", mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
                Private & Secure
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Your privacy matters. All conversations are completely confidential.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      </Box>

      {/* Enhanced Footer */}
      <Box 
        component="footer" 
        sx={{ 
          bgcolor: "#E6E6FA",
          color: "#4682B4",
          py: 3,
          mt: "auto",
          borderTopLeftRadius: "20px",
          borderTopRightRadius: "20px",
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body1" align="center" sx={{ fontWeight: "500" }}>
            © 2024 Maternal Chat Support System. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Container>
  );
}