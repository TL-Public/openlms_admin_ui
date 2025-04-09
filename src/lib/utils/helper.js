import { reapUrls } from '../../config/constants';
import { roles } from '../config';
import { browser } from '$app/environment';
import { goto } from '$app/navigation';

export function formatDurationHHMM(seconds) {
    if (seconds < 60) {
        return `0mins ${seconds}s`; 
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
        if (mins === 0) return `${hours}hr`;
        return `${hours}hr ${mins}mins`;
    }
    
    if (mins > 1) {
        if (remainingSeconds === 0) return `${mins} mins`;
        return `${mins}mins ${remainingSeconds}s`;
    } else {
        return `${mins}min ${remainingSeconds}s`; 
    }
}

export function setLocalStoreData(key, value) {
	// typeof window !== 'undefined': This checks whether the window object is available, ensuring that the code is running in a browser environment.

	// window.localStorage: This verifies that the localStorage API is available on the window object.

	if (typeof window !== 'undefined' && window.localStorage) {
		window.localStorage.setItem(key, JSON.stringify(value));
	} else {
		console.warn('Local storage is not available in this environment to set data');
	}
}

export function getLocalStoreData(key) {
	if (typeof window !== 'undefined' && window.localStorage) {
		const storedData = window.localStorage.getItem(key);

		return storedData ? JSON.parse(storedData) : null;
	} else {
		console.warn('Local storage is not available in this environment to get data');
	}
}

export function getCategoryName(id) {
	switch (id) {
		case 1:
			return 'Agricultural EDPs';
		case 2:
			return 'Process EDPs';
		case 3:
			return 'Product EDPs';
		case 4:
			return 'General EDPs';
		default:
			return '';
	}
}
export function getFAQCategoryName(id) {
	const categoryMap = {
		1: 'Programme Overview',
		2: 'Eligibility',
		3: 'Accreditation and Approvals',
		4: 'Infrastructure and Facilities',
		5: 'Post-Training Support',
		6: 'Financial Assistance',
		7: 'Impact and Success Stories'
	};
	return categoryMap[id];
}

export function getStatusName(id) {
	switch (id) {
		case 1:
			return 'Active';
		case 2:
			return 'In Progress';
		case 3:
			return 'Deleted';
		default:
			return '';
	}
}

export async function handleFormLogin({ request, fetch, cookies }) {
	const formData = await request.formData();
	const email = formData.get('username') || '';
	const password = formData.get('password') || '';
	// const rememberMe = formData.get('rememberMe') === 'on';

	const loginDetails = { username: email };

	// --- Validation Check ---
	if (!email || !password) {
		return { validationError: 'Please enter all fields', loginDetails };
	}

	let response;
	try {
		response = await fetch(`${reapUrls.adminTestURL}/apis/v1/auth/signin`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username: email, password })
		});

		// Handle successful response
		if (response.status === 200) {
			const user = await response.json();
			return { response, user, status: response.status };
		} else {
			return { status: response.status, loginDetails };
		}
	} catch (err) {
		console.error('Error during login:', err);
		return { status: response.status, loginDetails };
	}
}

export function handleRedirection(status, url, params) {
	if (browser) {
		const fromUrl = url + params;
		switch (status) {
			case 401:
				goto(`/login?redirectTo=${fromUrl}`);
				break;
			case 403:
				goto(`/unauthorized?redirectTo=${fromUrl}`);
				break;
			default:
				break;
		}
	}
}

// Normalize dynamic routes for consistency
// export function normalizeRoute(route) {
// 	return route?.replace(/\/\d+/g, '/:id'); // Replace numeric IDs with ':id'
// }

// Normalize dynamic routes for consistency
export function normalizeRoute(route) {
	return route
		?.replace(/\/[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}(\?|$|\/)/gi, '/:id$1')
		.replace(/\/\d+(\?|$|\/)/g, '/:id$1');
}

// Check for permissions for actions
export function checkActionPermission(role, moduleName, actionName) {
	// Default value to be used if the action is not explicitly defined in the roles object.
	const defaultValue = false;
	const actionValue = roles[Number(role)]?.restrictedActions?.[moduleName]?.[actionName];

	// Use the nullish coalescing operator (??) to fall back to the defaultValue
	// if `actionValue` is `null` or `undefined`. Then compare the result with `false`.
	// Returns `true` if the action is explicitly allowed (or not restricted), `false` otherwise.
	return (actionValue ?? defaultValue) === false;
}

export function getErrorMessage({ status, action = 'requested action', module = 'module' } = {}) {
	switch (status) {
		case 400:
			return { errorMsg: 'Invalid request. Please contact support.', redirectUser: false };
		case 401:
			return { errorMsg: 'Session expired. Please login again.', redirectUser: true };
		case 403:
			return {
				errorMsg: `You do not have permission to access:  ${module}-${action}.`,
				redirectUser: true
			};
		case 404:
			return { errorMsg: `The requested ${module} not found.`, redirectUser: false };
		case 409:
			return { errorMsg: `The ${module} already exists.`, redirectUser: false };
		case 500:
			return {
				errorMsg: `An error occurred on: ${module}-${action}. Please try again later.`,
				redirectUser: false
			};
		default:
			return {
				errorMsg: 'An unknown error occurred. Please contact support.',
				redirectUser: false
			};
	}
}

export function combineErrorMessages(...errors) {
	const filteredErrors = errors.filter((error) => typeof error === 'string');

	if (filteredErrors.length === 0) return null; // No valid errors

	if (filteredErrors.length === 1) return filteredErrors[0]; // Return single error directly

	return `The following errors occurred:\n${filteredErrors
		.map((error, index) => `${index + 1}. ${error}`)
		.join('\n')}`;
}
