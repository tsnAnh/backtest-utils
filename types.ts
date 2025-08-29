
export interface VaultData {
    timestamp: string;
    vault_id: string;
    total_value_usd: number;
    available_liquidity: number;
    collateral_token_amount: number;
    token_a_price: number;
    token_b_price: number;
    token_usdc_price: number;
    total_investment_usd: number;
    total_return_usd: number;
    total_return_percentage: number;
    active_positions_count: number;
    closed_positions_count: number;
    position_total_liquidity: number;
    accumulated_fee_earned: number;
    accumulated_gas_fee: number;
    event_type: string;
    event_description: string;
}

export interface PositionData {
    timestamp: string;
    position_id: string;
    vault_id: string;
    event_type: string;
    action_type: string;
    pool_address: string;
    min_price: number;
    max_price: number;
    inner_min_price: number;
    inner_max_price: number;
    current_price: number;
    position_width_percentage: number;
    token_a_amount: number;
    token_b_amount: number;
    current_liquidity_usd: number;
    start_liquidity_usd: number;
    fee_earned: number;
    position_return_usd: number;
    position_return_percentage: number;
    il: number;
    apr: number;
    trigger_reason: string;
    ai_explanation: string;
    confidence_score: number;
    rebalance_action: string;
    rebalance_amount: number;
}

export interface VaultResults {
    highestProfit: number;
    lowestProfit: number;
    totalFeeReturned: number;
    totalGasFee: number;
}

export interface PositionResults {
    dailyOutOfRangeCount: number;
    avgPriceRangeLast30Days: number;
}

export interface VaultFileResult {
    fileName: string;
    results: VaultResults;
}

export interface PositionFileResult {
    fileName: string;
    results: PositionResults;
}
