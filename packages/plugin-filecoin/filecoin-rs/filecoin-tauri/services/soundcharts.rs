use reqwest::Client;

pub async fn get_artist_data(artist_name: &str) -> Result<String, String> {
    let client = Client::new();
    // Placeholder: Replace with Soundcharts API call
    let response = client
        .get(format!("https://api.soundcharts.com/artists/{}", artist_name))
        .send()
        .await
        .map_err(|e| e.to_string())?
        .text()
        .await
        .map_err(|e| e.to_string())?;
    Ok(response)
}