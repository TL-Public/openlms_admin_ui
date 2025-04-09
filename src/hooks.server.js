import { redirect } from '@sveltejs/kit';
export async function handle({ event, resolve }) {
	const authToken = event.cookies.get('authToken');

	if (authToken) {
		event.locals.user = {
			isAuthenticated: true
		};
		return await resolve(event);
	} else {
		event.locals.user = { isAuthenticated: false };

		//only check page requests. Ignore API route requests (apis in +server.js)
		if (!event.url.pathname.startsWith('/apis') && event.url.pathname !== '/login') {
			// Redirect to the login page if they are not authenticated
			throw redirect(302, '/login');
		}
		// If it gets here, it's either an API route or the login page
		return await resolve(event);
	}
}
