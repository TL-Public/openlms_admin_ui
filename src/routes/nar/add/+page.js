import { browser } from '$app/environment';
import { userDetails } from '/src/routes/store.js'
 
export async function load({ parent }) {
	if (browser) {
		const {user} = await parent();
		userDetails?.set(user);
	}
}