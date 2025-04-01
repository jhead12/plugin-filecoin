import { initialize, run, backupDataLocal, filecoinRsRestoreFunction } from './filecoin-rs-bindings';
import fs from 'fs/promises';
import path from 'path';
import { encrypt } from './encryption';

// Ensure a directory exists, creating it if necessary
async function ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
        await fs.mkdir(dirPath, { recursive: true });
        console.log(`Directory ensured: ${dirPath}`);
    } catch (err) {
        if ((err as NodeJS.ErrnoException).code !== 'EEXIST') {
            throw err;
        }
    }
}

async function main(): Promise<void> {
    await initialize(); // Initialize WebAssembly module

    // Define paths relative to project root
    const backupDir = path.resolve(__dirname, '../backup');
    const backupPath = path.join(backupDir, 'backup-file');
    const destinationPath = path.resolve(__dirname, '../dest/path');

    // Ensure directories exist
    await ensureDirectoryExists(backupDir);
    await ensureDirectoryExists(destinationPath);

    // Example data to backup
    const dataToBackup = "Sensitive data to backup";
    const encryptedData = encrypt(dataToBackup);

    // Execute WebAssembly functions
    run(); // Calls run()

    const backupResult = await backupDataLocal({
        path: backupPath,
        encrypted: true
    });
    console.log('Backup Success:', backupResult.success, 'Path:', backupResult.metadata.path);

    const restoreSuccess = await filecoinRsRestoreFunction({
        backupPath,
        destinationPath,
        decryptionKey: encryptedData // Pass the encrypted data as the key for now; adjust as needed
    });
    console.log(`Restored from ${backupPath} to ${destinationPath}: ${restoreSuccess}`);
}

main().catch(err => console.error('Error:', err));

// Export for use as a module
export { run, backupDataLocal, filecoinRsRestoreFunction };