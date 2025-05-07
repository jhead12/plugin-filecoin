// filecoin.utils.ts
import { createAxiosClient } from "../network/network";
import type { FilecoinRpcResponse } from "./agent.types";
import { FilecoinRsBindings } from "../filecoin-rs-bindings";
import type { AxiosError } from "axios";

const FILECOIN_RPC_URL =
    process.env.FILECOIN_RPC_URL || "https://api.node.glif.io/rpc/v0";
const FILECOIN_API_TOKEN = process.env.FILECOIN_API_TOKEN || "";
const axiosFilecoinClient = createAxiosClient(
    FILECOIN_RPC_URL,
    FILECOIN_API_TOKEN,
);

export interface DataVector {
    id: string;
    value: string | Uint8Array;
    metadata?: {
        path?: string;
        encrypted?: boolean;
        size?: number;
    };
}

export async function connectToFilecoin(): Promise<void> {
    if (!FILECOIN_RPC_URL || !FILECOIN_API_TOKEN) {
        throw new Error("Filecoin RPC URL or API token not configured");
    }
    try {
        const response = await axiosFilecoinClient.post("", {
            jsonrpc: "2.0",
            method: "Filecoin.Version",
            params: [],
            id: 1,
        });
        const data: FilecoinRpcResponse = response.data;
        if (data.error || !data.result) {
            throw new Error(
                `Filecoin RPC error: ${data.error?.message || "No version returned"}`,
            );
        }
        console.log("Connected to Filecoin network successfully:", data.result);
    } catch (error) {
        const err = error as AxiosError;
        console.error(
            "Error connecting to Filecoin network:",
            err.response?.data || err.message,
        );
        throw error;
    }
}

export async function checkFilecoinConnection(): Promise<boolean> {
    if (!FILECOIN_RPC_URL || !FILECOIN_API_TOKEN) {
        console.warn("Filecoin RPC URL or API token not configured");
        return false;
    }
    try {
        const response = await axiosFilecoinClient.post("", {
            jsonrpc: "2.0",
            method: "Filecoin.Version",
            params: [],
            id: 1,
        });
        const data: FilecoinRpcResponse = response.data;
        const isConnected = !data.error && data.result !== null;
        console.log(
            "Filecoin connection check:",
            isConnected ? "Connected" : "Disconnected",
        );
        return isConnected;
    } catch (error) {
        console.error(
            "Error checking Filecoin connection:",
            (error as AxiosError).message,
        );
        return false;
    }
}

export async function fetchFilecoinDataVectors(): Promise<DataVector[]> {
    try {
        await FilecoinRsBindings.initialize();
        const backupResult = await FilecoinRsBindings.backupDataLocal({
            path: "../backup",
            encrypted: true,
            data: "",
        });
        return processBackupResult(backupResult);
    } catch (error) {
        console.error("Error fetching Filecoin data vectors:", error);
        throw error;
    }
}

export function processBackupResult(
    backupResult: FilecoinBackupResult,
): DataVector[] {
    const vectors: DataVector[] = [];
    if (!backupResult.success || !backupResult.metadata.path) {
        console.warn(
            "Backup failed or no path available, returning empty vectors",
        );
        return vectors;
    }
    const vector: DataVector = {
        id: backupResult.metadata.path.split("/").pop() ?? "unknown",
        value: backupResult.data ?? Buffer.from(""),
        metadata: {
            path: backupResult.metadata.path,
            encrypted: backupResult.metadata.encrypted,
            size: backupResult.metadata.size,
        },
    };
    vectors.push(vector);
    return vectors;
}

export async function searchFilecoinData(query: string): Promise<DataVector[]> {
    console.log(`Searching Filecoin data with query: ${query}`);
    try {
        await connectToFilecoin();
        const vectors: DataVector[] = [];
        if (query.match(/^(ipfs|filecoin):\/\//)) {
            const cid = query.split("://")[1];
            const data = await FilecoinRsBindings.retrieveDataWithMachine(cid);
            vectors.push({
                id: cid,
                value: data,
                metadata: { path: query },
            });
        } else {
            const response = await axiosFilecoinClient.post("", {
                jsonrpc: "2.0",
                method: "Filecoin.ChainGetMessage",
                params: [{ "/": query }],
                id: 1,
            });
            const data: FilecoinRpcResponse = response.data;
            if (data.error) {
                console.warn(`Chain query failed: ${data.error.message}`);
                return vectors;
            }
            vectors.push({
                id: query,
                value: JSON.stringify(data.result),
                metadata: {},
            });
        }
        return vectors;
    } catch (error) {
        console.error(
            "Error searching Filecoin data:",
            (error as AxiosError).message,
        );
        throw error;
    }
}
