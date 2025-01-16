import { redirect } from '@sveltejs/kit';
export const load = async ({ request, locals, cookies, url }) => {
	// console.log('PATHANME in login', url.pathname);
	// console.log(cookies?.get('authToken'));
	// console.log('===================================');
	if (cookies?.get('authToken')) {
		throw redirect(302, '/courses');
	}

	return {
		user: locals.user
	};
};
