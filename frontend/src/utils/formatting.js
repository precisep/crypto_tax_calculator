export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return 'R 0.00';
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export const formatNumber = (num, decimals = 8) => {
  if (num === undefined || num === null) return '0';
  const number = parseFloat(num);
  if (isNaN(number)) return '0';
  
  if (number === 0) return '0';
  if (Math.abs(number) < 0.000001) {
    return number.toExponential(decimals - 1);
  }
  return number.toFixed(decimals).replace(/\.?0+$/, '');
};
