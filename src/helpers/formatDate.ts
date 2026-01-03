/**
 * Format a date string or Date object to a short format like "Jan 2024"
 *
 * @param date - ISO date string or Date object
 * @returns Formatted date string (e.g., "Jan 2024")
 */
export function formatAlbumDate(date: string | Date | undefined): string {
  if (!date) return '';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    // Check for invalid date
    if (isNaN(dateObj.getTime())) {
      return '';
    }

    // Format as "MMM YYYY" (e.g., "Jan 2024")
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const month = monthNames[dateObj.getMonth()];
    const year = dateObj.getFullYear();

    return `${month} ${year}`;
  } catch (error) {
    console.error('[formatAlbumDate] Error formatting date:', error);
    return '';
  }
}

/**
 * Get the sort date for an album (uses date field if available, otherwise createdAt)
 *
 * @param album - Album object with optional date and createdAt fields
 * @returns Date object for sorting
 */
export function getAlbumSortDate(album: { date?: string; createdAt?: string }): Date {
  const dateStr = album.date || album.createdAt;
  if (!dateStr) {
    return new Date(0); // Return epoch if no date available
  }

  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? new Date(0) : date;
}

/**
 * Sort albums by date in descending order (newest first)
 * Albums with dates come before albums without dates
 *
 * @param albums - Array of albums to sort
 * @returns Sorted array of albums
 */
export function sortAlbumsByDate<T extends { date?: string; createdAt?: string }>(
  albums: T[]
): T[] {
  return [...albums].sort((a, b) => {
    const dateA = getAlbumSortDate(a);
    const dateB = getAlbumSortDate(b);

    // Descending order (newest first)
    return dateB.getTime() - dateA.getTime();
  });
}
