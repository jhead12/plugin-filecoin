// filecoin-rs/src/main.rs

use std::collections::HashMap;
use std::convert::TryFrom;
use wasm_bindgen::prelude::*;
use std::hash::{Hash, Hasher};

#[allow(dead_code)]
struct DataRecord {
    id: u64,
    address: Address,
    amount: TokenAmount,
    metadata: Option<String>,
}
#[allow(dead_code)]
struct Address {
     id: u64,
    balance: TokenAmount,
}


impl Address {
    fn new_id(_id: u64) -> Self {
        Address {
            id: _id,
            balance: TokenAmount::from_atto(0),
        }
    }
}

struct TokenAmount {
    // make sure to implement the necessary fields and methods
    id: u64,
    balance: u64,
    limit: u64,
    metadata: Option<String>,


}

impl TokenAmount {
    fn from_atto(_amount: u64) -> Self {
        TokenAmount {
            id: 0,
            balance: _amount,
            limit: 0,
            metadata: None,
        }
    }
}

#[derive(Clone)]
pub struct ActorState;

struct NoopLimiter {
    limit: usize,
}

impl NoopLimiter {
    pub fn new(limit: usize) -> Self {
        Self { limit }
    }

    pub fn check_limit(&self, size: usize) -> bool {
        size <= self.limit
    }
}

pub struct BlockStore {
    blockstore: HashMap<String, String>,
    limiter: NoopLimiter,
    actors: HashMap<Cid, ActorState>,
}

impl BlockStore {
    pub fn new(limit: usize) -> Self {
        Self {
            blockstore: HashMap::new(),
            limiter: NoopLimiter::new(limit),
            actors: HashMap::new(),
        }
    }

    pub fn get_actor_state(&self, cid_str: String) -> Result<ActorState, JsValue> {
        let cid = Cid::try_from(cid_str).map_err(|e| JsValue::from_str(&e.to_string()))?;
        self.actors
            .get(&cid)
            .cloned()
            .ok_or_else(|| JsValue::from_str("Actor state not found"))
    }

    pub fn set_actor_state(&mut self, cid_str: String, state: ActorState) -> Result<(), JsValue> {
        let cid = Cid::try_from(cid_str).map_err(|e| JsValue::from_str(&e.to_string()))?;
        self.actors.insert(cid, state);
        Ok(())
    }
}

#[derive(Clone)]
struct Cid;

impl TryFrom<String> for Cid {
    type Error = std::io::Error;
    fn try_from(_s: String) -> Result<Self, Self::Error> {
        Ok(Cid {})
    }
}

impl PartialEq for Cid {
    fn eq(&self, other: &Self) -> bool {
        // Implement equality check here
        true
    }
}

impl Eq for Cid {}

impl Hash for Cid {
    fn hash<H: Hasher>(&self, state: &mut H) {
        // Implement hashing here
    }
}

fn run_native() {
    // Your code goes here
}

fn main() {
    run_native();
}

