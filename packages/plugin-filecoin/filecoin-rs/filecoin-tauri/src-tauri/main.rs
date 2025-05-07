use tauri::{Builder, generate_context};
#[path = "../services/mod.rs"]
mod services;
use specta; // Required for #[specta::specta]


#[tauri::command]
#[specta::specta]
async fn fetch_artist_data(artist_name: String) -> Result<String, String> {
    services::soundcharts::get_artist_data(&artist_name).await
}

#[tauri::command]
#[specta::specta]
async fn place_wager(artist_name: String, amount: u64) -> Result<String, String> {
    services::wager::place_wager(&artist_name, amount).await
}

#[tauri::command]
#[specta::specta]
async fn store_artist_data(data: String) -> Result<String, String> {
    services::filecoin::store_artist_data(data).await
}

#[tauri::command]
#[specta::specta]
async fn retrieve_artist_data(cid: String) -> Result<String, String> {
    services::filecoin::retrieve_artist_data(cid).await
}

fn main() {
    let specta_builder = tauri_specta::Builder::<tauri::Wry>::new()
        .commands(tauri_specta::collect_commands![
            fetch_artist_data,
            place_wager,
            store_artist_data,
            retrieve_artist_data
        ]);

        let mut builder = tauri_specta::Builder::new();
        tauri_specta::collect_commands![
            builder,
            fetch_artist_data,
            place_wager,
            store_artist_data,
            retrieve_artist_data
        ];
        builder
            .export(
                tauri_specta::ts::ExportConfiguration::default().with_path("../src-tauri/src/types.ts"),
                /* path */
            )
            .build(tauri::generate_context!())
            .run(tauri::generate_context!())
            .expect("error while running tauri application");

    #[cfg(debug_assertions)]
    specta_builder
        .export(
            tauri_specta::ts::ExportConfiguration::default().with_path("../src/bindings.ts"),
            tauri_specta::ts::ExportOptions::default()
        )
        .expect("Failed to export Specta bindings");

    Builder::default()
        .plugin(tauri_plugin_log::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            fetch_artist_data,
            place_wager,
            store_artist_data,
            retrieve_artist_data
        ])
        .run(generate_context!())
        .expect("error while running tauri application");
}