# @elizaos/plugin-web3-connector

A plugin for ElizaOS that provides creative storage solutions using Filecoin, IPFS, and cutting-edge integrations such as the Model Context Protocol (MCP) paired with the Flare Data Connector (FDC). This package also leverages custom UI components built with React and Tauri, and exposes high-performance WASM modules for decentralized AI workflows.

## Overview

This plugin serves as a central hub for:
- **Decentralized Storage & Blockchain Integration:**  
  Utilize Filecoin for encrypted backups and robust data storage, and IPFS for fast and reliable data sharing.
  
- **Dynamic AI Contextualization via MCP:**  
  Enable AI models to receive real-time, context-rich data—including voice annotations, playlists, and wallet transaction events—by harnessing MCP to standardize external inputs.
  
- **Secure Data Validation with FDC:**  
  Before any external data informs an AI process, it passes through the Flare Data Connector (FDC) using JSON-RPC 2.0, ensuring authenticity and mitigating tampering risks.

- **Integrated UI System:**  
  A flexible UI built on React (with support from React Router) and Tauri that allows users to visually interact with decentralized data, manage storage, and monitor AI-driven workflows. This UI system is closely tied to backend functionalities, with build commands that compile Rust-based WASM modules for performance-critical tasks.

### High-Level Architecture

```plaintext
             +---------------------------+
             |      User Interface       |
             |  (React + Tauri Desktop)  |
             +-------------+-------------+
                           │
                           ▼
             +---------------------------+
             |    MCP-Enabled AI Engine  |
             |   (Dynamic Data Context)  |
             +-------------+-------------+
                           │
                +----------+----------+
                │                     │
          +-----▼-----+         +-----▼------+
          | Filecoin  |         |  Wallet    |
          | & IPFS    |         |Integration |
          +-----------+         +------------+
                           │
                           ▼
             +---------------------------+
             | Flare Data Connector (FDC)|
             |   (Data Validation)       |
             +---------------------------+
```

This architecture demonstrates how the plugin unifies decentralized storage, live data contextualization, and secure external validation—all while ensuring a smooth user experience through its integrated UI.

## Features

- **Decentralized Storage:**  
  Save and backup data securely using Filecoin and IPFS.

- **Real-Time AI Context:**  
  The MCP integration delivers live context—such as interactive voice recordings, dynamic playlists, and authenticated wallet data—directly into AI workflows.

- **Secure Data Validation:**  
  FDC verifies all incoming external data via JSON-RPC 2.0 to ensure integrity before consumption by AI models.

- **UI Integration:**  
  A rich UI system built with modern frameworks (React and Tauri) that provides users with a seamless interface to interact with decentralized data and monitor performance.

- **WASM for Performance:**  
  Critical portions of the system are compiled to WebAssembly using Rust and wasm-pack, ensuring high performance in decentralized operations.

## Prerequisites

- **Rust:** Install via [rustup](https://rustup.rs/).
- **wasm-pack:** Install with `cargo install wasm-pack`.
- **Node.js:** v14+ recommended.
- **npm:** For managing dependencies.
- **Docker & Kubernetes:** Recommended for containerization and scalable deployment (optional but encouraged).

## Installation

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/jhead12/elizaos-plugins/plugin-filecoin
   cd packages/plugin-filecoin
   ```
   *(Note: This repository also hosts the `@elizaos/plugin-web3-connector` which integrates the UI components and backend functionalities.)*

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Build the Plugin:**
   ```bash
   npm run build
   ```
   This command compiles the TypeScript code and moves the necessary assets into the `dist` folder.

## Environment Variables

Create a `.env` file at the root of your project and add the following:

```plaintext
# Database & Encryption
DB_DIALECT=postgres
DATABASE_URL=your_database_url
ENCRYPTION_KEY=your_32_byte_key_here
STORACHA_CLIENT_CONFIG=your_storacha_client_config

# MCP & FDC Configuration
MCP_SERVER_URL=https://mcp.yourdomain.com/api
MCP_CLIENT_ID=your_client_id
MCP_CLIENT_SECRET=your_client_secret
MCP_FDC_URL=https://flare.network/products/flare-data-connector
```

Load these variables in your Node.js entry file (e.g., `src/index.ts`):

```javascript
require('dotenv').config();
console.log(process.env.DB_DIALECT);
console.log(process.env.DATABASE_URL);
// Additional logs for debug purposes
```

## MCP & FDC Integration Details

### How It Works

- **MCP-Enabled AI Engine:**  
  The plugin communicates with an MCP module that dynamically retrieves live context data—such as voice inputs, playlist updates, and wallet transactions—for AI processing.

- **Flare Data Connector (FDC):**  
  FDC validates all external data using secure JSON-RPC 2.0 calls. This layer of validation ensures that every data point used for decision-making is authentic and untampered.

### Security & Token Management

- **Secure Environment Variables:**  
  Store sensitive credentials (e.g., `MCP_CLIENT_SECRET`) in a secure vault (e.g., AWS Secrets Manager, HashiCorp Vault).

- **Token Rotation & Expiration:**  
  Follow policies to regularly rotate tokens, and utilize short-lived tokens to minimize exposure.

- **Encrypted Communication:**  
  Always use HTTPS/TLS for API calls to FDC, and consider mutual TLS for additional client/server authentication.

- **Access Control:**  
  Implement least privilege for API tokens and regularly audit your access configurations.

- **Logging and Monitoring:**  
  Integrate monitoring tools to log authentication attempts and set up alerts for suspicious activities.

## UI System & WASM Integration

### Building the UI

The UI is a core component of the plugin, allowing users to interact with decentralized storage and monitor live data flows. It is built with React and powered by Tauri for a native-like desktop experience.

- **Development Build:**
  ```bash
  npm run build:ui:dev
  ```
- **Production Build:**
  ```bash
  npm run build:ui
  ```

### Building WASM Modules

The plugin uses Rust and wasm-pack to compile performance-critical components into WebAssembly.

- **WASM Build (Release):**
  ```bash
  npm run build:wasm
  ```
- **WASM Build (Development):**
  ```bash
  npm run build:wasm:dev
  ```

## Usage Example

Below is a sample integration that demonstrates initializing the system, performing a secure backup using Filecoin, and retrieving validated, context-heavy data:

```javascript
import { 
  initialize, 
  backupDataLocal, 
  filecoinRsRestoreFunction, 
  requestValidatedData 
} from './dist/index';

async function run() {
  // Initialize the system (MCP, FDC, decentralized storage, and UI)
  await initialize();

  // Perform an encrypted backup using Filecoin
  const backup = await backupDataLocal({ encrypted: true });
  console.log(`Backup CID: ${backup.metadata.path}`);

  // Request validated contextual data via the MCP-FDC integration
  const contextData = await requestValidatedData({
    endpoint: 'playlistData',
    parameters: { userId: 'USER_ID' }
  });
  console.log(`Validated Data: ${JSON.stringify(contextData)}`);

  // Restore the backup as an example usage
  const restored = await filecoinRsRestoreFunction({
    backupPath: backup.metadata.path,
    destinationPath: 'dest/path',
    decryptionKey: 'your_key'
  });
  console.log(`Restore success: ${restored}`);
}

run();
```

## Build Targets

- **Native Build:**
  ```bash
  cd filecoin-rs && cargo build
  ```

- **WASM Build (Single-threaded Runtime):**
  ```bash
  cd filecoin-rs && cargo build --target wasm32-unknown-unknown --features wasm
  ```

- **Web Target:**
  ```bash
  cd filecoin-rs && wasm-pack build --target nodejs --out-dir pkg
  ```

## Deployment & Scaling

### Using Docker

Containerize the updated MCP module and UI system alongside the Filecoin integration:

```bash
docker build -t elizaos/plugin-mcp ./packages/plugin-mcp
docker-compose up -d
```

### Kubernetes Deployment Example

`k8s/mcp-deployment.yaml`:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mcp-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: mcp-server
  template:
    metadata:
      labels:
        app: mcp-server
    spec:
      containers:
      - name: mcp
        image: elizaos/plugin-mcp:latest
        ports:
        - containerPort: 8080
        env:
        - name: MCP_SERVER_URL
          valueFrom:
            configMapKeyRef:
              name: mcp-config
              key: api_url
        - name: MCP_CLIENT_SECRET
          valueFrom:
            secretKeyRef:
              name: mcp-secrets
              key: client_secret
```

## Testing & Linting

- **Run Tests:**
  ```bash
  npm run test
  ```
- **Lint the Code:**
  ```bash
  npm run lint
  ```

## Contributing

Fork the repository and submit pull requests on [GitHub](https://github.com/jhead12/elizaos-plugins/plugin-filecoin). Contributions, enhancements, and feedback are always welcome.

## License

MIT License

## Investor & CEO Highlights

- **Next-Generation Data Integrity:**  
  By integrating FDC with MCP, our platform ensures that all externally sourced data is thoroughly validated before it informs AI decisions.

- **Dynamic AI & Creative Workflows:**  
  The system continuously loads AI models with context-rich, real-time data—from decentralized voice recordings to wallet transactions—setting a new standard for adaptive, secure AI workflows.

- **Scalable & Future-Proof Architecture:**  
  With containerized deployments, WASM performance enhancements, and a modern UI system, the plugin is built for growth in the decentralized and Web3 space.

```

---

### Additional Thoughts

This README now reflects a cohesive narrative that spans backend integrations (Filecoin, MCP, FDC), advanced security practices, and a modern UI system built in React and Tauri. It serves as both a technical guide for developers and a strategic presentation for investors and CEOs.

