export const formatPhoneWithCountryCode = (phone: string): string => {
  // If no phone provided, return empty string
  if (!phone) return '';
  
  // Remove any non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // If it's empty after cleaning, return empty string
  if (!cleaned) return '';
  
  // If it already has country code (11 digits starting with 1)
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return '+' + cleaned;
  }
  
  // If it's a 10 digit US number
  if (cleaned.length === 10) {
    return '+1' + cleaned;
  }
  
  // If it's less than 10 digits, return empty string
  if (cleaned.length < 10) {
    return '';
  }
  
  // For any other case, take the last 10 digits and add +1
  return '+1' + cleaned.slice(-10);
};