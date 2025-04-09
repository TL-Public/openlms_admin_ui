import { json } from '@sveltejs/kit';

export async function POST({ request, cookies }) {
	let res;
	const authToken = cookies.get('authToken');
	try {
		res = await new Promise((resolve, reject) => {
			if (authToken) {
				setTimeout(() => {
					cookies.set('authToken', '', {
						path: '/',
						maxAge: 0
					});
					resolve(new Response({ status: 204 }));
				}, 1 * 1000);
			} else {
				reject();
			}
		});
		return json({}, { status: res.status });
	} catch (err) {
		return json({}, { status: res.status, error: err.message });
	}
}
