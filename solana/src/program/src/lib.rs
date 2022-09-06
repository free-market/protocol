use crate::engine::execute::execute_workflow;
use solana_program::declare_id;
use solana_program::program_error::ProgramError;
use solana_program::{account_info::AccountInfo, entrypoint, entrypoint::ProgramResult, msg, pubkey::Pubkey};

mod engine;
mod steps;
mod utils;

declare_id!("fmpFA4XgySc6xKec4y5iW8LbQaRpJfhw8Zq9g5LZNvv");

entrypoint!(process_instruction);

// Program entrypoint's implementation
pub fn process_instruction(program_id: &Pubkey, accounts: &[AccountInfo], instruction_data: &[u8]) -> ProgramResult {
    msg!("entering process_instruction");
    msg!("program_id {}", program_id.to_string());

    let operation_id = instruction_data[0];
    let instruction_data_rest = &instruction_data[1..instruction_data.len()];
    msg!("operation_id {}", operation_id);
    return match operation_id {
        0 => Err(ProgramError::InvalidArgument), //set_escrow_account::set_escrow_account(program_id, accounts, &instruction_data_rest),
        1 => execute_workflow(program_id, accounts, &instruction_data_rest),
        _ => Err(ProgramError::InvalidArgument),
    };
}
