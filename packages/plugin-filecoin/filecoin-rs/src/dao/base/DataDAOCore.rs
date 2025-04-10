use fvm_sdk::{
    prelude::*,
    actor::Actor,
    message::MessageInfo,
    syscalls::Syscalls,
};
use fvm_shared::{
    econ::TokenAmount, // For FIL amounts
    cid::Cid,          // Content ID for IPFS data
    error::ExitCode,
};
use serde::{Deserialize, Serialize};
use anyhow::Result;

// Constants
const ADMIN_ROLE: u64 = 1;
const MEMBER_ROLE: u64 = 2;
const MARKET_ACTOR_ID: u64 = 5; // Filecoin Market actor ID (example)
const DEFAULT_PROVIDER_ID: u64 = 1001; // Example storage provider ID

// State structure to persist DAO data
#[derive(Serialize, Deserialize, Default)]
struct DataDAOState {
    admin: Address,              // DAO admin address
    members: Vec<Address>,       // List of member addresses
    data_records: Vec<DataRecord>, // Stored data metadata
    total_rewards: TokenAmount,  // Total FIL distributed
}

#[derive(Serialize, Deserialize)]
struct DataRecord {
    cid: Cid,              // IPFS content ID
    deal_id: u64,          // Filecoin storage deal ID
    provider: u64,         // Storage provider ID
    reward_amount: TokenAmount, // FIL rewarded for this data
}

// Method numbers for actor dispatch
const CONSTRUCTOR_METHOD: u64 = 1;
const ADD_MEMBER_METHOD: u64 = 2;
const STORE_DATA_METHOD: u64 = 3;
const REWARD_PROVIDER_METHOD: u64 = 4;
const GET_DATA_METHOD: u64 = 5;

#[actor]
impl DataDAO {
    /// Constructor: Initialize the DAO with an admin
    #[method(num = CONSTRUCTOR_METHOD)]
    fn constructor(&mut self, admin: Address) -> Result<()> {
        let mut state = self.state()?;
        state.admin = admin;
        state.total_rewards = TokenAmount::from_atto(0);
        self.save_state(&state)?;
        Ok(())
    }

    /// Add a new member (admin-only)
    #[method(num = ADD_MEMBER_METHOD)]
    fn add_member(&mut self, new_member: Address) -> Result<()> {
        let caller = Syscalls::caller()?;
        let mut state = self.state()?;

        if caller != state.admin {
            return Err(anyhow::anyhow!("Only admin can add members"));
        }

        if !state.members.contains(&new_member) {
            state.members.push(new_member);
            self.save_state(&state)?;
        }
        Ok(())
    }

    /// Store data: Initiate a storage deal and record metadata
    #[method(num = STORE_DATA_METHOD)]
    fn store_data(&mut self, cid: Cid, reward_amount: TokenAmount) -> Result<u64> {
        let caller = Syscalls::caller()?;
        let mut state = self.state()?;

        // Only admin or members can store data
        if caller != state.admin && !state.members.contains(&caller) {
            return Err(anyhow::anyhow!("Unauthorized: Not a member or admin"));
        }

        // Initiate storage deal with the Market actor
        let deal_id = self.initiate_storage_deal(&cid, &reward_amount)?;

        // Record the data
        let record = DataRecord {
            cid,
            deal_id,
            provider: DEFAULT_PROVIDER_ID, // In practice, this would come from deal params
            reward_amount: reward_amount.clone(),
        };
        state.data_records.push(record);
        state.total_rewards += &reward_amount;
        self.save_state(&state)?;

        Ok(deal_id)
    }

    /// Reward a storage provider for a specific deal
    #[method(num = REWARD_PROVIDER_METHOD)]
    fn reward_provider(&mut self, deal_id: u64) -> Result<()> {
        let caller = Syscalls::caller()?;
        let mut state = self.state()?;

        if caller != state.admin {
            return Err(anyhow::anyhow!("Only admin can reward providers"));
        }

        // Find the data record
        let record = state.data_records.iter().find(|r| r.deal_id == deal_id)
            .ok_or_else(|| anyhow::anyhow!("Deal not found"))?;

        // Send FIL to the provider
        Actor::send(
            Address::new_id(record.provider),
            0, // Method 0 = simple FIL transfer
            record.reward_amount.clone(),
            vec![],
        )?;

        Ok(())
    }

    /// Get data record by deal ID (view method)
    #[method(num = GET_DATA_METHOD)]
    fn get_data(&self, deal_id: u64) -> Result<Option<DataRecord>> {
        let state = self.state()?;
        Ok(state.data_records.iter().find(|r| r.deal_id == deal_id).cloned())
    }

    /// Helper: Initiate a storage deal with the Market actor
    fn initiate_storage_deal(&self, cid: &Cid, amount: &TokenAmount) -> Result<u64> {
        // Simplified: In practice, you'd need proper deal parameters
        let params = MarketAddBalanceParams {
            amount: amount.clone(),
        };
        let serialized_params = cbor::serialize(&params)?;

        let result = Actor::call(
            Address::new_id(MARKET_ACTOR_ID),
            2, // Market actor's AddBalance method (example)
            serialized_params,
            MessageInfo {
                value: amount.clone(),
                ..Default::default()
            },
        )?;

        // Assume the deal ID is returned (implementation-specific)
        let deal_id: u64 = cbor::deserialize(&result)?;
        Ok(deal_id)
    }

    /// Load state from storage
    fn state(&self) -> Result<DataDAOState> {
        self.state_read()
            .unwrap_or_else(|| DataDAOState::default())
    }

    /// Save state to storage
    fn save_state(&self, state: &DataDAOState) -> Result<()> {
        self.state_write(state)
    }
}

// Placeholder structs (to be replaced with real Filecoin types)
#[derive(Serialize, Deserialize)]
struct MarketAddBalanceParams {
    amount: TokenAmount,
}