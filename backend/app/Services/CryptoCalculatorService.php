<?php

namespace App\Services;

use Carbon\Carbon;

class CryptoCalculatorService
{
    private $balances = [];
    private $transactions = [];
    private $results = [];
    private $baseCostSnapshots = [];
    private $yearlyCapitalGains = [];
    private $fees = 0.0025; // 0.25% exchange fee

    public function __construct(array $transactions)
    {
        $this->transactions = $this->sortTransactions($transactions);
        $this->initializeBalances();
    }

    private function sortTransactions(array $transactions): array
    {
        usort($transactions, function ($a, $b) {
            return strtotime($a['date']) - strtotime($b['date']);
        });
        
        return array_map(function ($transaction, $index) {
            return [
                'id' => $index + 1,
                'coin' => strtoupper($transaction['coin'] ?? 'BTC'),
                'type' => strtolower($transaction['type']),
                'amount' => floatval($transaction['amount']),
                'price' => floatval($transaction['price']),
                'date' => Carbon::parse($transaction['date']),
                'fee' => isset($transaction['fee']) ? floatval($transaction['fee']) : 0,
                'fee_coin' => $transaction['fee_coin'] ?? null,
                'wallet' => $transaction['wallet'] ?? 'default',
                'from_coin' => $transaction['from_coin'] ?? null,
                'to_coin' => $transaction['to_coin'] ?? null,
                'from_wallet' => $transaction['from_wallet'] ?? null,
                'to_wallet' => $transaction['to_wallet'] ?? null,
            ];
        }, $transactions, array_keys($transactions));
    }

    private function initializeBalances(): void
    {
        $this->balances = [];
    }

    public function calculate(): array
    {
        foreach ($this->transactions as $transaction) {
            $this->processTransaction($transaction);
            $this->takeBaseCostSnapshot($transaction['date']);
        }

        $this->calculateYearlyCapitalGains();
        
        return [
            'transactions' => array_map(function ($tx) {
                $tx['date'] = $tx['date']->format('Y-m-d');
                return $tx;
            }, $this->transactions),
            'results' => $this->results,
            'balances' => $this->getCurrentBalances(),
            'baseCostSnapshots' => $this->baseCostSnapshots,
            'yearlyCapitalGains' => $this->yearlyCapitalGains,
            'totalCapitalGain' => $this->calculateTotalCapitalGain(),
            'totalFees' => $this->calculateTotalFees(),
        ];
    }

    private function processTransaction(array $transaction): void
    {
        switch ($transaction['type']) {
            case 'buy':
                $this->processBuy($transaction);
                break;
            case 'sell':
                $this->processSell($transaction);
                break;
            case 'trade':
                $this->processTrade($transaction);
                break;
            case 'transfer':
                $this->processTransfer($transaction);
                break;
        }
    }

    private function processBuy(array $transaction): void
    {
        $balanceKey = $this->getBalanceKey($transaction['coin'], $transaction['wallet']);
        
        if (!isset($this->balances[$balanceKey])) {
            $this->balances[$balanceKey] = [
                'coin' => $transaction['coin'],
                'wallet' => $transaction['wallet'],
                'balances' => []
            ];
        }

        $feeAmount = $transaction['amount'] * $this->fees;
        $effectiveAmount = $transaction['amount'] - $feeAmount;
        
        $this->balances[$balanceKey]['balances'][] = [
            'amount' => $effectiveAmount,
            'price' => $transaction['price'],
            'date' => $transaction['date']
        ];

        $this->results[] = [
            'transaction_id' => $transaction['id'],
            'type' => 'BUY',
            'processed_amount' => $effectiveAmount,
            'fee' => $feeAmount,
            'details' => "Added {$effectiveAmount} {$transaction['coin']} to {$transaction['wallet']} wallet",
            'balance_key' => $balanceKey
        ];
    }

    private function processSell(array $transaction): void
    {
        $balanceKey = $this->getBalanceKey($transaction['coin'], $transaction['wallet']);
        
        if (!isset($this->balances[$balanceKey])) {
            $this->results[] = [
                'transaction_id' => $transaction['id'],
                'type' => 'SELL',
                'error' => "Insufficient {$transaction['coin']} balance for sale",
                'capital_gain' => 0
            ];
            return;
        }

        $capitalGain = 0;
        $remainingAmount = $transaction['amount'];
        $matchedBuys = [];
        
        foreach ($this->balances[$balanceKey]['balances'] as $index => &$balance) {
            if ($remainingAmount <= 0) break;

            $sellable = min($remainingAmount, $balance['amount']);
            $cost = $sellable * $balance['price'];
            $proceeds = $sellable * $transaction['price'];
            
            // Calculate fee
            $fee = $proceeds * $this->fees;
            $netProceeds = $proceeds - $fee;
            
            $gain = $netProceeds - $cost;
            $capitalGain += $gain;

            $matchedBuys[] = [
                'buy_date' => $balance['date']->format('Y-m-d'),
                'buy_price' => $balance['price'],
                'amount_sold' => $sellable,
                'cost' => $cost,
                'proceeds' => $proceeds,
                'net_proceeds' => $netProceeds,
                'fee' => $fee,
                'gain' => $gain,
                'holding_days' => $balance['date']->diffInDays($transaction['date'])
            ];

            $balance['amount'] -= $sellable;
            $remainingAmount -= $sellable;
        }

        // Clean empty balances
        $this->balances[$balanceKey]['balances'] = array_values(array_filter(
            $this->balances[$balanceKey]['balances'], 
            function ($balance) { return $balance['amount'] > 0; }
        ));

        $taxYear = $this->getTaxYear($transaction['date']);
        if (!isset($this->yearlyCapitalGains[$taxYear])) {
            $this->yearlyCapitalGains[$taxYear] = 0;
        }
        $this->yearlyCapitalGains[$taxYear] += $capitalGain;

        $this->results[] = [
            'transaction_id' => $transaction['id'],
            'type' => 'SELL',
            'capital_gain' => $capitalGain,
            'matched_buys' => $matchedBuys,
            'total_fee' => array_sum(array_column($matchedBuys, 'fee')),
            'remaining_amount' => $remainingAmount,
            'tax_year' => $taxYear,
            'balance_key' => $balanceKey
        ];
    }

    private function processTrade(array $transaction): void
    {
        $fromCoin = $transaction['from_coin'] ?? null;
        $toCoin = $transaction['to_coin'] ?? null;
        
        if (!$fromCoin || !$toCoin) {
            $this->results[] = [
                'transaction_id' => $transaction['id'],
                'type' => 'TRADE',
                'error' => "Trade requires from_coin and to_coin fields",
                'capital_gain' => 0
            ];
            return;
        }

        $fromBalanceKey = $this->getBalanceKey($fromCoin, $transaction['wallet']);
        
        if (!isset($this->balances[$fromBalanceKey])) {
            $this->results[] = [
                'transaction_id' => $transaction['id'],
                'type' => 'TRADE',
                'error' => "Insufficient {$fromCoin} balance for trade",
                'capital_gain' => 0
            ];
            return;
        }

        $capitalGain = 0;
        $remainingAmount = $transaction['amount'];
        $matchedBuys = [];
        
        foreach ($this->balances[$fromBalanceKey]['balances'] as $index => &$balance) {
            if ($remainingAmount <= 0) break;

            $sellable = min($remainingAmount, $balance['amount']);
            $cost = $sellable * $balance['price'];
            $proceeds = $sellable * $transaction['price'];
            
            $fee = $proceeds * $this->fees;
            $netProceeds = $proceeds - $fee;
            
            $gain = $netProceeds - $cost;
            $capitalGain += $gain;

            $matchedBuys[] = [
                'buy_date' => $balance['date']->format('Y-m-d'),
                'buy_price' => $balance['price'],
                'amount_sold' => $sellable,
                'cost' => $cost,
                'proceeds' => $proceeds,
                'net_proceeds' => $netProceeds,
                'fee' => $fee,
                'gain' => $gain,
                'holding_days' => $balance['date']->diffInDays($transaction['date'])
            ];

            $balance['amount'] -= $sellable;
            $remainingAmount -= $sellable;
        }

        $this->balances[$fromBalanceKey]['balances'] = array_values(array_filter(
            $this->balances[$fromBalanceKey]['balances'], 
            function ($balance) { return $balance['amount'] > 0; }
        ));

        // Add to new coin balance
        $toBalanceKey = $this->getBalanceKey($toCoin, $transaction['wallet']);
        if (!isset($this->balances[$toBalanceKey])) {
            $this->balances[$toBalanceKey] = [
                'coin' => $toCoin,
                'wallet' => $transaction['wallet'],
                'balances' => []
            ];
        }

        $totalProceeds = array_sum(array_column($matchedBuys, 'net_proceeds'));
        $effectiveAmount = $totalProceeds / $transaction['price'];
        
        $this->balances[$toBalanceKey]['balances'][] = [
            'amount' => $effectiveAmount,
            'price' => $transaction['price'],
            'date' => $transaction['date']
        ];

        $taxYear = $this->getTaxYear($transaction['date']);
        if (!isset($this->yearlyCapitalGains[$taxYear])) {
            $this->yearlyCapitalGains[$taxYear] = 0;
        }
        $this->yearlyCapitalGains[$taxYear] += $capitalGain;

        $this->results[] = [
            'transaction_id' => $transaction['id'],
            'type' => 'TRADE',
            'from_coin' => $fromCoin,
            'to_coin' => $toCoin,
            'capital_gain' => $capitalGain,
            'matched_buys' => $matchedBuys,
            'new_balance_amount' => $effectiveAmount,
            'new_balance_price' => $transaction['price'],
            'total_fee' => array_sum(array_column($matchedBuys, 'fee')),
            'tax_year' => $taxYear
        ];
    }

    private function processTransfer(array $transaction): void
    {
        $fromWallet = $transaction['from_wallet'] ?? 'default';
        $toWallet = $transaction['to_wallet'] ?? 'default';
        $amount = $transaction['amount'];
        $coin = $transaction['coin'];

        $fromBalanceKey = $this->getBalanceKey($coin, $fromWallet);
        
        if (!isset($this->balances[$fromBalanceKey])) {
            $this->results[] = [
                'transaction_id' => $transaction['id'],
                'type' => 'TRANSFER',
                'error' => "Insufficient balance in {$fromWallet} wallet",
                'transferred' => []
            ];
            return;
        }

        $transferred = [];
        $remaining = $amount;
        
        foreach ($this->balances[$fromBalanceKey]['balances'] as $index => &$balance) {
            if ($remaining <= 0) break;
            
            $transferAmount = min($remaining, $balance['amount']);
            $transferred[] = [
                'amount' => $transferAmount,
                'price' => $balance['price'],
                'date' => $balance['date']->format('Y-m-d')
            ];
            
            $balance['amount'] -= $transferAmount;
            $remaining -= $transferAmount;
        }

        $this->balances[$fromBalanceKey]['balances'] = array_values(array_filter(
            $this->balances[$fromBalanceKey]['balances'], 
            function ($balance) { return $balance['amount'] > 0; }
        ));

        // Add to destination wallet
        $toBalanceKey = $this->getBalanceKey($coin, $toWallet);
        if (!isset($this->balances[$toBalanceKey])) {
            $this->balances[$toBalanceKey] = [
                'coin' => $coin,
                'wallet' => $toWallet,
                'balances' => []
            ];
        }

        foreach ($transferred as $transfer) {
            $this->balances[$toBalanceKey]['balances'][] = [
                'amount' => $transfer['amount'],
                'price' => $transfer['price'],
                'date' => Carbon::parse($transfer['date'])
            ];
        }

        $this->results[] = [
            'transaction_id' => $transaction['id'],
            'type' => 'TRANSFER',
            'from_wallet' => $fromWallet,
            'to_wallet' => $toWallet,
            'transferred' => $transferred,
            'details' => "Transferred {$amount} {$coin} from {$fromWallet} to {$toWallet}"
        ];
    }

    private function takeBaseCostSnapshot(Carbon $date): void
    {
        // Take snapshot on 1st March each year (tax year boundary)
        if ($date->month == 3 && $date->day == 1) {
            $year = $date->year;
            $snapshot = [];
            
            foreach ($this->balances as $balance) {
                $totalAmount = array_sum(array_column($balance['balances'], 'amount'));
                $totalValue = 0;
                
                foreach ($balance['balances'] as $cb) {
                    $totalValue += $cb['amount'] * $cb['price'];
                }
                
                if ($totalAmount > 0) {
                    $snapshot[] = [
                        'coin' => $balance['coin'],
                        'wallet' => $balance['wallet'],
                        'total_amount' => round($totalAmount, 8),
                        'base_cost' => round($totalValue, 2),
                        'balances' => array_map(function ($b) {
                            return [
                                'amount' => round($b['amount'], 8),
                                'price' => round($b['price'], 2),
                                'date' => $b['date']->format('Y-m-d')
                            ];
                        }, $balance['balances'])
                    ];
                }
            }
            
            if (!empty($snapshot)) {
                $this->baseCostSnapshots[$year] = $snapshot;
            }
        }
    }

    private function getTaxYear(Carbon $date): int
    {
        // South African tax year: 1 March to 28/29 February
        if ($date->month < 3) {
            return $date->year;
        }
        return $date->year + 1;
    }

    private function calculateYearlyCapitalGains(): void
    {
        ksort($this->yearlyCapitalGains);
    }

    private function calculateTotalCapitalGain(): float
    {
        return array_sum($this->yearlyCapitalGains);
    }

    private function calculateTotalFees(): float
    {
        $totalFees = 0;
        
        foreach ($this->results as $result) {
            if (isset($result['total_fee'])) {
                $totalFees += $result['total_fee'];
            }
        }
        
        return round($totalFees, 2);
    }

    private function getBalanceKey(string $coin, string $wallet): string
    {
        return "{$coin}_{$wallet}";
    }

    private function getCurrentBalances(): array
    {
        $balances = [];
        
        foreach ($this->balances as $balance) {
            $totalAmount = array_sum(array_column($balance['balances'], 'amount'));
            $totalValue = 0;
            
            foreach ($balance['balances'] as $cb) {
                $totalValue += $cb['amount'] * $cb['price'];
            }
            
            $balances[] = [
                'coin' => $balance['coin'],
                'wallet' => $balance['wallet'],
                'total_amount' => round($totalAmount, 8),
                'base_cost' => round($totalValue, 2),
                'current_value' => round($totalAmount * end($balance['balances'])['price'], 2),
                'balances' => array_map(function ($b) {
                    return [
                        'amount' => round($b['amount'], 8),
                        'price' => round($b['price'], 2),
                        'date' => $b['date']->format('Y-m-d'),
                        'value' => round($b['amount'] * $b['price'], 2)
                    ];
                }, $balance['balances'])
            ];
        }
        
        return $balances;
    }
}