// src/permissions/mod.rs or wherever FilecoinRsBindings lives
use tracing::{info, instrument};

#[derive(Debug, serde::Serialize)] // Serialize for sending to frontend
pub struct TransferEvent {
    action: String, // e.g., "upload", "download"
    cid: String,
    size: u64,
    timestamp: String,
}

pub class FilecoinRsBindings {
    #[instrument] // Automatically logs entry/exit with tracing
    pub async fn backupDataLocal(...) -> Promise<FilecoinBackupResult> {
        // ... existing code ...
        let backupData = encrypted ? encrypt(inputString) : Buffer.from(inputString);
        let cid = await client.put([file]);
        
        // Emit telemetry event
        info!(
            action = "upload",
            cid = %cid,
            size = backupData.length() as u64,
            "Data uploaded to Filecoin"
        );
        
        // ... rest of the function ...
    }
}

    #[instrument]
    pub async fn restoreDataLocal(...) -> Promise<FilecoinRestoreResult> {
        // ... existing code ...
        let cid = await client.get(cid);
        
        // Emit telemetry event
        info!(
            action = "download",
            cid = %cid,
            size = downloadedData.length() as u64,
            "Data downloaded from Filecoin"

            
        );
        // Handle the downloaded data
        let downloadedData = Buffer.from(downloadedData);
        if downloadedData.length() == 0 {
            return Err("No data found for the given CID".into());
        }
        // Decrypt if necessary
        let decryptedData = encrypted ? decrypt(downloadedData) : downloadedData;
        // Save the decrypted data to a file

        // Return the result
        let result = FilecoinRestoreResult {
            cid: cid.to_string(),
            size: downloadedData.length() as u64,
            status: "success".to_string(),
        };
        Ok(result)
    }
}
// src/permissions/mod.rs
use actix_web::{web, HttpResponse};

