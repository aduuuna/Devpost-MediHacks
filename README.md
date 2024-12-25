# Maternal Support Communication App

This repository contains the codebase for a **Maternal Support Communication Web Application**, designed to provide thoughtful support, discussion, and case management for expecting mothers, especially in low-resource environments. The application enables interaction via text and voice, ensuring inclusivity and accessibility.

## Features

- **Text and Voice Interaction**: Users can interact with the system using text or voice input.
- **Secure Messaging**: Facilitates private and group text-based discussions.
- **Aggregate Communication**: Provides an admin view to manage and monitor aggregated messages.
- **Low-Resource Optimization**: Designed for users with limited internet access or expensive mobile plans.
- **Data Privacy and Security**: Adheres to healthcare guidelines on data security and privacy.

## Technologies Used

- **Frontend**: [Next.js](https://nextjs.org/) for building a scalable and dynamic user interface.
- **Backend**: [Gemini API](https://gemini-docs-link.com) for handling AI-driven conversations.
- **Styling**: [Material UI](https://mui.com/) for responsive and accessible design.
- **Authentication**: [Clerk](https://clerk.com)  secure authentication provider to ensure user privacy.
-- **Database Management**: [Firebase](https://firebase.google.com) reliable and scalable database management system for storing and managing data in real-time.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/aduuuna/Devpost-MediHacks.git
   cd maternal-support-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file to store your API keys and environment variables:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_next_public_api_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to view the app.

## Usage

1. **Sign Up/Log In**: Users can sign up or log in to access their dashboard.
2. **Initiate Conversations**: Start a conversation by typing a message or using voice input.
3. **Admin Dashboard**: Admins can view and manage aggregated messages and group conversations.

## Project Structure

```
├── public/
├── app/
│   ├── api/
│   │   └── generate/
│   │       └── route.js
│   ├── choose/
│   │   └── page.js
│   ├── components/
│   │   └── Navbar.js
│   ├── sign-in/
│   │   └── [[...sign-in]]/
│   │       └── page.js
│   ├── sign-out/
│   │   └── [[...sign-out]]/
│   │       └── page.js
│   ├── speak/
│   │   └── page.js
│   ├── write/
│   │   └── page.js
│   ├── layout.js
│   └── page.js
│
├── .env.local
├── README.md
├── package.json
└── middleware.ts

```

## API Integration

### Gemini API
- Used for AI-powered conversations.
- [Documentation Link](https://gemini-docs-link.com)

### Clerk Integration
- Clerk manages user authentication.
- [Documentation Link](https://clerk.com/docs)

## Firebase Integration
- Firebase offers cloud-based services, including database management and storage solutions.
-[Documentation Link](https://firebase.google.com/docs)

## Legal and Ethical Considerations

- Ensure compliance with [GDPR](https://gdpr-info.eu/) and [HIPAA](https://www.hhs.gov/hipaa/index.html) standards for data security and privacy.
- Collect user consent before handling sensitive information.

## Future Enhancements

- **Offline Mode**: Allow users to save messages and sync them when online.
- **Multilingual Support**: Add support for multiple languages to cater to diverse users.
- **AI Assistant**: Provide proactive guidance for expecting mothers using AI.

## Contributing

We welcome contributions! To contribute:
1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add your feature description"
   ```
4. Push to the branch:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Open a pull request.

## License

This project is licensed under the [MIT License](LICENSE).

## Contact

For any inquiries or support, please contact:
- **Name**: Joy Owusu Ansah
- **Email**: owusujoyansah@gmail.com

- **Name**: Gabriel Kwame Addo Quainoo
- **Email**: gkaquainoo@gmail.com

- **Name**: Dickson Daniel Peprah
- **Email**: techpepson@gmail.com

- **Name**: Bawah Josephus
- **Email**: bawahjosephus67@gmail.com
---

Start building a supportive environment for expecting mothers, one interaction at a time!

