
use std::sync::Arc;
use crate::Blockstore;
use crate::MemoryBlockstore;
use crate::MyMachine;

// src/native/mod.rs
#[cfg(not(target_arch = "wasm32"))]

pub fn run_native() {
    println!("Running native Filecoin operations");
    let blockstore = Arc::new(MemoryBlockstore::default());
    let _machine = MyMachine::new(blockstore, 1024); // Example usage
}