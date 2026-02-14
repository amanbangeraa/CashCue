/**
 * Format number as Indian Rupee currency
 */
export function formatCurrency(amount: number, showDecimals = true): string {
  const formatted = showDecimals 
    ? amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  
  return `₹${formatted}`;
}

/**
 * Format number as percentage
 */
export function formatPercentage(value: number, decimals = 2): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format large numbers with Indian numbering system (Lakhs, Crores)
 */
export function formatLargeNumber(num: number): string {
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)}Cr`;
  } else if (num >= 100000) {
    return `₹${(num / 100000).toFixed(2)}L`;
  } else if (num >= 1000) {
    return `₹${(num / 1000).toFixed(1)}K`;
  }
  return formatCurrency(num, false);
}

/**
 * Get color class based on gain/loss
 */
export function getGainLossColor(amount: number): string {
  if (amount > 0) return 'text-green-600';
  if (amount < 0) return 'text-red-600';
  return 'text-gray-600';
}

/**
 * Get background color class based on gain/loss
 */
export function getGainLossBgColor(amount: number): string {
  if (amount > 0) return 'bg-green-50';
  if (amount < 0) return 'bg-red-50';
  return 'bg-gray-50';
}

/**
 * Format with sign prefix
 */
export function formatWithSign(amount: number): string {
  const formatted = formatCurrency(Math.abs(amount));
  if (amount > 0) return `+${formatted}`;
  if (amount < 0) return `-${formatted}`;
  return formatted;
}
