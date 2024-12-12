# Provider Listener

The Provider Listener is a core component that manages blockchain event listening and subscription management for prediction contracts. It handles real-time data updates and authorization management for the WebSocket server.

## Overview

The provider listener initializes and maintains connections to prediction contracts, manages subscriptions, and broadcasts updates to connected clients through Socket.IO.

## Main Components

### Types

#### TProviderListenerArgs
Configuration object for initializing the provider listener:
- `io`: Socket.IO server instance
- `contractAddresses`: Array of prediction contract addresses to monitor
- `epochEmitterName`: Enum value specifying the type of epoch events to emit

#### TProviderListenerEmitData
Structure of data emitted to clients:
- Array of objects containing:
  - `predictions`: Array of prediction results with epochs and contract addresses
  - `contractInfo`: Associated prediction contract information

### Core Functionality

#### Initialization
- Sets up network provider connection
- Retrieves interesting prediction contracts
- Initializes authorization
- Sets up contract instances
- Creates data holders for subscribed predictoors

#### Block Monitoring
- Listens to new blocks on the blockchain
- Calculates current epochs
- Manages subscription renewals
- Fetches and processes prediction values
- Broadcasts updates to connected clients

### Key Features

#### Subscription Management
- Automatically renews expiring subscriptions
- Tracks active subscription transactions
- Prevents duplicate subscription attempts
- Maintains subscription state across block updates

#### Data Processing
- Calculates prediction epochs
- Aggregates prediction values
- Clears outdated prediction data
- Updates data holders with new information

#### Event Broadcasting
- Emits 'newEpoch' events with updated predictions
- Maintains fixed messages for each epoch
- Provides contract information with predictions

## Technical Details

### State Management
- Tracks latest processed epoch
- Maintains list of started transactions
- Manages subscribed predictoor contracts

### Time Handling
- Uses block timestamps for epoch calculations
- Implements delay for prediction fetching
- Handles seconds-per-epoch timing

### Error Prevention
- Prevents duplicate subscription transactions
- Validates subscription expiration
- Manages transaction state cleanup

## Usage Notes

- Requires proper initialization of network provider
- Depends on valid contract addresses
- Needs Socket.IO server instance
- Requires proper authorization setup
- Must be configured with correct epoch emitter name

## Dependencies

- Socket.IO for real-time communication
- Ethereum provider for blockchain interaction
- Authorization system for secure data access
- Data holders for state management
- Contract interfaces for blockchain interaction
