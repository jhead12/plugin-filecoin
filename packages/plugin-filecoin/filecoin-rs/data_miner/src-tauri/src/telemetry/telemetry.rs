// src/main.rs or a new src/telemetry.rs

use std::sync::Mutex;
use tauri::State;
use tracing::{info, instrument};
use serde::Serialize;
use chrono::Utc;

#[derive(Debug, Serialize, Clone)]
struct TransferEvent {
    action: String,
    cid: String,
    size: u64,
    timestamp: String,
}

// Global state to store telemetry events
struct TelemetryState(Mutex<Vec<TransferEvent>>);

#[tauri::command]
fn log_transfer(state: State<TelemetryState>, action: String, cid: String, size: u64) {
    let event = TransferEvent {
        action,
        cid,
        size,
        timestamp: Utc::now().to_rfc3339(),
    };
    let mut events = state.0.lock().unwrap();
    events.push(event);
    info!("Logged transfer: {:?}", event);
}

#[tauri::command]
fn get_transfers(state: State<TelemetryState>) -> Vec<TransferEvent> {
    let events = state.0.lock().unwrap();
    events.clone()
}

#[tauri::command]
fn open_telemetry_window(app: tauri::AppHandle) -> Result<(), String> {
    let window = tauri::WebviewWindowBuilder::new(
        &app,
        "telemetry", // Window label
        tauri::WebviewUrl::App("telemetry.html".into())
    )
    .title("Data Transfers")
    .inner_size(800.0, 600.0)
    .build()
    .map_err(|e| e.to_string())?;
    
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Set up tracing subscriber
    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::INFO)
        .init();

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(TelemetryState(Mutex::new(Vec::new())))
        .invoke_handler(tauri::generate_handler![
            greet,
            log_transfer,
            get_transfers,
            open_telemetry_window
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

// Example: Simulate a data transfer (replace with your Filecoin logic)
#[tauri::command]
#[instrument]
fn simulate_transfer(state: State<TelemetryState>) {
    let event = TransferEvent {
        action: "upload".to_string(),
        cid: "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi".to_string(),
        size: 1024,
        timestamp: Utc::now().to_rfc3339(),
    };
    let mut events = state.0.lock().unwrap();
    events.push(event.clone());
    info!("Simulated transfer: {:?}", event);
}