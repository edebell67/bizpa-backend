# Use Node.js LTS version
FROM node:20-slim

# Create app directory
WORKDIR /usr/src/app

# Copy backend package files first for better caching
COPY backend/package*.json ./backend/

# Install backend dependencies
WORKDIR /usr/src/app/backend
RUN npm install --production

# Copy the rest of the backend source code
WORKDIR /usr/src/app
COPY backend/ ./backend/

# Set working directory to backend for the start command
WORKDIR /usr/src/app/backend

# Expose the port the app runs on
EXPOSE 5055

# Start the application
CMD [ "npm", "start" ]
