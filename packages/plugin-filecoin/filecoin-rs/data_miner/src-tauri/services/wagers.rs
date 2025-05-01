// src-tauri/src/services/wager.rs

use flare_sdk::FlareClient;

/// This function places a wager on an artist using the Flare SDK.
/// It interacts with a smart contract to place the wager.
///
/// # Arguments
///
/// * `artist_name` - A string slice that holds the name of the artist.
/// * `amount` - The amount to wager.
///Future improvements could include error handling, logging, and more robust input validation.
/// Wagers base time constrants, and connections to services such as hitsdaildouble and soundcharts
/// are not implemented in this example.
/// # Returns
///
/// * `Result<String, String>` - A result containing the transaction hash as a string or an error message if the transaction fails.
///
/// # Example
/// ```
/// let wager_result = place_wager("artist_name", 100).await;       

pub async fn place_wager(artist_name: &str, amount: u64) -> Result<String, String> {
    let client = FlareClient::new(); // Initialize the Flare client
    let contract_address = "0x..."; // Replace with the actual contract address

    // Assuming there's a method `wager` in the contract that takes artist name and amount
    match client.call_contract_method(contract_address, "wager", vec![artist_name, &amount.to_string()]).await {
        Ok(tx_hash) => Ok(tx_hash),
        Err(e) => Err(format!("Failed to place wager: {}", e)),
    }
}