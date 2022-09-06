use solana_program::{account_info::AccountInfo, program_pack::Pack, pubkey::Pubkey};
use spl_token::state::Account;

pub fn get_mint_address(account_info: &AccountInfo) -> Pubkey {
    let account = Account::unpack_from_slice(&account_info.data.borrow());
    return account.unwrap().mint.clone();
}
