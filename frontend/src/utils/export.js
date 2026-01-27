export const downloadCSVTemplate = () => {
  const headers = ['date', 'coin', 'type', 'amount', 'price', 'wallet', 'from_coin', 'to_coin', 'from_wallet', 'to_wallet', 'fee', 'fee_coin', 'description'];
  const example = [
    {
      date: '2023-03-15',
      coin: 'BTC',
      type: 'buy',
      amount: 0.5,
      price: 400000,
      wallet: 'Luno',
      from_coin: '',
      to_coin: '',
      from_wallet: '',
      to_wallet: '',
      fee: 0.001,
      fee_coin: 'BTC',
      description: 'Initial Bitcoin purchase'
    },
    {
      date: '2024-01-20',
      coin: 'BTC',
      type: 'sell',
      amount: 0.4,
      price: 720000,
      wallet: 'Luno',
      from_coin: '',
      to_coin: '',
      from_wallet: '',
      to_wallet: '',
      fee: 0.0006,
      fee_coin: 'BTC',
      description: 'Partial Bitcoin sale'
    }
  ];
  
  const csv = [
    headers.join(','),
    ...example.map(row => headers.map(h => row[h] || '').join(','))
  ].join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'taxtim-crypto-template.csv';
  a.click();
};

export const exportToCSV = (results) => {
  if (!results || !results.results) return;
  
  const headers = ['Transaction ID', 'Type', 'Date', 'Coin', 'Amount', 'Price (R)', 'Cost Basis (R)', 'Proceeds (R)', 'Capital Gain/Loss (R)', 'Tax Year', 'Tax Rate (%)', 'Tax Amount (R)'];
  const rows = results.results.flatMap(result => {
    if (result.matched_buys && result.matched_buys.length > 0) {
      return result.matched_buys.map(buy => [
        result.transaction_id || '',
        result.type || '',
        result.date || '',
        result.coin || result.from_coin || '',
        buy.amount_sold || 0,
        buy.buy_price || 0,
        buy.cost || 0,
        buy.proceeds || 0,
        buy.gain || 0,
        result.tax_year || '',
        buy.tax_rate || '',
        buy.tax_amount || 0
      ]);
    }
    return [[
      result.transaction_id || '',
      result.type || '',
      result.date || '',
      result.coin || result.from_coin || '',
      result.amount || 0,
      result.price || 0,
      '',
      '',
      result.capital_gain || 0,
      result.tax_year || '',
      '',
      ''
    ]];
  });
  
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `taxtim-crypto-report-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
};
