"use client";
import { Container, Box } from "@mui/material";
import { SignIn } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      sx={{ minHeight: "100vh", backgroundColor: "#FAEBEFFF" }}
    >
      <Box
        sx={{
          textAlign: "center",
          alignItems: "center",
          justifyContent: "center",
          display: "flex",
          flexDirection: "column",
          padding: "20px",
          marginTop: "20px",
        }}
      >
        <SignIn />
      </Box>
    </Box>
  );
}