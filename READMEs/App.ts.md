# Application Entry Point

The `app.ts` file serves as the main entry point for the PDR WebSocket server application. It initializes the Express server, sets up Socket.IO, and configures various middleware and routes.

## Overview

This application provides a WebSocket server for real-time prediction data distribution, with REST API endpoints for additional functionality. It uses Express.js for HTTP handling and Socket.IO for WebSocket communications.

## Core Components

### Environment Setup
- Uses `dotenv` for environment-specific configuration
- Loads environment variables from `.env.{NODE_ENV}` file
- Enables development-specific logging when in development mode

### Server Initialization
- Creates an Express application instance
- Sets up HTTP server using Node's `http` module
- Configures Socket.IO on the HTTP server
- Implements CORS protection

### Middleware Configuration
- JSON parsing middleware
- CORS checking middleware
- Error handling middleware
- API routing middleware

### Server Features

#### WebSocket Support
- Initializes Socket.IO server
- Configures WebSocket event handlers
- Manages real-time data distribution

#### REST API
- Implements API routes under `/api/v1` endpoint
- Handles JSON request bodies
- Provides error handling for API endpoints

#### Development Tools
- Conditional logging stream in development environment
- Error handling middleware for debugging
- Environment-specific configurations

## Configuration

### Environment Variables
- `NODE_ENV`: Determines environment configuration
- `PORT`: Server port number (defaults to 3000)
- Additional environment-specific variables

### Server Settings
- Default port: 3000
- API base path: `/api/v1`
- CORS configuration for security

## Usage

### Starting the Server
1. Environment configuration is loaded
2. Express app is initialized
3. Middleware is configured
4. Socket.IO server is started
5. HTTP server begins listening on configured port

### API Access
- REST endpoints available at `/api/v1/*`
- WebSocket connections handled through Socket.IO
- CORS rules apply to all connections

## Dependencies

### Primary
- Express.js for HTTP server
- Socket.IO for WebSocket support
- dotenv for configuration

### Middleware
- express.json() for request parsing
- Custom CORS checking
- Custom error handling

## Development Notes

- Development environment enables additional logging
- Error handling is configured globally
- Server provides feedback on successful startup
- All WebSocket functionality is managed through Socket.IO
