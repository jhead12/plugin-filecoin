import init, { run as wasmRun, backupData as wasmBackupData, restoreFromBackup as wasmRestoreFromBackup } from '../filecoin-rs/pkg/filecoin_rs';
import { BackupMetadata as IBackupMetadata, RestoreOptions as IRestoreOptions, FilecoinBackupResult as IFilecoinBackupResult } from './types';
import { decrypt } from './encryption';

export class FilecoinRsBindings {
  static async initialize(): Promise<void> {
    await init();
  }

  static async backupDataLocal(options?: {
    path?: string;
    encrypted?: boolean;
  }): Promise<IFilecoinBackupResult> {
    try {
      // Call the WASM backupData function with encrypted data
      const data = new Uint8Array([1, 2, 3]); // Placeholder; replace with actual encrypted data if needed
      const result = wasmBackupData(data);

      return {
        success: result.success,
        metadata: {
          path: result.metadata.path() || options?.path || '',
          encrypted: options?.encrypted ?? false,
          compressionLevel: result.metadata.compressionLevel() ?? undefined,
          size: result.metadata.size() ?? data.length
        }
      };
    } catch (error) {
      console.error('Backup failed:', error);
      return {
        success: false,
        metadata: {
          path: options?.path || '',
          encrypted: options?.encrypted ?? false,
          compressionLevel: undefined,
          size: undefined
        }
      };
    }
  }

  static async restoreFromBackup(options: IRestoreOptions): Promise<boolean> {
    try {
        let backupData: Buffer | FilecoinBackupResult;
        if (options.backupPath.startsWith('ipfs://') || options.backupPath.startsWith('filecoin://')) {
            // Fetch from Filecoin network if path is a URL/CID
            backupData = await fetchDataFromNetwork(options.backupPath);
        } else {
            // Local file handling (assumes WASM handles local paths)
            await wasmRestoreFromBackup(options.backupPath, options.destinationPath, options.decryptionKey);
            return true;
        }

        // Handle fetched backup data
        if ('success' in backupData && backupData.success) {
            const encryptedData = backupData.metadata.path; // Adjust based on actual data
            if (options.decryptionKey && backupData.metadata.encrypted) {
                const decrypted = decrypt(options.decryptionKey); // Decrypt if needed
                console.log('Decrypted restored data:', decrypted);
            }
            // Pass to WASM if further processing needed
            await wasmRestoreFromBackup(options.backupPath, options.destinationPath, options.decryptionKey);
        }

        return true;
    } catch (error) {
        console.error('Restore failed:', error);
        return false;
    }
}
}

export const run = wasmRun;
export const backupDataLocal = FilecoinRsBindings.backupDataLocal;
export const filecoinRsRestoreFunction = FilecoinRsBindings.restoreFromBackup;
export const initialize = FilecoinRsBindings.initialize;