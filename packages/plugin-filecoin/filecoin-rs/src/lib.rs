use fvm_ipld_blockstore::{MemoryBlockstore, Blockstore};
use multihash::Code;
use cid::{Cid, Version};
use std::collections::HashMap;
use std::sync::Arc;
use wasm_bindgen::prelude::*;

// Stub native module for non-wasm targets.
#[cfg(not(target_arch = "wasm32"))]
mod native {
    pub fn run_native() {
        println!("Running native version");
    }
}

// Define an ActorState to use in the actors map.
#[derive(Debug, Default)]
pub struct ActorState {
    balance: u64,
    accounts: HashMap<String, u64>, // For example, an account mapping.
}

// Define the intents for storage actions.
pub enum MyIntent {
    Upload(Vec<u8>),
    Download(String),
}

// Update MyStorage to include an actors map.
pub struct MyStorage {
    blockstore: Arc<dyn Blockstore>,
    actors: HashMap<Cid, ActorState>,
}

impl MyStorage {
    pub fn new() -> Self {
        let bs = MemoryBlockstore::new();
        MyStorage {
            blockstore: Arc::new(bs),
            actors: HashMap::new(),
        }
    }

    /// Uploads data by computing its CID, storing it in the blockstore,
    /// and creating a new actor state.
    pub async fn upload(&mut self, data: Vec<u8>) -> Result<String, JsValue> {
        // Compute the multihash of the data.
        let hash = Code::Sha2_256.digest(&data);
        // Create a new CID (here using raw codec 0x55 as an example; adjust as needed).
        let cid = Cid::new_v1(0x55, hash);
        // Create and insert an empty actor state.
        let actor_state = ActorState {
            balance: 0,
            accounts: HashMap::new(),
        };
        self.actors.insert(cid, actor_state);
        // Store the data in the blockstore. (Assumes put_keyed exists on your blockstore.)
        self.blockstore
            .put_keyed(&cid, &data)
            .map_err(|e| JsValue::from_str(&e.to_string()))?;
        Ok(cid.to_string())
    }

    /// Downloads data from the blockstore via its CID (provided as a string).
    pub async fn download(&self, cid_str: String) -> Result<Vec<u8>, JsValue> {
        let cid = cid_str
            .parse::<Cid>()
            .map_err(|e| JsValue::from_str(&e.to_string()))?;
        self.blockstore
            .get(&cid)
            .map_err(|e| JsValue::from_str(&e.to_string()))?
            .ok_or_else(|| JsValue::from_str("Data not found"))
    }

    /// Synchronous version of download that returns an anyhow error.
    pub fn retrieve_data(&self, cid_str: String) -> Result<Vec<u8>, anyhow::Error> {
        let cid = cid_str.parse::<Cid>()?;
        self.blockstore
            .get(&cid)?
            .ok_or_else(|| anyhow::anyhow!("Data not found"))
    }

    /// Handle an intent (either upload or download) and return a string result.
    pub async fn handle_intent(&mut self, intent: MyIntent) -> Result<String, JsValue> {
        match intent {
            MyIntent::Upload(data) => self.upload(data).await,
            MyIntent::Download(cid) => {
                // Here you might want to return or process the downloaded data.
                let _data = self.download(cid.clone()).await?;
                Ok(cid)
            }
        }
    }
}

pub struct MyMachine {
    storage: MyStorage,
}

impl MyMachine {
    pub fn new() -> Self {
        let storage = MyStorage::new();
        MyMachine { storage }
    }

    pub async fn process_intent(&mut self, intent: MyIntent) -> Result<String, JsValue> {
        self.storage.handle_intent(intent).await
    }
}

#[cfg(target_arch = "wasm32")]
#[wasm_bindgen(start)]
pub async fn init() -> Result<(), JsValue> {
    console_log::init_with_level(log::Level::Debug)
        .map_err(|e| JsValue::from_str(&e.to_string()))?;
    Ok(())
}

#[cfg(not(target_arch = "wasm32"))]
pub fn run() {
    native::run_native();
}
