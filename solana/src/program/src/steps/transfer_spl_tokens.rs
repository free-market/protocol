use crate::engine::workflow_step::WorkflowStep;
use crate::engine::workflow_step::WorkflowStepResult;
use crate::utils::get_mint_address;
use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{account_info::AccountInfo, declare_id, msg, program::invoke_signed, pubkey::Pubkey};
use spl_token::instruction::transfer;

#[derive(BorshDeserialize, BorshSerialize, Default, Debug, Copy, Clone)]
pub struct SplTokenTransferArgs {
    pub from_account_index: u16, // from token address
    pub to_account_index: u16,   // to token address
}

declare_id!("fmpFA4XgySc6xKec4y5iW8LbQaRpJfhw8Zq9g5LZNvv");

const DELEGATE_ACCOUNT_SEEDS: &[&[u8]] = &["delegate".as_bytes()];

#[derive(Default, Debug, Copy, Clone)]
pub struct TransferSplTokensStep {
    pub args: Option<SplTokenTransferArgs>,
}

impl WorkflowStep for TransferSplTokensStep {
    fn name(&self) -> &'static str {
        return "TransferSplTokensStep";
    }

    fn deserialize_step_data(&mut self, step_args: &Vec<u8>) {
        self.args = Some(SplTokenTransferArgs::try_from_slice(&step_args).unwrap());
    }

    fn get_from_mint_address(&self, accounts: &[AccountInfo]) -> Pubkey {
        let args = self.args.as_ref().unwrap();
        let from_idx: usize = args.from_account_index.into();
        return get_mint_address(&accounts[from_idx]);
    }

    fn execute(&self, program_id: &Pubkey, accounts: &[AccountInfo], amount: u64) -> WorkflowStepResult {
        msg!("entering transfer_spl_tokens ");
        let delegate_account_pubkey: Pubkey = Pubkey::create_program_address(DELEGATE_ACCOUNT_SEEDS, &id()).unwrap();
        msg!("delegate_account_pubkey {}", delegate_account_pubkey.to_string());

        let caller = accounts[0].clone();
        let this_program = accounts[1].clone();
        let token_program = accounts[2].clone();
        let delegate_account = accounts[3].clone();
        msg!(
            "transfer_spl_tokens args: program_id={} caller={} delegate={} amount={}",
            program_id.to_string(),
            caller.key.to_string(),
            delegate_account.key.to_string(),
            amount
        );

        let args = self.args.as_ref().unwrap();
        msg!("self.args from_idx={} to_idx={}", args.from_account_index, args.to_account_index);
        let from_idx: usize = args.from_account_index.into();
        let from_account_info = accounts[from_idx].clone();
        let to_idx: usize = args.to_account_index.into();
        let to_account_info = accounts[to_idx].clone();
        msg!(
            "self.args from_addr={} to_addr={} amount={}",
            from_account_info.key.to_string(),
            to_account_info.key.to_string(),
            amount
        );

        msg!("from owner={}", from_account_info.owner.to_string());

        let result = transfer(
            &spl_token::ID,
            from_account_info.key,
            to_account_info.key,
            &delegate_account_pubkey,
            // &[&program_id],
            &[], // <- that's what wh does
            amount,
        );

        msg!("about to unwrap");
        let ix = result.unwrap();
        msg!("about to invoke");

        let tx_result = invoke_signed(
            &ix,
            &[caller, this_program, token_program, from_account_info, to_account_info, delegate_account],
            &[DELEGATE_ACCOUNT_SEEDS],
        );
        msg!("back from invoke");
        tx_result.unwrap(); // unwrapping will panic if there was a problem in the transaction

        msg!("leaving transfer_spl_tokens");
        return WorkflowStepResult {
            from_mint_address: Some(get_mint_address(&accounts[from_idx])),
            to_mint_address: Some(get_mint_address(&accounts[to_idx])),
            amount,
        };
    }
}

pub static TRANSFER_SPL_TOKENS_STEP: TransferSplTokensStep = TransferSplTokensStep { args: None };

pub fn instance() -> Box<dyn WorkflowStep> {
    return Box::new(TRANSFER_SPL_TOKENS_STEP);
}
