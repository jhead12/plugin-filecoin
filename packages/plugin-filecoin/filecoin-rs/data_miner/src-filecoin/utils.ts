// utils.ts
import type { FilecoinBackupResult, WasmFilecoinBackupResult } from './types';
export function convertWasmBackupResult({ wasmResult }: { wasmResult: WasmFilecoinBackupResult; }): FilecoinBackupResult {
    return {
        success: wasmResult.success,
        cid: wasmResult.cid,
        encrypted: wasmResult.encrypted,
        metadata: {
            path: wasmResult.metadata.path,
            encrypted: wasmResult.metadata.encrypted,
            compressionLevel: wasmResult.metadata.compressionLevel,
            size: wasmResult.metadata.size
        }
    };
}
