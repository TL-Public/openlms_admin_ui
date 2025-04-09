import { redirect, fail } from '@sveltejs/kit';

export const actions = {
	default: async ({ request, fetch, cookies }) => {
		const formData = await request.formData();
		const email = formData.get('username') || '';
		const password = formData.get('password') || '';
		const redirectUrl = formData.get('redirectTo');

		let user;
		let endPointForAdminUsers=`/apis/users/userProfile`
		let endPointForTrainees=`/apis/users/traineeProfile`
		let endPoint;

		if (!email || !password) {
			return { validationError: 'Please enter all fields' };
		}

		let loginResp;
		let profileResp;

		try {
			loginResp = await fetch(`/apis/auth/login`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username: email.trim(), password: password.trim() })
			});

			if (loginResp?.status === 500) {
				const errorMsg = 'Unexpected error occured. Please try again later.';
				// return { validationError: errorMsg, success: false, loginDetails: loginResp.loginDetails };
				return fail(loginResp.status, {
					error: errorMsg,
					success: false
				});
			}

			if (loginResp?.status !== 200) {
				const errorMsg = 'Login failed. Please check the credentials';
				// return { validationError: errorMsg, success: false, loginDetails: loginResp.loginDetails };
				return fail(loginResp.status, {
					error: errorMsg,
					success: false
				});
			}

			if (loginResp?.status === 200) {
				 user = await loginResp.json();
				cookies.set('authToken', user?.accessToken, {
					path: '/',
					httpOnly: true,
					sameSite: 'strict',
					secure: process.env.NODE_ENV === 'production',
					maxAge: 60 * 60 * 24
				});


				if(Number(user?.role) !== 9){
					endPoint=endPointForAdminUsers
				} else{
					endPoint=endPointForTrainees
				}

				profileResp = await fetch(endPoint, {

					method: 'GET',
					headers: { Authorization: `Bearer ${user?.accessToken}` }
				});
	
				if (profileResp?.status !== 200) {
					// Call logout API if profile fetch fails
					await fetch(`/apis/auth/logout`);


				return fail(profileResp?.status, {
					error: 'Failed to fetch user profile. Please try again.',
					success: false
				}); }

				// Step 4: Set user profile details in cookies
			const userProfile = await profileResp?.json();
			
			cookies.set('authToken', user?.accessToken, {
				path: '/',
				httpOnly: true,
				sameSite: 'strict',
				secure: process.env.NODE_ENV === 'production',
				maxAge: 60 * 60 * 24
			});

			cookies.set('role', user?.role, {
				path: '/',
				httpOnly: true,
				sameSite: 'strict',
				secure: process.env.NODE_ENV === 'production',
				maxAge: 60 * 60 * 24
			});
			cookies.set('uuid', userProfile?.uuid, {
				path: '/',
				httpOnly: true,
				sameSite: 'strict',
				secure: process.env.NODE_ENV === 'production',
				maxAge: 60 * 60 * 24
			});
			cookies.set('name', userProfile?.name, {
				path: '/',
				httpOnly: false,
				sameSite: 'strict',
				secure: process.env.NODE_ENV === 'production',
				maxAge: 60 * 60 * 24
			});
			cookies.set('stateId', userProfile?.stateId, {
				path: '/',
				httpOnly: false,
				sameSite: 'strict',
				secure: process.env.NODE_ENV === 'production',
				maxAge: 60 * 60 * 24
			});
			cookies.set('rsetiId', userProfile?.rsetiId, {
				path: '/',
				httpOnly: false,
				sameSite: 'strict',
				secure: process.env.NODE_ENV === 'production',
				maxAge: 60 * 60 * 24
			});
			cookies.set('designation', userProfile?.designation, {
				path: '/',
				httpOnly: false,
				sameSite: 'strict',
				secure: process.env.NODE_ENV === 'production',
				maxAge: 60 * 60 * 24
			});
			}
		
		} catch (err) {
			await fetch(`/apis/auth/logout`);
			return fail(loginResp?.status, {
				error: err?.message,
				success: false
			});
		}

		// throw redirect has to be outside try block.
		// Otherwise, it will get caught in catch block and redirect wont happen
		if (profileResp?.status === 200) {
			if (redirectUrl) {
				throw redirect(302, redirectUrl);
			}

			throw redirect(302, '/courses');
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
