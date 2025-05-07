use tracing::{info, error, warn, debug};
use opentelemetry::{global, sdk::trace as sdktrace};
use opentelemetry_otlp::WithExportConfig;
use tracing_subscriber::layer::SubscriberExt;

pub fn init_logs() {
    // Initialize OpenTelemetry with an OTLP exporter
    let tracer = sdktrace::TracerProvider::builder()
        .with_batch_exporter(
            sdktrace::BatchSpanProcessor::builder(
                opentelemetry_otlp::new_pipeline()
                    .endpoint("http://localhost:4317")
                    .build()
                    .unwrap(),
            )
            .build(),
        )
        .build();
    global::set_tracer_provider(tracer);

    // Set up tracing with a subscriber
    let subscriber = tracing_subscriber::Registry::default()
        .with(
            tracing_subscriber::fmt::layer()
                .with_target(false)
                .compact(),
        )
        .with(tracing_subscriber::EnvFilter::new("info,telemetry=debug"));
    tracing::subscriber::set_global_default(subscriber).expect("Failed to set global subscriber");
}

pub fn log_info(message: &str) {
    info!("{}", message);
}

pub fn log_error(message: &str) {
    error!("{}", message);
}

pub fn log_warning(message: &str) {
    warn!("{}", message);
}

pub fn log_debug(message: &str) {
    debug!("{}", message);
}