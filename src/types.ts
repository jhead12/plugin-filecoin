import init from '../filecoin-rs/pkg/filecoin_rs';
import run from '../filecoin-rs/pkg/filecoin_rs';
import backupData from '../filecoin-rs/pkg/filecoin_rs';
import restore_from_backup from '../filecoin-rs/pkg/filecoin_rs';
import fs from 'fs/promises'; // Node.js file system module (async)
import path from 'path'; // For handling file paths

async function ensureDirectoryExists(dirPath: string) {
    try {
        await fs.mkdir(dirPath, { recursive: true });
        console.log(`Directory ensured: ${dirPath}`);
    } catch (err: any) {
        if ((err as NodeJS.ErrnoException).code !== 'EEXIST') {
            throw err;
        }
    }
}

import { CID } from 'multiformats/CID';
import { backupDataLocal, filecoinRsRestoreFunction } from 'src';
import BackupManager from './backup';

// Define a type for CID
type FilecoinCID = CID;


// Function to convert CID string to byte array
function cidToBytes(cid: FilecoinCID): Uint8Array {
    return cid.bytes;
}

// Example usage
const cidString = 'bafybeihd6k4h4i5j7l8m9n0o1p2q3r4s5t6u7v8w9x0y';
const Cid = CID.parse(cidString);
const bytes = cidToBytes(Cid);
console.log(bytes); // Outputs the byte array representation of the CID

async function main() {
  await main(); // Initialize WebAssembly module

  // Define paths
  const backupPath = path.resolve('backup/path'); // Absolute path to backup folder
  const destinationPath = path.resolve('dest/path'); // Absolute path to destination folder

  // Ensure directories exist
  await ensureDirectoryExists(path.dirname(backupPath)); // Ensure backup folder exists
  await ensureDirectoryExists(destinationPath); // Ensure destination folder exists

  // Run the WASM functions
  main(); // Calls the run() function

  const backupResult = backupDataLocal(new Uint8Array([1, 2, 3]));
  console.log('Backup Success:', backupResult.success, 'Path:', backupResult.metadata.path);

  filecoinRsRestoreFunction(backupPath, destinationPath, 'key');
  console.log(`Restored from ${backupPath} to ${destinationPath}`);
}

main().catch(err => console.error('Error:', err));

// Define interfaces
export interface BackupMetadata {
  path?: string;
  encrypted?: boolean;
  compressionLevel?: number;
  size?: number; // Added as requested
}

export interface RestoreOptions {
  backupPath: string;
  destinationPath?: string;
  decryptionKey?: string;
}

export interface FilecoinBackupResult {
  success: boolean;
  metadata: BackupMetadata;
}

export interface PerformanceMetrics {
  someMetric: number;
  anotherMetric: string;
  // Add other metrics as needed
}

export interface PerformanceMetrics {
  someMetric: number; // e.g., backup duration (ms)
  anotherMetric: string; // e.g., operation type (backup/restore)
  backupSize?: number; // Size in bytes
  uploadTime?: number; // Time to upload to Filecoin/Storacha (ms)
  retrievalLatency?: number; // Time to fetch from Filecoin (ms)
  cid?: string; // Filecoin CID
}

// Define interfaces that match Rust ActorState struct
export interface ActorState {
  balance: number;
}

export interface Account {
  account_id: CID;
  balance: number;
  permissions?: Permissions;
  data?: { [key: string]: Uint8Array };
}

export interface Transfer {
  to: CID;
  amount: number;
}

export interface Mint {
  to: CID;
  amount: number;
}

export interface Burn {
  from: CID;
  amount: number;
}

export interface SetData {
  key: string;
  value: Uint8Array;
}

export interface Delegate {
  from: CID;
  to: CID;
  permissions: Permissions;
}

export interface Revoke {
  from: CID;
  to: CID;
}

export interface BatchTransfer {
  transfers: Transfer[];
}

export interface QueryBalance {
  account: CID;
}

export interface Vote {
  proposal_id: string;
  voter: CID;
  support: boolean;
}

export interface Withdraw {
  from: CID;
  amount: number;
}

export interface Custom {
  data: any;
}

export type Message =
  | { kind: 'Transfer'; payload: Transfer }
  | { kind: 'Mint'; payload: Mint }
  | { kind: 'Burn'; payload: Burn }
  | { kind: 'SetData'; payload: SetData }
  | { kind: 'Delegate'; payload: Delegate }
  | { kind: 'Revoke'; payload: Revoke }
  | { kind: 'BatchTransfer'; payload: BatchTransfer }
  | { kind: 'QueryBalance'; payload: QueryBalance }
  | { kind: 'Vote'; payload: Vote }
  | { kind: 'Withdraw'; payload: Withdraw }
  | { kind: 'Custom'; payload: Custom };