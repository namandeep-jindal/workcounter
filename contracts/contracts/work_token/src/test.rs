#![cfg(test)]

use super::*;
use soroban_sdk::{vec, Env, String, Address, testutils::Address as _};

#[test]
fn test_token_initialization() {
    let e = Env::default();
    e.mock_all_auths();
    
    let admin = Address::generate(&e);
    let token_id = e.register_contract(None, WorkToken);
    let client = WorkTokenClient::new(&e, &token_id);
    
    let name = String::from_str(&e, "WorkCounterToken");
    let symbol = String::from_str(&e, "WRKC");
    
    client.initialize(&admin, &7, &name, &symbol);
    
    assert_eq!(client.name(), name);
    assert_eq!(client.symbol(), symbol);
}
