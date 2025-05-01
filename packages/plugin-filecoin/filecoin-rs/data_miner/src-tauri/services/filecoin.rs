// src-tauri/src/services/filecoin.rs

/// This function stores artist data on the Filecoin network.
/// It uses the `filecoin_rs` crate to interact with the Filecoin network.
///
/// # Arguments
///
/// * `data` - A string slice that holds the artist data.

use filecoin_rs::store_data;

pub async fn store_artist_data(data: String) -> Result<String, String> {
    match store_data(&data).await {
        Ok(cid) => Ok(cid),
        Err(e) => Err(format!("Failed to store data on Filecoin: {}", e)),
    }

 
}

// src-tauri/src/services/filecoin.rs

use filecoin_rs::retrieve_data;

pub async fn retrieve_artist_data(cid: String) -> Result<String, String> {
    match retrieve_data(&cid).await {
        Ok(data) => Ok(data),
        Err(e) => Err(format!("Failed to retrieve data from Filecoin: {}", e)),
    }
}