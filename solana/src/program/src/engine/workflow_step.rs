use borsh::maybestd::vec::Vec;
use borsh::BorshDeserialize;
use solana_program::account_info::AccountInfo;
use solana_program::pubkey::Pubkey;

#[derive(BorshDeserialize)]
pub struct WorkflowStepArgs {
    pub step_id: u16,
    // pub from_token: Pubkey,
    pub amount: u64,
    pub amount_is_percent: bool,
    pub step_args: Vec<u8>,
}

#[derive(BorshDeserialize)]
pub struct WorkflowArgs {
    pub steps: borsh::maybestd::vec::Vec<WorkflowStepArgs>,
}

pub struct WorkflowStepResult {
    pub from_mint_address: Option<Pubkey>,
    pub to_mint_address: Option<Pubkey>,
    pub amount: u64,
}

pub trait WorkflowStep {
    // return the 'from' account for this step
    fn name(&self) -> &'static str;
    fn deserialize_step_data(&mut self, step_args: &Vec<u8>);
    fn get_from_mint_address(&self, accounts: &[AccountInfo]) -> Pubkey;
    fn execute(&self, program_id: &Pubkey, accounts: &[AccountInfo], amount: u64) -> WorkflowStepResult;
}
