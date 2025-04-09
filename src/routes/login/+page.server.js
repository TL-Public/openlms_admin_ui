import { redirect } from '@sveltejs/kit';
let loginDetails = {};
import { reapUrls } from '../../config/constants.js';
import { handleFormLogin } from '../../lib/utils/helper.js';
import { fail } from '@sveltejs/kit';

// async function handleFormLogin({ request, fetch, cookies }) {
// 	const formData = await request.formData();

// 	// extract login details from form
// 	const email = formData.get('username') || '';
// 	const password = formData.get('password') || '';
// 	// const rememberMe = formData.get('rememberMe') || '';

// 	// store in details in a variable
// 	loginDetails = { username: email, password };

// 	// --- Validation Check ---
// 	if ([email, password].some((elem) => elem.trim() === '')) {
// 		return { validationError: 'please enter all fields', loginDetails };
// 	}
// 	let response;
// 	try {
// 		response = await fetch(`${reapUrls.adminTestURL}/apis/v1/auth/signin`, {
// 			method: 'POST',
// 			headers: { 'Content-Type': 'application/json' },
// 			body: JSON.stringify(loginDetails)
// 		});
// 		if (response.status === 200) {
// 			const user = await response.json();
// 			cookies.set('authToken', user.accessToken, {
// 				path: '/',
// 				httpOnly: true,
// 				sameSite: 'strict',
// 				secure: process.env.NODE_ENV === 'production',
// 				maxAge: 60 * 60 * 24
// 			});
// 		}
// 	} catch (err) {
// 		console.log('err', err);
// 	}
// 	if (response.status == 200) {
// 		throw redirect(302, '/courses');
// 	} else {
// 		return { validationError: 'Login failed. Please check the credentials', success: false };
// 	}
// }

export const actions = {
	default: async ({ request, fetch, cookies, url }) => {
		const formData = await request.formData();
		const email = formData.get('username') || '';
		const password = formData.get('password') || '';

		if (!email || !password) {
			return { validationError: 'Please enter all fields' };
		}

		// const loginResp = await handleFormLogin(event);
		const loginResp = await fetch(`/apis/auth/login`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username: email, password })
		});

		if (loginResp.status === 200) {
			const user = await loginResp.json();
			cookies.set('authToken', user.accessToken, {
				path: '/',
				httpOnly: true,
				sameSite: 'strict',
				secure: process.env.NODE_ENV === 'production',
				maxAge: 60 * 60 * 24
			});
			// if (url.pathname.startsWith('/login')) {
			// 	redirect('302', '/states');
			// }
			return { success: true };
		}
		if (loginResp.status !== 200) {
			const errorMsg = 'Login failed. Please check the credentials';
			// return { validationError: errorMsg, success: false, loginDetails: loginResp.loginDetails };
			return fail(loginResp.status, {
				error: errorMsg,
				success: false
			});
		}
	}
};

// function handleLoginErrors(response) {
// 	switch (response.status) {
// 		case 401:
// 			return {
// 				errorMsg: 'Invalid credentials'
// 			};
// 		default:
// 			return {
// 				errorMsg: 'Login failed. Please check the credentials'
// 			};
// 	}
// }
