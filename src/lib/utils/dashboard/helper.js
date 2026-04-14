/**
 * Dashboard Helper Utilities
 * Contains utility functions for dashboard components including date formatting and debouncing
 */

// ===================================
// DATE FORMATTING UTILITIES
// ===================================

/**
 * Formats chart labels based on period type
 * @param {string} periodStart - ISO date string for period start
 * @param {string} periodEnd - ISO date string for period end  
 * @param {string} period - Period type: 'week', 'month', 'quarter', 'year', 'ytd'
 * @returns {string} Formatted label
 */
export function formatChartLabel(periodStart, periodEnd, period) {
	const startDate = new Date(periodStart);
	const endDate = new Date(periodEnd);
	
	switch (period) {
		case 'week':
			// Week period shows daily data - Format as "Dec 7"
			return startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
			
		case 'month': {
			// Month period shows weekly data - Format as "Nov 1-7"
			const isSameMonth = startDate.getMonth() === endDate.getMonth();
			if (isSameMonth) {
				return `${startDate.toLocaleDateString('en-US', { month: 'short' })} ${startDate.getDate()}-${endDate.getDate()}`;
			} else {
				// Handle week spanning across months
				return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}-${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
			}
		}
			
		case 'quarter':
			// Quarter period shows monthly data - Format as "Nov 2025"
			return startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
			
		case 'year':
		case 'ytd':
			// Year/YTD period shows monthly data - Format as "Jan" or "Jan 2025" for year boundaries
			return startDate.toLocaleDateString('en-US', { month: 'short' });
			
		default:
			return startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
	}
}

/**
 * Formats date range display text based on period and data
 * @param {Array} trends - Array of trend data objects
 * @param {string} period - Period type: 'week', 'month', 'quarter', 'year', 'ytd'
 * @returns {string} Formatted date range string
 */
export function formatDateRange(trends, period) {
	if (!trends || trends.length === 0) {
		return 'No data available';
	}

	const firstTrend = trends[0];
	const lastTrend = trends[trends.length - 1];
	const startDate = new Date(firstTrend.periodStart);
	const endDate = new Date(lastTrend.periodEnd);
	
	// Single period case
	if (trends.length === 1) {
		switch (period) {
			case 'week':
				return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}`;
			case 'month':
				return startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
			case 'quarter': {
				const quarter = Math.floor(startDate.getMonth() / 3) + 1;
				return `Q${quarter} ${startDate.getFullYear()}`;
			}
			case 'year':
				return startDate.getFullYear().toString();
			case 'ytd':
				return `YTD (${startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })})`;
			default:
				return 'Invalid period';
		}
	}
	
	// Multiple periods case
	switch (period) {
		case 'week':
			return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}`;
		case 'month': {
			const startFormatted = startDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
			const endFormatted = endDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
			return startFormatted === endFormatted ? startFormatted : `${startFormatted} - ${endFormatted}`;
		}
		case 'quarter':
			return `${startDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}`;
		case 'year': {
			const startYear = startDate.getFullYear();
			const endYear = endDate.getFullYear();
			return startYear === endYear ? startYear.toString() : `${startYear} - ${endYear}`;
		}
		case 'ytd':
			return `YTD (${startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })})`;
		default:
			return 'Invalid period range';
	}
}

/**
 * Maps UI range selection to API period parameter
 * @param {string} range - UI range selection: '1W', '1M', '3M', '1Y'
 * @returns {string} API period parameter: 'week', 'month', 'quarter', 'year'
 */
export function mapRangeToPeriod(range) {
	switch (range) {
		case '1W':
			return 'week';
		case '1M':
			return 'month';
		case '3M':
			return 'quarter';
		case '1Y':
			return 'year';
		case 'YTD':
			return 'ytd';
		default:
			return 'week';
	}
}

// ===================================
// DEBOUNCE UTILITIES
// ===================================

/**
 * Creates a debounced function that delays execution until after delay milliseconds 
 * have elapsed since the last time it was invoked.
 * 
 * @param {Function} func - The function to debounce
 * @param {number} delay - The delay in milliseconds
 * @returns {Function} The debounced function
 */
export function debounce(func, delay) {
	let timeoutId;
	
	return function debounced(...args) {
		// Clear the previous timeout if it exists
		if (timeoutId) {
			clearTimeout(timeoutId);
		}
		
		// Set a new timeout
		timeoutId = setTimeout(() => {
			func.apply(this, args);
		}, delay);
	};
}

// ===================================
// NUMBER AND DATA FORMATTING UTILITIES
// ===================================

/**
 * Formats numbers using Intl.NumberFormat with lakh conversion for large numbers
 * @param {number} num - The number to format
 * @returns {Object} Object with formatted number and text suffix
 */
export function formatNumberWithIntl(num) {
	if (!num && num !== 0) return { number: '0', text: '' };
	
	if (num >= 100000) {
		// Convert to lakh format for large numbers
		let lakhValue = num / 100000;
		lakhValue = Math.floor(lakhValue * 100) / 100;
		const formatter = new Intl.NumberFormat('en-US', {
			minimumFractionDigits: 0,
			maximumFractionDigits: 2
		});
		return {
			number: formatter.format(lakhValue),
			text: 'lakh'
		};
	} else {
		// Use regular formatting for all other numbers
		const formatter = new Intl.NumberFormat('en-US');
		return {
			number: formatter.format(num),
			text: ''
		};
	}
}

/**
 * Formats time values (hours) using Intl.NumberFormat
 * @param {number} hours - The hours value to format
 * @returns {Object} Object with formatted number and 'hrs' text suffix
 */
export function formatTimeWithIntl(hours) {
	if (!hours && hours !== 0) return { number: '0', text: 'hrs' };
	
	// Use Intl.NumberFormat for hour formatting with commas
	const formatter = new Intl.NumberFormat('en-US');
	return {
		number: formatter.format(hours),
		text: 'hrs'
	};
}

/**
 * Formats trend data with directional arrows and percentage change
 * @param {Object} trendData - Object containing trend information
 * @param {string} trendData.trend - 'positive', 'negative', or 'neutral'
 * @param {number} trendData.percentageChange - The percentage change value
 * @param {string} trendData.period - The time period (e.g., 'week', 'month')
 * @returns {string} Formatted trend string with arrow and percentage
 */
export function formatTrend(trendData) {
	if (!trendData || !trendData.period) return '-';

	// Handle neutral trend
	if (trendData.trend === 'neutral' || trendData.percentageChange === 0) {
		return `→ No change from last ${trendData.period}`;
	}

	if (!trendData.percentageChange) return '-';

	const isPositive = trendData.trend === 'positive';
	const arrow = isPositive ? '↑' : '↓';
	
	// Format the percentage change value
	const absValue = Math.abs(trendData.percentageChange);
	const formattedValue = `${absValue}%`;

	return `${arrow} ${formattedValue} from last ${trendData.period}`;
}

export function getYesterdayDate() {
	const yesterday = new Date();
	yesterday.setDate(yesterday.getDate() - 1);
	return yesterday.toISOString().split('T')[0];
}

/**
 * Converts date from YYYY-MM-DD to DD-MM-YYYY format
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @returns {string} Date string in DD-MM-YYYY format
 */
export function formatDateToDDMMYYYY(dateStr) {
	if (!dateStr) return '';

	// If already in DD-MM-YYYY
	if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
		return dateStr;
	}

	// If ISO YYYY-MM-DD
	if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
		const [year, month, day] = dateStr.split('-');
		return `${day}-${month}-${year}`;
	}

	return '';
}

/**
 * Converts date from DD-MM-YYYY to YYYY-MM-DD format
 * @param {string} dateStr - Date string in DD-MM-YYYY format
 * @returns {string} Date string in YYYY-MM-DD format
 */
export function formatDateToYYYYMMDD(dateStr) {
	if (!dateStr) return '';

	// Already YYYY-MM-DD
	if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
		return dateStr;
	}

	// DD-MM-YYYY
	if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
		const [day, month, year] = dateStr.split('-');
		return `${year}-${month}-${day}`;
	}
	
	return '';
}
