import * as XLSX from 'xlsx';

export const parseCSV = (csvText) => {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length < 2) throw new Error('CSV file must have header row and at least one data row');
  
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  
  return lines.slice(1).map((line, index) => {
    const values = parseCSVLine(line);
    const transaction = {};
    
    headers.forEach((header, idx) => {
      if (values[idx] !== undefined) {
        const value = values[idx].trim();
        
        if (['amount', 'price', 'fee'].includes(header)) {
          transaction[header] = parseFloat(value) || 0;
        } else if (header === 'date') {
          transaction[header] = formatDate(value);
        } else {
          transaction[header] = value;
        }
      }
    });
    
    normalizeTransactionFields(transaction);
    return transaction;
  });
};

export const parseCSVLine = (line) => {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
};

export const parseExcel = (data) => {
  const workbook = XLSX.read(data, { type: 'array' });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });
  
  return jsonData.map(row => {
    const transaction = {};
    
    Object.entries(row).forEach(([key, value]) => {
      const normalizedKey = key.trim().toLowerCase();
      
      if (normalizedKey.includes('date')) {
        transaction['date'] = formatDate(value);
      } else if (normalizedKey.includes('coin') || normalizedKey.includes('crypto') || normalizedKey.includes('asset')) {
        transaction['coin'] = String(value).toUpperCase().trim();
      } else if (normalizedKey.includes('type') || normalizedKey.includes('action')) {
        transaction['type'] = String(value).toLowerCase().trim();
      } else if (normalizedKey.includes('amount') || normalizedKey.includes('quantity')) {
        transaction['amount'] = parseFloat(value) || 0;
      } else if (normalizedKey.includes('price') || normalizedKey.includes('rate') || normalizedKey.includes('cost')) {
        transaction['price'] = parseFloat(value) || 0;
      } else if (normalizedKey.includes('wallet') || normalizedKey.includes('exchange') || normalizedKey.includes('platform')) {
        transaction['wallet'] = String(value).trim();
      } else if (normalizedKey.includes('from_coin') || normalizedKey.includes('source_coin')) {
        transaction['from_coin'] = String(value).toUpperCase().trim();
      } else if (normalizedKey.includes('to_coin') || normalizedKey.includes('target_coin')) {
        transaction['to_coin'] = String(value).toUpperCase().trim();
      } else if (normalizedKey.includes('from_wallet') || normalizedKey.includes('source_wallet')) {
        transaction['from_wallet'] = String(value).trim();
      } else if (normalizedKey.includes('to_wallet') || normalizedKey.includes('target_wallet')) {
        transaction['to_wallet'] = String(value).trim();
      } else if (normalizedKey.includes('fee')) {
        transaction['fee'] = parseFloat(value) || 0;
      } else if (normalizedKey.includes('fee_coin')) {
        transaction['fee_coin'] = String(value).toUpperCase().trim();
      } else if (normalizedKey.includes('description') || normalizedKey.includes('notes')) {
        transaction['description'] = String(value).trim();
      }
    });
    
    normalizeTransactionFields(transaction);
    return transaction;
  });
};

export const normalizeTransactionFields = (transaction) => {
  if (transaction['type']) {
    transaction['type'] = transaction['type'].toLowerCase();
  }
  if (transaction['crypto'] && !transaction['coin']) {
    transaction['coin'] = transaction['crypto'];
    delete transaction['crypto'];
  }
  if (transaction['exchange'] && !transaction['wallet']) {
    transaction['wallet'] = transaction['exchange'];
    delete transaction['exchange'];
  }
};

export const formatDate = (dateString) => {
  if (!dateString) return new Date().toISOString().split('T')[0];
  
  try {
    if (typeof dateString === 'number') {
      const excelEpoch = new Date(1899, 11, 30);
      const date = new Date(excelEpoch.getTime() + dateString * 24 * 60 * 60 * 1000);
      return date.toISOString().split('T')[0];
    }
    
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
    
    const parts = String(dateString).split(/[/-]/);
    if (parts.length === 3) {
      const [a, b, c] = parts.map(p => parseInt(p, 10));
      const date1 = new Date(c, b - 1, a);
      const date2 = new Date(c, a - 1, b);
      
      if (!isNaN(date1.getTime())) return date1.toISOString().split('T')[0];
      if (!isNaN(date2.getTime())) return date2.toISOString().split('T')[0];
    }
    
    return new Date().toISOString().split('T')[0];
  } catch (err) {
    return new Date().toISOString().split('T')[0];
  }
};
