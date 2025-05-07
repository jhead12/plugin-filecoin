// types.ts

import type { CID } from "multiformats/cid";
import type { AgentFile } from "../filecoin-rs-bindings";
import type { Agent } from "../agent/agent.types";
import { FilecoinRpcResponse } from "../network/network.types";

export type FilecoinCID = CID;

type HashMap<K, V> = Map<K, V>;

export interface BackupMetadata {
    path?: string;
    encrypted?: boolean;
    compressionLevel?: number;
    size?: number;
}

export interface FilecoinBackupResult {
    cid: string;
    encrypted: boolean;
    success: boolean;
    metadata: BackupMetadata & {
        path: string | undefined;
        encrypted: boolean | undefined;
    };
    data?: string | Uint8Array;
}

export interface RestoreOptions {
    backupPath: string;
    destinationPath?: string;
    decryptionKey?: string;
}

export interface PerformanceMetrics {
    responseTime: number;
    throughput: number;
    errorRate: number;
    latency: number;
    memoryUsage: number;
    cpuUtilization: number;
    networkTraffic: number;
    diskIO: number;
    backupSize?: number;
    uploadTime?: number;
    retrievalLatency?: number;
    cid?: string;
}

export interface BackupOptions {
    path: string;
    encrypted?: boolean;
}

export interface WasmFilecoinBackupResult {
    success: boolean;
    metadata: BackupMetadata;
}

export interface FilecoinClient {
    storage: CID;
    upload(data: Uint8Array): Promise<string>;
    download(cid: string): Promise<Uint8Array>;
}

export interface ActorState {
    balance: number;
    accounts: HashMap<string, any>;
}

export interface Transfer {
    to: FilecoinCID;
    amount: number;
}

export interface Mint {
    to: FilecoinCID;
    amount: number;
}

export interface Burn {
    from: FilecoinCID;
    amount: number;
}

export interface SetData {
    key: string;
    value: Uint8Array;
}

export interface Delegate {
    from: FilecoinCID;
    to: FilecoinCID;
    permissions: Permissions;
}

export interface Revoke {
    from: FilecoinCID;
    to: FilecoinCID;
}

export interface BatchTransfer {
    transfers: Transfer[];
}

export interface QueryBalance {
    account: FilecoinCID;
}

export interface Vote {
    proposal_id: string;
    voter: FilecoinCID;
    support: boolean;
}

export interface Withdraw {
    from: FilecoinCID;
    amount: number;
}

export interface Custom {
    data: any;
}

export type Message =
    | { kind: "Transfer"; payload: Transfer }
    | { kind: "Mint"; payload: Mint }
    | { kind: "Burn"; payload: Burn }
    | { kind: "SetData"; payload: SetData }
    | { kind: "Delegate"; payload: Delegate }
    | { kind: "Revoke"; payload: Revoke }
    | { kind: "BatchTransfer"; payload: BatchTransfer }
    | { kind: "QueryBalance"; payload: QueryBalance }
    | { kind: "Vote"; payload: Vote }
    | { kind: "Withdraw"; payload: Withdraw }
    | { kind: "Custom"; payload: Custom };

export interface Permissions {
    [key: string]: boolean | string | number;
}

export interface IntentRecord {
    action: string;
    timestamp: number;
    result: string;
    error?: string;
    walletAddress: string;
}

export class AgentError extends Error {
    constructor(
        message: string,
        public readonly code?: string,
        public readonly details?: any,
    ) {
        super(message);
        this.name = "AgentError";
    }
}

export class FileError extends Error {
    constructor(
        message: string,
        public readonly code?: string,
        public readonly details?: any,
    ) {
        super(message);
        this.name = "FileError";
    }
}

export interface ILogger {
    info(message: string, meta?: any): void;
    warn(message: string, meta?: any): void;
    error(message: string, meta?: any): void;
}

export interface Database {
    createAgent(agent: Agent): Promise<void>;
    getAgent(id: string): Promise<Agent | null>;
    updateAgent(id: string, agent: Agent): Promise<void>;
    createFile(file: AgentFile): Promise<void>;
    getFile(id: string): Promise<AgentFile | null>;
    updateFile(id: string, file: AgentFile): Promise<void>;
    getDocument(id: string): Promise<DocumentDTO | null>;
    createMessage(message: CommMessageDTO): Promise<void>;
    getMessage(id: string): Promise<CommMessageDTO | null>;
}

export interface DocumentDTO {
    id: string;
    name: string;
    type: "ics" | "excel" | "word";
    data: string;
    ownerId: string;
    createdAt: number;
}

export interface CommMessageDTO {
    id?: string;
    senderId: string;
    recipientId: string;
    assetId: string;
    message: string;
    timestamp?: number;
}

export interface AudioAssetDTO {
    id: string;
    name: string;
    type: string;
    data: string;
    ownerId: string;
    createdAt: number;
}
