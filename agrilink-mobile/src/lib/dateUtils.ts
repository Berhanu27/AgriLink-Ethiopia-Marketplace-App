/**
 * Safely format a date value to a localized date string
 * Handles Date objects, ISO strings, timestamps, and invalid values
 */
export function formatDate(date: Date | string | number | null | undefined): string {
  if (!date) return 'N/A';
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return 'N/A';
    }
    
    return dateObj.toLocaleDateString();
  } catch (error) {
    return 'N/A';
  }
}

/**
 * Safely format a date value to a localized date and time string
 */
export function formatDateTime(date: Date | string | number | null | undefined): string {
  if (!date) return 'N/A';
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return 'N/A';
    }
    
    return dateObj.toLocaleString();
  } catch (error) {
    return 'N/A';
  }
}

/**
 * Safely create a Date object from various input types
 */
export function safeDate(date: Date | string | number | null | undefined): Date {
  if (!date) return new Date();
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return new Date();
    }
    
    return dateObj;
  } catch (error) {
    return new Date();
  }
}
