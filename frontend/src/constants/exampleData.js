export const EXAMPLE_TRANSACTIONS = [
  {
    coin: 'BTC',
    type: 'buy',
    amount: 0.5,
    price: 400000,
    date: '2023-03-15',
    wallet: 'Luno',
    fee: 0.001,
    fee_coin: 'BTC',
    description: 'Initial Bitcoin purchase'
  },
  {
    coin: 'ETH',
    type: 'buy',
    amount: 3.2,
    price: 25000,
    date: '2023-04-10',
    wallet: 'Binance',
    fee: 0.0005,
    fee_coin: 'BNB',
    description: 'Ethereum investment'
  },
  {
    coin: 'BTC',
    type: 'sell',
    amount: 0.4,
    price: 720000,
    date: '2024-01-20',
    wallet: 'Luno',
    fee: 0.0006,
    fee_coin: 'BTC',
    description: 'Partial Bitcoin sale'
  },
  {
    coin: 'ETH',
    type: 'trade',
    amount: 1.0,
    price: 28000,
    date: '2023-10-05',
    wallet: 'Binance',
    from_coin: 'ETH',
    to_coin: 'MATIC',
    fee: 0.001,
    fee_coin: 'BNB',
    description: 'Traded ETH for MATIC'
  },
  {
    coin: 'BTC',
    type: 'transfer',
    amount: 0.2,
    price: 0,
    date: '2023-09-10',
    wallet: 'Luno',
    from_wallet: 'Luno',
    to_wallet: 'Hardware Wallet',
    fee: 0.0003,
    fee_coin: 'BTC',
    description: 'Moved to cold storage'
  }
];
