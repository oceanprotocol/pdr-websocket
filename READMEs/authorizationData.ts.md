# Authorization Data Manager

The `AuthorizationData` class manages authorization data with automatic expiration handling and renewal capabilities. This class is designed to work with any authorization data type that extends the `BaseAuthData` interface.

## Interfaces and Types

### BaseAuthData
An interface that defines the basic structure for authorization data. It requires a `validUntil` property of type number, which represents the timestamp when the authorization expires.

### TAuthorizationData
A type definition that specifies the structure for initializing the AuthorizationData class. It includes:
- `initialData`: The starting authorization data
- `createCallback`: A function that returns a Promise resolving to new authorization data

## Class: AuthorizationData<T>

A generic class that handles authorization data lifecycle, including automatic renewal and expiration checks.

### Properties

- `validUntil`: Private property storing the expiration timestamp
- `authorizationData`: Private property storing the current authorization data
- `createCallback`: Private property storing the function to generate new authorization data

### Constructor

The constructor takes an object conforming to the TAuthorizationData type, containing initial authorization data and a callback function for creating new authorization data.

### Methods

#### isValid()
- Checks if the current authorization data is still valid
- Returns a boolean indicating validity status
- Compares current time with expiration time using 100ms units

#### isCloseToExpire()
- Determines if the authorization is approaching expiration
- Returns a boolean indicating if within 5 minutes of expiration
- Uses Unix timestamp (seconds) for comparison

#### createNew()
- Generates new authorization data using the callback
- Asynchronously updates internal state
- Updates both the authorization data and expiration time

#### getAuthorizationData()
- Retrieves current authorization data
- Automatically initiates renewal if close to expiration
- Returns the current authorization data object

## Implementation Details

### Time Handling
- Uses Unix timestamps (seconds) for expiration times
- Includes a 5-minute safety buffer for validity checks
- Standardizes time unit comparisons

### Automatic Renewal
- Transparently renews authorization when approaching expiration
- Uses non-blocking Promise-based callbacks
- Maintains continuous authorization coverage

### Type Safety
- Implements generic typing for flexibility
- Enforces BaseAuthData interface requirements
- Provides type-safe access to authorization properties

## Best Practices

### Callback Implementation
- Create idempotent callbacks
- Include comprehensive error handling
- Implement appropriate retry logic

### Expiration Management
- Set appropriate expiration timeframes
- Account for network latency
- Utilize the 5-minute buffer effectively

### Error Handling
- Monitor callback execution
- Handle renewal failures gracefully
- Implement fallback mechanisms

## Notes

- Designed for single-instance authorization management
- Automatic renewal triggers within 5-minute expiration buffer
- Uses standard Unix timestamps for all time-based operations
- Thread-safe for basic operations
- Supports various authorization data types through generic implementation