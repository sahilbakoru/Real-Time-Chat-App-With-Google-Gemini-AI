
![Screenshot 2025-03-24 at 1 31 21 PM](https://github.com/user-attachments/assets/b27133c5-81d5-469e-bc85-6b0a2247fbba)

**Overview**
------------

The Chat App is a real-time chat application where users can join a global chatroom, send messages, and interact with a Gemini chatbot. It uses Socket.io for real-time communication and MongoDB for message persistence.

Setup
-----

1.  Clone the Repository (if not already done):git clone cd
    
2.  Install Dependencies:Navigate to the project root and install the required packages:npm install
    
3.  Set Up Environment Variables:Create a .env file in the root directory and add your Gemini API key:GEMINI\_API\_KEY=your\_gemini\_api\_key
    
    *   Get your Gemini API key from Google Generative AI ([https://ai.google.dev/](https://ai.google.dev/)).
        
4.  Start MongoDB (if using persistent storage):Ensure MongoDB is running locally or update the connection string in server.js to point to your MongoDB instance.
    
5.  Run the Application:
    
    *   Start the backend:node server.js
        
    *   In a separate terminal, start the frontend:npm start
        

Usage
-----

*   Open [localhos**t:30**01](localhost:3001) in your browser.
    
*   Enter a username to join the chat.
    
*   Send messages in the global chatroom.
    
*   Use keywords like "support", or "help" to interact with the Gemini chatbot.
    

File Structure
--------------

*   server.js: Backend server with Socket.io, MongoDB, and Gemini API integration.
    
*   src/App.jsx: Frontend React component for the chat interface.
    
*   src/index.css: Custom CSS with Tailwind animations.
