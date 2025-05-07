import { invoke } from "@tauri-apps/api";
import { useState } from "react";

interface DataVector {
    id: string;
    value: string;
    metadata?: {
        path?: string;
        encrypted?: boolean;
        size?: number;
    };
}

export const DataTransfers = () => {
    const [cid, setCid] = useState("");
    const [data, setData] = useState("");

    const handleStore = async () => {
        try {
            const result = await invoke<string>("store_data", {
                data: new TextEncoder().encode(data),
            });
            setCid(result);
        } catch (error) {
            console.error("Store failed:", error);
        }
    };

    return (
        <div>
            <textarea
                value={data}
                onChange={(e) => setData(e.target.value)}
                placeholder="Enter data to store"
            />
            <button onClick={handleStore}>Store Data</button>
            {cid && <p>Stored with CID: {cid}</p>}
        </div>
    );
};
