import { redirect } from '@sveltejs/kit';
import { roles } from '$lib/config.js'; // Import roles object
import { normalizeRoute } from '$lib/utils/helper.js'; // Import route normalizer

export async function handle({ event, resolve }) {

	const authToken = event.cookies.get('authToken');
	const role = event.cookies.get('role');
	const name = event.cookies.get('name');
	const designation = event.cookies.get('designation');
	const stateId = event.cookies.get('stateId');
	const rsetiId = event.cookies.get('rsetiId');
	const uuid = event.cookies.get('uuid');

	// Authentication check
	if (authToken) {
		event.locals.user = {
			isAuthenticated: true,
			role,
			name,
			designation,
			stateId,
			rsetiId,
			userUuid:uuid
		};
		// Normalize the current route for RBAC
		const normalizedRoute = normalizeRoute(event.url.pathname);
		
		// Check if the user role is restricted from accessing the route
		if (role && roles[role]?.restrictedRoutes?.includes(normalizedRoute)) {
			console.log(`Access denied for role "${role}" to route "${normalizedRoute}"`);
			throw redirect(302, '/unauthorized'); // Redirect to an unauthorized page
		}

		// Proceed with the request if authenticated and authorized
		return await resolve(event);
	} else {
		event.locals.user = {
			isAuthenticated: false,
			role: null,
			name: null,
			designation: null,
			stateId: null,
			rsetiId: null,
			userUuid:null
		};

		// Only check page requests; ignore API route requests
		if (!event.url.pathname.startsWith('/apis') && event.url.pathname !== '/login') {
			// Redirect to the login page if not authenticated
			const fromUrl = `${event.url.pathname}${event.url.search}`;
			console.log('Redirecting to login from:', fromUrl);
			throw redirect(302, `/login?redirectTo=${fromUrl}`);
		}

		// Allow API or login page requests
		return await resolve(event);
	}
  
}
