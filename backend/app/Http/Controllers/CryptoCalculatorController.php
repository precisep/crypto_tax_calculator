<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\CryptoCalculatorService;

class CryptoCalculatorController extends Controller
{
    public function calculate(Request $request)
    {
        $request->validate([
            'transactions' => 'required|array',
            'transactions.*.coin' => 'required|string',
            'transactions.*.type' => 'required|in:buy,sell,trade,transfer',
            'transactions.*.amount' => 'required|numeric|min:0',
            'transactions.*.price' => 'required|numeric|min:0',
            'transactions.*.date' => 'required|date',
        ]);

        try {
            $calculator = new CryptoCalculatorService($request->transactions);
            $results = $calculator->calculate();

            return response()->json([
                'success' => true,
                'message' => 'Tax calculations completed successfully',
                'data' => $results,
                'metadata' => [
                    'transactions_processed' => count($request->transactions),
                    'calculation_date' => now()->toDateTimeString(),
                    'tax_year' => $this->getCurrentTaxYear(),
                    'exchange_rate_source' => 'SARB',
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    private function getCurrentTaxYear(): int
    {
        $month = date('n');
        $year = date('Y');
        
        if ($month < 3) {
            return $year;
        }
        return $year + 1;
    }
}