// src/main.rs in your tauri project

use tauri::{Builder, Manager};
use filecoin_rs::store_data; // Assuming you have this function in your filecoin-rs crate

#[tauri::command]
async fn store_file(file: String) -> Result<String, String> {
    match store_data(&file) {
        Ok(cid) => Ok(format!("File stored with CID: {}", cid)),
        Err(e) => Err(format!("Failed to store file: {}", e)),
    }
}

fn main() {
    Builder::default()
        .invoke_handler(tauri::generate_handler![store_file])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}