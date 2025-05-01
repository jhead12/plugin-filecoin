// src-tauri/src/services/soundcharts.rs

use reqwest::Error;

/// Fetches artist data from the Soundcharts API.
///
/// # Arguments
///
/// * `artist_name` - A string slice that holds the name of the artist.
///     
/// # Returns
///     
/// * `Result<String, Error>` - A result containing the artist data as a string or an error if the request fails.
///     
/// # Example
/// ```
/// let artist_data = get_artist_data("artist_name").await;
/// match artist_data {
///    Ok(data) => println!("Artist data: {}", data),
///     Err(e) => eprintln!("Error fetching artist data: {}", e),
/// }
/// ```
/// # Errors
/// This function will return an error if the request to the Soundcharts API fails.
/// The error will be of type `reqwest::Error`.
///     

pub async fn get_artist_data(artist_name: &str) -> Result<String, Error> {
    let url = format!("https://api.soundcharts.com/artists/{}", artist_name);
    let response = reqwest::get(&url).await?;
    response.text().await
}