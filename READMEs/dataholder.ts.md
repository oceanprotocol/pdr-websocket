## dataHolder.ts

The `dataHolder.ts` file manages the storage and retrieval of market data received from the PDR WebSocket. Key components include:

### DataHolder Class
A generic class that manages data storage and retrieval with the following features:

#### Properties
- `data`: Private object storing arrays of generic type T indexed by string keys
- `theFixedMessage`: Public property of generic type U (extends Record<string,unknown>)

#### Methods
- `setContract(key: string, value: Array<T>)`: Sets data array for a contract key
- `getContract(key: string)`: Gets data array for a contract key
- `setItemToContract(key: string, item: T)`: Adds item to a contract's data array
- `clearContract(key: string)`: Clears data array for a contract key
- `getItemFromContractByItemKeyValue(key, itemKey, itemValue)`: Finds item in contract data by key-value pair
- `removeItemFromContractByItemKeyValue(key, itemKey, itemValues)`: Removes items from contract data by key-value pairs

### Usage
The DataHolder class is used to store prediction values and contract data received from the WebSocket provider. It provides thread-safe data storage and retrieval methods for managing real-time market data.

### Key Features
- Generic typing for flexible data storage
- Contract-based data organization
- Thread-safe operations
- Efficient data lookup and filtering
- Support for fixed messages per epoch emitter
