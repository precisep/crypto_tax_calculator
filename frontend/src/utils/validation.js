export const validateTransactions = (data) => {
  if (!Array.isArray(data)) {
    throw new Error('Data must be an array');
  }
  
  return data.map((tx, index) => {
    const validated = { ...tx };
    
    if (!validated.type) validated.type = 'buy';
    if (!validated.coin) validated.coin = 'BTC';
    if (!validated.amount) validated.amount = 0;
    if (!validated.price) validated.price = 0;
    if (!validated.date) validated.date = new Date().toISOString().split('T')[0];
    if (!validated.wallet) validated.wallet = 'default';
    
    validated.type = String(validated.type).toLowerCase();
    validated.coin = String(validated.coin).toUpperCase();
    validated.amount = parseFloat(validated.amount) || 0;
    validated.price = parseFloat(validated.price) || 0;
    
    return validated;
  });
};
