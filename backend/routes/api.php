<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Str;

// Helper function to calculate total balance
function calculateTotalBalance($lots) {
    $total = 0;
    foreach ($lots as $lot) {
        $total += $lot['amount'];
    }
    return round($total, 8);
}

// Test route
Route::get('/test', function () {
    return response()->json(['message' => 'API test route is working']);
});

// Public calculation route (for non-logged in users)
Route::post('/calculate-public', function (Request $request) {
    try {
        $transactions = $request->input('transactions');
        
        if (!is_array($transactions)) {
            return response()->json([
                'success' => false,
                'error' => 'Transactions must be an array',
                'received' => $transactions
            ], 400);
        }
        
        if (empty($transactions)) {
            return response()->json([
                'success' => false,
                'error' => 'No transactions provided'
            ], 400);
        }
        
        // Sort transactions by date (oldest first)
        usort($transactions, function($a, $b) {
            $dateA = isset($a['date']) ? strtotime($a['date']) : 0;
            $dateB = isset($b['date']) ? strtotime($b['date']) : 0;
            return $dateA - $dateB;
        });
        
        $balances = [];
        $results = [];
        $yearlySummary = [];
        $taxRates = [
            'short_term' => 0.18,   // 18% for assets held < 3 years
            'long_term' => 0.10,    // 10% for assets held >= 3 years
        ];
        $annualExclusion = 40000;   // R40,000 annual exclusion
        
        foreach ($transactions as $index => $transaction) {
            // Validate required fields
            if (!isset($transaction['type'], $transaction['amount'], $transaction['price'], $transaction['date'])) {
                return response()->json([
                    'success' => false,
                    'error' => "Transaction at index {$index} missing required fields",
                    'transaction' => $transaction
                ], 400);
            }
            
            $type = strtolower(trim($transaction['type']));
            $amount = (float) $transaction['amount'];
            $price = (float) $transaction['price'];
            $date = trim($transaction['date']);
            $coin = isset($transaction['coin']) ? strtoupper(trim($transaction['coin'])) : 'BTC';
            $wallet = isset($transaction['wallet']) ? trim($transaction['wallet']) : 'default';
            
            // Validate numeric values
            if ($amount <= 0) {
                return response()->json([
                    'success' => false,
                    'error' => "Transaction at index {$index} has invalid amount: {$amount}"
                ], 400);
            }
            
            if ($price < 0) {
                return response()->json([
                    'success' => false,
                    'error' => "Transaction at index {$index} has invalid price: {$price}"
                ], 400);
            }
            
            // Validate date format
            if (!strtotime($date)) {
                return response()->json([
                    'success' => false,
                    'error' => "Transaction at index {$index} has invalid date format: {$date}"
                ], 400);
            }
            
            $balanceKey = "{$coin}_{$wallet}";
            
            if (!isset($balances[$balanceKey])) {
                $balances[$balanceKey] = [
                    'coin' => $coin,
                    'wallet' => $wallet,
                    'lots' => []
                ];
            }
            
            if ($type === 'buy') {
                $balances[$balanceKey]['lots'][] = [
                    'amount' => $amount,
                    'price' => $price,
                    'date' => $date,
                    'original_amount' => $amount
                ];
                
                $results[] = [
                    'transaction_id' => $index + 1,
                    'type' => 'BUY',
                    'coin' => $coin,
                    'amount' => $amount,
                    'price' => $price,
                    'date' => $date,
                    'wallet' => $wallet,
                    'details' => "Bought {$amount} {$coin} at R" . number_format($price, 2),
                    'remaining_balance' => calculateTotalBalance($balances[$balanceKey]['lots']),
                    'balance_key' => $balanceKey,
                    'capital_gain' => 0,
                    'total_tax' => 0
                ];
                
            } elseif ($type === 'sell') {
                $capitalGain = 0;
                $remainingAmount = $amount;
                $matchedBuys = [];
                $sellDate = Carbon::parse($date);
                
                foreach ($balances[$balanceKey]['lots'] as $lotIndex => &$lot) {
                    if ($remainingAmount <= 0) break;
                    
                    $sellable = min($remainingAmount, $lot['amount']);
                    $cost = $sellable * $lot['price'];
                    $proceeds = $sellable * $price;
                    $gain = $proceeds - $cost;
                    $capitalGain += $gain;
                    
                    $buyDate = Carbon::parse($lot['date']);
                    $holdingYears = $sellDate->floatDiffInYears($buyDate);
                    $isLongTerm = $holdingYears >= 3;
                    $taxRate = $isLongTerm ? $taxRates['long_term'] : $taxRates['short_term'];
                    $taxableGain = max(0, $gain - ($annualExclusion * ($sellable / $amount)));
                    $taxAmount = $taxableGain * $taxRate;
                    
                    $matchedBuys[] = [
                        'buy_date' => $lot['date'],
                        'buy_price' => $lot['price'],
                        'amount_sold' => $sellable,
                        'cost' => $cost,
                        'proceeds' => $proceeds,
                        'gain' => $gain,
                        'holding_years' => round($holdingYears, 2),
                        'is_long_term' => $isLongTerm,
                        'tax_rate' => $taxRate * 100,
                        'tax_amount' => $taxAmount
                    ];
                    
                    $lot['amount'] -= $sellable;
                    $remainingAmount -= $sellable;
                }
                
                // Remove empty lots
                $balances[$balanceKey]['lots'] = array_values(array_filter(
                    $balances[$balanceKey]['lots'],
                    function($lot) { return $lot['amount'] > 0; }
                ));
                
                $sellYear = $sellDate->year;
                $taxYear = ($sellDate->month >= 3) ? $sellYear + 1 : $sellYear;
                
                if (!isset($yearlySummary[$taxYear])) {
                    $yearlySummary[$taxYear] = [
                        'year' => $taxYear,
                        'total_gains' => 0,
                        'total_tax' => 0,
                        'transactions' => 0
                    ];
                }
                
                $matchedBuysTax = array_sum(array_column($matchedBuys, 'tax_amount'));
                $yearlySummary[$taxYear]['total_gains'] += $capitalGain;
                $yearlySummary[$taxYear]['total_tax'] += $matchedBuysTax;
                $yearlySummary[$taxYear]['transactions']++;
                
                $results[] = [
                    'transaction_id' => $index + 1,
                    'type' => 'SELL',
                    'coin' => $coin,
                    'amount' => $amount,
                    'price' => $price,
                    'date' => $date,
                    'wallet' => $wallet,
                    'capital_gain' => round($capitalGain, 2),
                    'remaining_to_sell' => $remainingAmount,
                    'matched_buys' => $matchedBuys,
                    'total_tax' => round($matchedBuysTax, 2),
                    'tax_year' => $taxYear,
                    'balance_key' => $balanceKey,
                    'remaining_balance' => calculateTotalBalance($balances[$balanceKey]['lots'])
                ];
                
            } elseif ($type === 'trade') {
                $fromCoin = isset($transaction['from_coin']) ? strtoupper(trim($transaction['from_coin'])) : null;
                $toCoin = isset($transaction['to_coin']) ? strtoupper(trim($transaction['to_coin'])) : null;
                
                if (!$fromCoin || !$toCoin) {
                    return response()->json([
                        'success' => false,
                        'error' => "Trade transaction at index {$index} requires from_coin and to_coin",
                        'transaction' => $transaction
                    ], 400);
                }
                
                $fromBalanceKey = "{$fromCoin}_{$wallet}";
                
                if (!isset($balances[$fromBalanceKey])) {
                    return response()->json([
                        'success' => false,
                        'error' => "Insufficient {$fromCoin} balance for trade",
                        'transaction' => $transaction
                    ], 400);
                }
                
                $capitalGain = 0;
                $remainingAmount = $amount;
                $matchedBuys = [];
                $totalProceeds = 0;
                $tradeDate = Carbon::parse($date);
                
                foreach ($balances[$fromBalanceKey]['lots'] as $lotIndex => &$lot) {
                    if ($remainingAmount <= 0) break;
                    
                    $sellable = min($remainingAmount, $lot['amount']);
                    $cost = $sellable * $lot['price'];
                    $proceeds = $sellable * $price;
                    $gain = $proceeds - $cost;
                    $capitalGain += $gain;
                    $totalProceeds += $proceeds;
                    
                    $matchedBuys[] = [
                        'buy_date' => $lot['date'],
                        'buy_price' => $lot['price'],
                        'amount_sold' => $sellable,
                        'cost' => $cost,
                        'proceeds' => $proceeds,
                        'gain' => $gain
                    ];
                    
                    $lot['amount'] -= $sellable;
                    $remainingAmount -= $sellable;
                }
                
                // Remove empty lots
                $balances[$fromBalanceKey]['lots'] = array_values(array_filter(
                    $balances[$fromBalanceKey]['lots'],
                    function($lot) { return $lot['amount'] > 0; }
                ));
                
                $toBalanceKey = "{$toCoin}_{$wallet}";
                if (!isset($balances[$toBalanceKey])) {
                    $balances[$toBalanceKey] = [
                        'coin' => $toCoin,
                        'wallet' => $wallet,
                        'lots' => []
                    ];
                }
                
                if ($price > 0) {
                    $receivedAmount = $totalProceeds / $price;
                } else {
                    $receivedAmount = 0;
                }
                
                $balances[$toBalanceKey]['lots'][] = [
                    'amount' => $receivedAmount,
                    'price' => $price,
                    'date' => $date,
                    'original_amount' => $receivedAmount
                ];
                
                $tradeYear = $tradeDate->year;
                $taxYear = ($tradeDate->month >= 3) ? $tradeYear + 1 : $tradeYear;
                
                if (!isset($yearlySummary[$taxYear])) {
                    $yearlySummary[$taxYear] = [
                        'year' => $taxYear,
                        'total_gains' => 0,
                        'total_tax' => 0,
                        'transactions' => 0
                    ];
                }
                
                $yearlySummary[$taxYear]['total_gains'] += $capitalGain;
                $yearlySummary[$taxYear]['transactions']++;
                
                $results[] = [
                    'transaction_id' => $index + 1,
                    'type' => 'TRADE',
                    'from_coin' => $fromCoin,
                    'to_coin' => $toCoin,
                    'amount' => $amount,
                    'price' => $price,
                    'date' => $date,
                    'wallet' => $wallet,
                    'capital_gain' => round($capitalGain, 2),
                    'received_amount' => round($receivedAmount, 8),
                    'received_coin' => $toCoin,
                    'matched_buys' => $matchedBuys,
                    'tax_year' => $taxYear,
                    'remaining_balance_from' => calculateTotalBalance($balances[$fromBalanceKey]['lots']),
                    'remaining_balance_to' => calculateTotalBalance($balances[$toBalanceKey]['lots']),
                    'total_tax' => 0
                ];
                
            } elseif ($type === 'transfer') {
                $fromWallet = isset($transaction['from_wallet']) ? trim($transaction['from_wallet']) : 'default';
                $toWallet = isset($transaction['to_wallet']) ? trim($transaction['to_wallet']) : 'default';
                
                $fromBalanceKey = "{$coin}_{$fromWallet}";
                $toBalanceKey = "{$coin}_{$toWallet}";
                
                if (!isset($balances[$fromBalanceKey])) {
                    return response()->json([
                        'success' => false,
                        'error' => "Insufficient balance in {$fromWallet} wallet",
                        'transaction' => $transaction
                    ], 400);
                }
                
                $remainingAmount = $amount;
                $transferred = [];
                
                foreach ($balances[$fromBalanceKey]['lots'] as $lotIndex => &$lot) {
                    if ($remainingAmount <= 0) break;
                    
                    $transferAmount = min($remainingAmount, $lot['amount']);
                    
                    $transferred[] = [
                        'amount' => $transferAmount,
                        'price' => $lot['price'],
                        'date' => $lot['date']
                    ];
                    
                    $lot['amount'] -= $transferAmount;
                    $remainingAmount -= $transferAmount;
                }
                
                // Remove empty lots
                $balances[$fromBalanceKey]['lots'] = array_values(array_filter(
                    $balances[$fromBalanceKey]['lots'],
                    function($lot) { return $lot['amount'] > 0; }
                ));
                
                if (!isset($balances[$toBalanceKey])) {
                    $balances[$toBalanceKey] = [
                        'coin' => $coin,
                        'wallet' => $toWallet,
                        'lots' => []
                    ];
                }
                
                foreach ($transferred as $transfer) {
                    $balances[$toBalanceKey]['lots'][] = [
                        'amount' => $transfer['amount'],
                        'price' => $transfer['price'],
                        'date' => $transfer['date'],
                        'original_amount' => $transfer['amount']
                    ];
                }
                
                $results[] = [
                    'transaction_id' => $index + 1,
                    'type' => 'TRANSFER',
                    'coin' => $coin,
                    'amount' => $amount,
                    'date' => $date,
                    'from_wallet' => $fromWallet,
                    'to_wallet' => $toWallet,
                    'transferred' => $transferred,
                    'details' => "Transferred {$amount} {$coin} from {$fromWallet} to {$toWallet}",
                    'remaining_balance_from' => calculateTotalBalance($balances[$fromBalanceKey]['lots']),
                    'remaining_balance_to' => calculateTotalBalance($balances[$toBalanceKey]['lots']),
                    'capital_gain' => 0,
                    'total_tax' => 0
                ];
            } else {
                return response()->json([
                    'success' => false,
                    'error' => "Invalid transaction type '{$type}' at index {$index}",
                    'transaction' => $transaction
                ], 400);
            }
        }
        
        // Prepare final balances
        $finalBalances = [];
        foreach ($balances as $balanceKey => $balanceData) {
            $totalAmount = 0;
            $totalCost = 0;
            
            foreach ($balanceData['lots'] as $lot) {
                $totalAmount += $lot['amount'];
                $totalCost += $lot['amount'] * $lot['price'];
            }
            
            if ($totalAmount > 0) {
                $finalBalances[] = [
                    'coin' => $balanceData['coin'],
                    'wallet' => $balanceData['wallet'],
                    'total_amount' => round($totalAmount, 8),
                    'base_cost' => round($totalCost, 2),
                    'average_cost' => $totalAmount > 0 ? round($totalCost / $totalAmount, 2) : 0,
                    'lots' => array_map(function($lot) {
                        return [
                            'amount' => round($lot['amount'], 8),
                            'price' => round($lot['price'], 2),
                            'date' => $lot['date']
                        ];
                    }, array_values(array_filter($balanceData['lots'], function($lot) {
                        return $lot['amount'] > 0;
                    })))
                ];
            }
        }
        
        // Sort yearly summary
        ksort($yearlySummary);
        $yearlySummary = array_values($yearlySummary);
        
        // Calculate totals
        $totalCapitalGain = 0;
        $totalTax = 0;
        
        foreach ($results as $result) {
            $totalCapitalGain += $result['capital_gain'] ?? 0;
            $totalTax += $result['total_tax'] ?? 0;
        }
        
        // Get unique coins and wallets
        $allCoins = [];
        $allWallets = [];
        foreach ($transactions as $tx) {
            if (!empty($tx['coin'])) $allCoins[] = $tx['coin'];
            if (!empty($tx['wallet'])) $allWallets[] = $tx['wallet'];
        }
        foreach ($finalBalances as $balance) {
            $allCoins[] = $balance['coin'];
            $allWallets[] = $balance['wallet'];
        }
        
        // Get summary counts
        $sellTransactions = array_filter($results, function($r) { 
            return in_array($r['type'], ['SELL', 'TRADE']); 
        });
        
        // Prepare response in the EXACT format expected by frontend
        $responseData = [
            'success' => true,
            'data' => [
                'results' => $results,
                'balances' => $finalBalances,
                'yearlySummary' => $yearlySummary,
                'totalCapitalGain' => round($totalCapitalGain, 2),
                'totalTax' => round($totalTax, 2),
                'summary' => [
                    'transactions_processed' => count($transactions),
                    'sell_transactions' => count($sellTransactions),
                    'years_covered' => count($yearlySummary),
                    'unique_coins' => count(array_unique($allCoins)),
                    'unique_wallets' => count(array_unique($allWallets))
                ]
            ],
            'tax_parameters' => [
                'annual_exclusion' => $annualExclusion,
                'short_term_rate' => $taxRates['short_term'] * 100,
                'long_term_rate' => $taxRates['long_term'] * 100,
                'long_term_threshold_years' => 3,
                'tax_year_start' => '1 March',
                'tax_year_end' => '28/29 February'
            ]
        ];
        
        return response()->json($responseData);
        
    } catch (\Exception $e) {
        \Log::error('Calculation error: ' . $e->getMessage(), [
            'trace' => $e->getTraceAsString(),
            'request' => $request->all()
        ]);
        
        return response()->json([
            'success' => false,
            'error' => 'Calculation error: ' . $e->getMessage(),
            'trace' => config('app.debug') ? $e->getTraceAsString() : null
        ], 500);
    }
});

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    
    // Authenticated calculation route
    Route::post('/calculate', function (Request $request) {
        try {
            $transactions = $request->input('transactions');
            
            if (!is_array($transactions)) {
                return response()->json([
                    'success' => false,
                    'error' => 'Transactions must be an array',
                    'received' => $transactions
                ], 400);
            }
            
            if (empty($transactions)) {
                return response()->json([
                    'success' => false,
                    'error' => 'No transactions provided'
                ], 400);
            }
            
            // Sort transactions by date (oldest first)
            usort($transactions, function($a, $b) {
                $dateA = isset($a['date']) ? strtotime($a['date']) : 0;
                $dateB = isset($b['date']) ? strtotime($b['date']) : 0;
                return $dateA - $dateB;
            });
            
            $balances = [];
            $results = [];
            $yearlySummary = [];
            $taxRates = [
                'short_term' => 0.18,   // 18% for assets held < 3 years
                'long_term' => 0.10,    // 10% for assets held >= 3 years
            ];
            $annualExclusion = 40000;   // R40,000 annual exclusion
            
            foreach ($transactions as $index => $transaction) {
                // Validate required fields
                if (!isset($transaction['type'], $transaction['amount'], $transaction['price'], $transaction['date'])) {
                    return response()->json([
                        'success' => false,
                        'error' => "Transaction at index {$index} missing required fields",
                        'transaction' => $transaction
                    ], 400);
                }
                
                $type = strtolower(trim($transaction['type']));
                $amount = (float) $transaction['amount'];
                $price = (float) $transaction['price'];
                $date = trim($transaction['date']);
                $coin = isset($transaction['coin']) ? strtoupper(trim($transaction['coin'])) : 'BTC';
                $wallet = isset($transaction['wallet']) ? trim($transaction['wallet']) : 'default';
                
                // Validate numeric values
                if ($amount <= 0) {
                    return response()->json([
                        'success' => false,
                        'error' => "Transaction at index {$index} has invalid amount: {$amount}"
                    ], 400);
                }
                
                if ($price < 0) {
                    return response()->json([
                        'success' => false,
                        'error' => "Transaction at index {$index} has invalid price: {$price}"
                    ], 400);
                }
                
                // Validate date format
                if (!strtotime($date)) {
                    return response()->json([
                        'success' => false,
                        'error' => "Transaction at index {$index} has invalid date format: {$date}"
                    ], 400);
                }
                
                $balanceKey = "{$coin}_{$wallet}";
                
                if (!isset($balances[$balanceKey])) {
                    $balances[$balanceKey] = [
                        'coin' => $coin,
                        'wallet' => $wallet,
                        'lots' => []
                    ];
                }
                
                if ($type === 'buy') {
                    $balances[$balanceKey]['lots'][] = [
                        'amount' => $amount,
                        'price' => $price,
                        'date' => $date,
                        'original_amount' => $amount
                    ];
                    
                    $results[] = [
                        'transaction_id' => $index + 1,
                        'type' => 'BUY',
                        'coin' => $coin,
                        'amount' => $amount,
                        'price' => $price,
                        'date' => $date,
                        'wallet' => $wallet,
                        'details' => "Bought {$amount} {$coin} at R" . number_format($price, 2),
                        'remaining_balance' => calculateTotalBalance($balances[$balanceKey]['lots']),
                        'balance_key' => $balanceKey,
                        'capital_gain' => 0,
                        'total_tax' => 0
                    ];
                    
                } elseif ($type === 'sell') {
                    $capitalGain = 0;
                    $remainingAmount = $amount;
                    $matchedBuys = [];
                    $sellDate = Carbon::parse($date);
                    
                    foreach ($balances[$balanceKey]['lots'] as $lotIndex => &$lot) {
                        if ($remainingAmount <= 0) break;
                        
                        $sellable = min($remainingAmount, $lot['amount']);
                        $cost = $sellable * $lot['price'];
                        $proceeds = $sellable * $price;
                        $gain = $proceeds - $cost;
                        $capitalGain += $gain;
                        
                        $buyDate = Carbon::parse($lot['date']);
                        $holdingYears = $sellDate->floatDiffInYears($buyDate);
                        $isLongTerm = $holdingYears >= 3;
                        $taxRate = $isLongTerm ? $taxRates['long_term'] : $taxRates['short_term'];
                        $taxableGain = max(0, $gain - ($annualExclusion * ($sellable / $amount)));
                        $taxAmount = $taxableGain * $taxRate;
                        
                        $matchedBuys[] = [
                            'buy_date' => $lot['date'],
                            'buy_price' => $lot['price'],
                            'amount_sold' => $sellable,
                            'cost' => $cost,
                            'proceeds' => $proceeds,
                            'gain' => $gain,
                            'holding_years' => round($holdingYears, 2),
                            'is_long_term' => $isLongTerm,
                            'tax_rate' => $taxRate * 100,
                            'tax_amount' => $taxAmount
                        ];
                        
                        $lot['amount'] -= $sellable;
                        $remainingAmount -= $sellable;
                    }
                    
                    // Remove empty lots
                    $balances[$balanceKey]['lots'] = array_values(array_filter(
                        $balances[$balanceKey]['lots'],
                        function($lot) { return $lot['amount'] > 0; }
                    ));
                    
                    $sellYear = $sellDate->year;
                    $taxYear = ($sellDate->month >= 3) ? $sellYear + 1 : $sellYear;
                    
                    if (!isset($yearlySummary[$taxYear])) {
                        $yearlySummary[$taxYear] = [
                            'year' => $taxYear,
                            'total_gains' => 0,
                            'total_tax' => 0,
                            'transactions' => 0
                        ];
                    }
                    
                    $matchedBuysTax = array_sum(array_column($matchedBuys, 'tax_amount'));
                    $yearlySummary[$taxYear]['total_gains'] += $capitalGain;
                    $yearlySummary[$taxYear]['total_tax'] += $matchedBuysTax;
                    $yearlySummary[$taxYear]['transactions']++;
                    
                    $results[] = [
                        'transaction_id' => $index + 1,
                        'type' => 'SELL',
                        'coin' => $coin,
                        'amount' => $amount,
                        'price' => $price,
                        'date' => $date,
                        'wallet' => $wallet,
                        'capital_gain' => round($capitalGain, 2),
                        'remaining_to_sell' => $remainingAmount,
                        'matched_buys' => $matchedBuys,
                        'total_tax' => round($matchedBuysTax, 2),
                        'tax_year' => $taxYear,
                        'balance_key' => $balanceKey,
                        'remaining_balance' => calculateTotalBalance($balances[$balanceKey]['lots'])
                    ];
                    
                } elseif ($type === 'trade') {
                    $fromCoin = isset($transaction['from_coin']) ? strtoupper(trim($transaction['from_coin'])) : null;
                    $toCoin = isset($transaction['to_coin']) ? strtoupper(trim($transaction['to_coin'])) : null;
                    
                    if (!$fromCoin || !$toCoin) {
                        return response()->json([
                            'success' => false,
                            'error' => "Trade transaction at index {$index} requires from_coin and to_coin",
                            'transaction' => $transaction
                        ], 400);
                    }
                    
                    $fromBalanceKey = "{$fromCoin}_{$wallet}";
                    
                    if (!isset($balances[$fromBalanceKey])) {
                        return response()->json([
                            'success' => false,
                            'error' => "Insufficient {$fromCoin} balance for trade",
                            'transaction' => $transaction
                        ], 400);
                    }
                    
                    $capitalGain = 0;
                    $remainingAmount = $amount;
                    $matchedBuys = [];
                    $totalProceeds = 0;
                    $tradeDate = Carbon::parse($date);
                    
                    foreach ($balances[$fromBalanceKey]['lots'] as $lotIndex => &$lot) {
                        if ($remainingAmount <= 0) break;
                        
                        $sellable = min($remainingAmount, $lot['amount']);
                        $cost = $sellable * $lot['price'];
                        $proceeds = $sellable * $price;
                        $gain = $proceeds - $cost;
                        $capitalGain += $gain;
                        $totalProceeds += $proceeds;
                        
                        $matchedBuys[] = [
                            'buy_date' => $lot['date'],
                            'buy_price' => $lot['price'],
                            'amount_sold' => $sellable,
                            'cost' => $cost,
                            'proceeds' => $proceeds,
                            'gain' => $gain
                        ];
                        
                        $lot['amount'] -= $sellable;
                        $remainingAmount -= $sellable;
                    }
                    
                    // Remove empty lots
                    $balances[$fromBalanceKey]['lots'] = array_values(array_filter(
                        $balances[$fromBalanceKey]['lots'],
                        function($lot) { return $lot['amount'] > 0; }
                    ));
                    
                    $toBalanceKey = "{$toCoin}_{$wallet}";
                    if (!isset($balances[$toBalanceKey])) {
                        $balances[$toBalanceKey] = [
                            'coin' => $toCoin,
                            'wallet' => $wallet,
                            'lots' => []
                        ];
                    }
                    
                    if ($price > 0) {
                        $receivedAmount = $totalProceeds / $price;
                    } else {
                        $receivedAmount = 0;
                    }
                    
                    $balances[$toBalanceKey]['lots'][] = [
                        'amount' => $receivedAmount,
                        'price' => $price,
                        'date' => $date,
                        'original_amount' => $receivedAmount
                    ];
                    
                    $tradeYear = $tradeDate->year;
                    $taxYear = ($tradeDate->month >= 3) ? $tradeYear + 1 : $tradeYear;
                    
                    if (!isset($yearlySummary[$taxYear])) {
                        $yearlySummary[$taxYear] = [
                            'year' => $taxYear,
                            'total_gains' => 0,
                            'total_tax' => 0,
                            'transactions' => 0
                        ];
                    }
                    
                    $yearlySummary[$taxYear]['total_gains'] += $capitalGain;
                    $yearlySummary[$taxYear]['transactions']++;
                    
                    $results[] = [
                        'transaction_id' => $index + 1,
                        'type' => 'TRADE',
                        'from_coin' => $fromCoin,
                        'to_coin' => $toCoin,
                        'amount' => $amount,
                        'price' => $price,
                        'date' => $date,
                        'wallet' => $wallet,
                        'capital_gain' => round($capitalGain, 2),
                        'received_amount' => round($receivedAmount, 8),
                        'received_coin' => $toCoin,
                        'matched_buys' => $matchedBuys,
                        'tax_year' => $taxYear,
                        'remaining_balance_from' => calculateTotalBalance($balances[$fromBalanceKey]['lots']),
                        'remaining_balance_to' => calculateTotalBalance($balances[$toBalanceKey]['lots']),
                        'total_tax' => 0
                    ];
                    
                } elseif ($type === 'transfer') {
                    $fromWallet = isset($transaction['from_wallet']) ? trim($transaction['from_wallet']) : 'default';
                    $toWallet = isset($transaction['to_wallet']) ? trim($transaction['to_wallet']) : 'default';
                    
                    $fromBalanceKey = "{$coin}_{$fromWallet}";
                    $toBalanceKey = "{$coin}_{$toWallet}";
                    
                    if (!isset($balances[$fromBalanceKey])) {
                        return response()->json([
                            'success' => false,
                            'error' => "Insufficient balance in {$fromWallet} wallet",
                            'transaction' => $transaction
                        ], 400);
                    }
                    
                    $remainingAmount = $amount;
                    $transferred = [];
                    
                    foreach ($balances[$fromBalanceKey]['lots'] as $lotIndex => &$lot) {
                        if ($remainingAmount <= 0) break;
                        
                        $transferAmount = min($remainingAmount, $lot['amount']);
                        
                        $transferred[] = [
                            'amount' => $transferAmount,
                            'price' => $lot['price'],
                            'date' => $lot['date']
                        ];
                        
                        $lot['amount'] -= $transferAmount;
                        $remainingAmount -= $transferAmount;
                    }
                    
                    // Remove empty lots
                    $balances[$fromBalanceKey]['lots'] = array_values(array_filter(
                        $balances[$fromBalanceKey]['lots'],
                        function($lot) { return $lot['amount'] > 0; }
                    ));
                    
                    if (!isset($balances[$toBalanceKey])) {
                        $balances[$toBalanceKey] = [
                            'coin' => $coin,
                            'wallet' => $toWallet,
                            'lots' => []
                        ];
                    }
                    
                    foreach ($transferred as $transfer) {
                        $balances[$toBalanceKey]['lots'][] = [
                            'amount' => $transfer['amount'],
                            'price' => $transfer['price'],
                            'date' => $transfer['date'],
                            'original_amount' => $transfer['amount']
                        ];
                    }
                    
                    $results[] = [
                        'transaction_id' => $index + 1,
                        'type' => 'TRANSFER',
                        'coin' => $coin,
                        'amount' => $amount,
                        'date' => $date,
                        'from_wallet' => $fromWallet,
                        'to_wallet' => $toWallet,
                        'transferred' => $transferred,
                        'details' => "Transferred {$amount} {$coin} from {$fromWallet} to {$toWallet}",
                        'remaining_balance_from' => calculateTotalBalance($balances[$fromBalanceKey]['lots']),
                        'remaining_balance_to' => calculateTotalBalance($balances[$toBalanceKey]['lots']),
                        'capital_gain' => 0,
                        'total_tax' => 0
                    ];
                } else {
                    return response()->json([
                        'success' => false,
                        'error' => "Invalid transaction type '{$type}' at index {$index}",
                        'transaction' => $transaction
                    ], 400);
                }
            }
            
            // Prepare final balances
            $finalBalances = [];
            foreach ($balances as $balanceKey => $balanceData) {
                $totalAmount = 0;
                $totalCost = 0;
                
                foreach ($balanceData['lots'] as $lot) {
                    $totalAmount += $lot['amount'];
                    $totalCost += $lot['amount'] * $lot['price'];
                }
                
                if ($totalAmount > 0) {
                    $finalBalances[] = [
                        'coin' => $balanceData['coin'],
                        'wallet' => $balanceData['wallet'],
                        'total_amount' => round($totalAmount, 8),
                        'base_cost' => round($totalCost, 2),
                        'average_cost' => $totalAmount > 0 ? round($totalCost / $totalAmount, 2) : 0,
                        'lots' => array_map(function($lot) {
                            return [
                                'amount' => round($lot['amount'], 8),
                                'price' => round($lot['price'], 2),
                                'date' => $lot['date']
                            ];
                        }, array_values(array_filter($balanceData['lots'], function($lot) {
                            return $lot['amount'] > 0;
                        })))
                    ];
                }
            }
            
            // Sort yearly summary
            ksort($yearlySummary);
            $yearlySummary = array_values($yearlySummary);
            
            // Calculate totals
            $totalCapitalGain = 0;
            $totalTax = 0;
            
            foreach ($results as $result) {
                $totalCapitalGain += $result['capital_gain'] ?? 0;
                $totalTax += $result['total_tax'] ?? 0;
            }
            
            // Get unique coins and wallets
            $allCoins = [];
            $allWallets = [];
            foreach ($transactions as $tx) {
                if (!empty($tx['coin'])) $allCoins[] = $tx['coin'];
                if (!empty($tx['wallet'])) $allWallets[] = $tx['wallet'];
            }
            foreach ($finalBalances as $balance) {
                $allCoins[] = $balance['coin'];
                $allWallets[] = $balance['wallet'];
            }
            
            // Get summary counts
            $sellTransactions = array_filter($results, function($r) { 
                return in_array($r['type'], ['SELL', 'TRADE']); 
            });
            
            // Prepare response in the EXACT format expected by frontend
            $responseData = [
                'success' => true,
                'data' => [
                    'results' => $results,
                    'balances' => $finalBalances,
                    'yearlySummary' => $yearlySummary,
                    'totalCapitalGain' => round($totalCapitalGain, 2),
                    'totalTax' => round($totalTax, 2),
                    'summary' => [
                        'transactions_processed' => count($transactions),
                        'sell_transactions' => count($sellTransactions),
                        'years_covered' => count($yearlySummary),
                        'unique_coins' => count(array_unique($allCoins)),
                        'unique_wallets' => count(array_unique($allWallets))
                    ]
                ],
                'tax_parameters' => [
                    'annual_exclusion' => $annualExclusion,
                    'short_term_rate' => $taxRates['short_term'] * 100,
                    'long_term_rate' => $taxRates['long_term'] * 100,
                    'long_term_threshold_years' => 3,
                    'tax_year_start' => '1 March',
                    'tax_year_end' => '28/29 February'
                ]
            ];
            
            return response()->json($responseData);
            
        } catch (\Exception $e) {
            \Log::error('Calculation error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request' => $request->all()
            ]);
            
            return response()->json([
                'success' => false,
                'error' => 'Calculation error: ' . $e->getMessage(),
                'trace' => config('app.debug') ? $e->getTraceAsString() : null
            ], 500);
        }
    });
});

