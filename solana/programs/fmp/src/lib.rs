use anchor_lang::prelude::*;
// use borsh::{BorshDeserialize, BorshSerialize};

declare_id!("F1EJHnyEDWfbTs1bM36an7szd8ftuXJZHL4oFw9mxaiZ");

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct WorkflowStep {
    pub step_id: u16,
    pub data: Vec<u8>,
    pub amount: u64,
    pub amount_is_percent: bool,
}

pub mod wormhole;

#[program]
pub mod fmp {
    use super::*;
    pub fn initialize(_ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }

    pub fn execute_workflow(_ctx: Context<UserAccount>, steps: Vec<WorkflowStep>) -> Result<()> {
        msg!("hi");
        msg!("{} steps", steps.len());
        msg!("steps.0.step_id: {}", steps[0].step_id);
        msg!("steps.0.data.len(): {}", steps[0].data.len());
        for i in 0..steps[0].data.len() {
            msg!("steps.0.data[{}]={}", i, steps[0].data[i]);
        }
        wormhole::wormhole(&steps[0].data, steps[0].amount);
        let _sender = &_ctx.accounts.sender;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}

#[derive(Accounts)]
pub struct UserAccount<'info> {
    pub sender: Signer<'info>,
}
