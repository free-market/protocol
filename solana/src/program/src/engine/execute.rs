use crate::engine::workflow_step::WorkflowArgs;
use crate::steps::get_workflow_step;
use borsh::BorshDeserialize;
use solana_program::{account_info::AccountInfo, entrypoint::ProgramResult, msg, pubkey::Pubkey};
use std::collections::HashMap;

pub fn execute_workflow(program_id: &Pubkey, accounts: &[AccountInfo], instruction_data: &[u8]) -> ProgramResult {
    // let w = "authority".as_bytes();
    let seeds: &[&[u8]] = &["authority".as_bytes()];
    let transfer_authority_pubkey = Pubkey::create_program_address(seeds, &program_id).unwrap();
    msg!("transfer_authority_pubkey {}", transfer_authority_pubkey.to_string());

    // msg!("accounts.len {}", accounts.len());
    // for account in accounts {
    //     msg!(&format!("  ---- account: ----  {account:#?}"));
    // }

    let workflow = WorkflowArgs::try_from_slice(&instruction_data).unwrap();
    msg!("workflow contains {} steps", workflow.steps.len());
    let mut token_balances: HashMap<Pubkey, u64> = HashMap::new();
    for step in &workflow.steps {
        msg!(
            "    step_id={} amount={} amount_is_percent={}",
            step.step_id,
            step.amount,
            step.amount_is_percent,
        );
        msg!("   argsLen={}", step.step_args.len());
        // for i in 0..step.step_args.len() {
        //     msg!("        {}={}", i, step.step_args[i]);
        // }
        let mut step_impl = get_workflow_step(step.step_id);
        msg!("prepairing for step {}", step_impl.name());
        step_impl.deserialize_step_data(&step.step_args);
        let mut amount = step.amount;
        if !step.amount_is_percent {
            msg!("amount is absolute {}", amount);
        } else {
            let from_mint_addr = step_impl.get_from_mint_address(accounts);
            msg!("amount is {}% of balance for token {}", amount, from_mint_addr.to_string());
            // if there's nothing in the balances map for this token, let it error out
            let balance = token_balances.get(&from_mint_addr).cloned().unwrap() as f64;
            let percent = amount as f64;
            amount = (balance * (percent / 100.0)) as u64;
            msg!("amount_is_percent new amount={}", amount);
        }

        msg!("calling execute on {}", step_impl.name());
        let result = step_impl.execute(program_id, accounts, amount);
        msg!("back from {}", step_impl.name());

        if result.from_mint_address.is_some() {
            msg!("debiting {} from {}", amount, result.from_mint_address.unwrap().to_string());
            token_balances
                .entry(result.from_mint_address.unwrap())
                .and_modify(|from_balance| *from_balance -= amount);
        }
        if result.to_mint_address.is_some() {
            msg!("crediting {} to {}", amount, result.to_mint_address.unwrap().to_string());
            token_balances
                .entry(result.to_mint_address.unwrap())
                .and_modify(|to_balance| *to_balance += result.amount)
                .or_insert(result.amount);
        }

        for (mint_address, balance) in &token_balances {
            msg!("balance {}: {}", mint_address.to_string(), balance);
        }
    }

    // let step = &workflow.steps[0];
    // transfer_spl_tokens::transfer_spl_tokens_step(program_id, &step.step_args, accounts, step.amount);

    msg!("leaving process_instruction");
    Ok(())
}
