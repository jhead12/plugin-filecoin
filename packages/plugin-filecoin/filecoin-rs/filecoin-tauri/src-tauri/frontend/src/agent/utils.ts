import {
    connectToFilecoin,
    checkFilecoinConnection,
} from "./database/filecoin";

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

export async function connectToFilecoin(): Promise<void> {
    if (!FILECOIN_RPC_URL || !FILECOIN_API_TOKEN) {
        throw new Error(
            "Filecoin RPC URL or API token not configured in environment variables",
        );
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
