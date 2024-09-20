
// IDs used by smart contracts
export const STEP_TYPE_ID_CHAIN_BRANCH = 1;
export const STEP_TYPE_ID_ASSET_BALANCE_BRANCH = 2;
export const STEP_TYPE_ID_PREV_OUTPUT_BRANCH = 3;

export const STEP_TYPE_ID_ADD_ASSET = 100;
export const STEP_TYPE_ID_STARGATE_BRIDGE = 101;
export const STEP_TYPE_ID_AAVE_SUPPLY = 102;
export const STEP_TYPE_ID_CURVE = 103;
export const STEP_TYPE_ID_UNISWAP_EXACT_IN = 104;
export const STEP_TYPE_ID_WRAP_NATIVE = 105
export const STEP_TYPE_ID_UNWRAP_NATIVE = 106;
export const STEP_TYPE_ID_UNISWAP_ADD_LIQUIDITY = 108;
export const STEP_TYPE_ID_UNISWAP_EXACT_OUT = 109;
export const STEP_TYPE_ID_AAVE_BORROW = 110;
export const STEP_TYPE_ID_AAVE_REPAY = 111;

export const STEP_TYPE_ID_RENZO_ETH_TO_EZETH = 204;
export const STEP_TYPE_ID_LIDO_ETH_TO_STETH = 205
export const STEP_TYPE_ID_LIDO_STETH_TO_WSTETH = 206
export const STEP_TYPE_ID_LIDO_WSTETH_TO_STETH = 207;

export const STEP_TYPE_ID_PENDLE_TOKEN_TO_PTYT = 301;

/*
 string stepTypes used by JSON Workflow files
 createStepHelper translates stepType ->  helper,  then 
 helper fills in the stepId when encoding the step for EVM
*/

export const STEP_TYPE_AAVE_SUPPLY = 'aave-supply'
export const STEP_TYPE_AAVE_BORROW = 'aave-borrow'
export const STEP_TYPE_AAVE_REPAY = 'aave-repay'
export const STEP_TYPE_ADD_ASSET = 'add-asset'
export const STEP_TYPE_CHAIN_BRANCH = 'chain-branch'
export const STEP_TYPE_ASSET_BALANCE_BRANCH = 'asset-balance-branch'
export const STEP_TYPE_STARGATE_BRIDGE = 'stargate-bridge'
export const STEP_TYPE_WRAP_NATIVE = 'wrap-native'
export const STEP_TYPE_UNWRAP_NATIVE = 'unwrap-native'
export const STEP_TYPE_UNISWAP_EXACT_IN = 'uniswap-exact-in'
export const STEP_TYPE_UNISWAP_EXACT_OUT = 'uniswap-exact-out'
export const STEP_TYPE_PREV_OUTPUT_BRANCH = 'previous-output-branch'
/*
defined strings in createStep without IDs:

'curve-tricrypto2-swap': CurveTriCrypto2SwapHelper,
'': PreviousOutputBranchHelper,
'1inch': StubHelper,
*/


// flags to specify step roles
export const STEP_FLAG_CAN_CONTINUE = 1 << 1;
