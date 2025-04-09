import { reapUrls } from '../../config/constants';
export function formatDurationHHMM(seconds) {
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
		return `0 mins`;
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
