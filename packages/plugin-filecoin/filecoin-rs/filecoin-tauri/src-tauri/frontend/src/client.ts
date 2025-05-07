// packages/plugin-filecoin/src/client.ts

import { getFilecoinClient } from "./filecoin-rs-bindings";

const filecoinClient = getFilecoinClient();

/**
 * Connects to the Filecoin network.
 */
export async function connectToFilecoin(): Promise<void> {
    try {
        const success = await filecoinClient.connect();
        if (!success) throw new Error("Connection failed");
        console.log("Connected to Filecoin network");
    } catch (error) {
        console.error("Failed to connect to Filecoin network:", error);
        throw error;
    }
}
