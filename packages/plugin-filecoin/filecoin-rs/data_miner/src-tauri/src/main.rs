// src-tauri/src/main.rs

use tauri::{Builder, Manager};
use crate::services::{soundcharts, wager, filecoin};

#[tauri::command]
async fn fetch_artist_data(artist_name: String) -> Result<String, String> {
    soundcharts::get_artist_data(&artist_name).await
}

#[tauri::command]
async fn place_wager(artist_name: String, amount: u64) -> Result<String, String> {
    wager::place_wager(&artist_name, amount).await
}

#[tauri::command]
async fn store_artist_data(data: String) -> Result<String, String> {
    filecoin::store_artist_data(data).await
}

#[tauri::command]
async fn retrieve_artist_data(cid: String) -> Result<String, String> {
    filecoin::retrieve_artist_data(cid).await
}

fn main() {
    Builder::default()
        .invoke_handler(tauri::generate_handler![fetch_artist_data, place_wager, store_artist_data, retrieve_artist_data])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}