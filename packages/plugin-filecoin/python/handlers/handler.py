import os
from ctypes import CDLL, c_void_p
from opentelemetry import metrics
from opentelemetry.exporter.otlp.proto.grpc.metric_exporter import OTLPMetricExporter
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.resources import Resource

# Setup telemetry
resource = Resource(attributes={"service.name": "filecoin-agent"})
metrics.set_meter_provider(MeterProvider(resource=resource, metric_readers=[OTLPMetricExporter(endpoint="localhost:4317")]))

# Load Rust library
lib = CDLL("./libagent.so")  # Compiled from Rust
lib.create_agent.restype = c_void_p

# Create agent
agent_ptr = lib.create_agent()

# Backup with status tracking
data = "some data".encode('utf-8')
path = "/path/to/backup".encode('utf-8')
lib.backup_agent(agent_ptr, data, len(data), path, len(path))

print("Agent ran successfully")