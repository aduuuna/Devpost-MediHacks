import { ClerkProvider } from "@clerk/nextjs";


export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
      <body
          style={{
            margin: 0,     
            padding: 0,      
            boxSizing: "border-box", 
            width: "100vw", 
            height: "100vh", 
            overflowX: "hidden",
          }}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}