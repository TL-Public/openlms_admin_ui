import { json } from '@sveltejs/kit';
import { CLIENT_ID, CLIENT_SECRET } from '$env/static/private';

export async function POST({ cookies }) {
	if (!CLIENT_ID || !CLIENT_SECRET) {
		return json({ error: 'Missing credentials' }, { status: 500 });
	}

	try {
		// const serviceToken = cookies.get('serviceToken');
		const clientKey = cookies.get('clientKey');
		const clientId = cookies.get('clientId');
		// if(serviceToken){
		// 	return json({ serviceToken }, { status: 200 });
		// }
		// Call the external API to generate a service token
		const response = await fetch(
			'http://qmsapi.ap-south-1.elasticbeanstalk.com/apis/v1/service-auth/token',
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ clientId: CLIENT_ID, clientSecret: CLIENT_SECRET })
			}
		);

		if (!response.ok) {
			return json({ error: 'Failed to generate token' }, { status: 500 });
		}

		const data = await response.text();
		const token = data;

		// Set the service token in cookies (expires in 1 month)
		cookies.set('serviceToken', token, {
			path: '/', // Accessible across the whole site
			httpOnly: true, // Prevents access from JavaScript (security measure)
			secure: true, // Ensures the cookie is only sent over HTTPS
			sameSite: 'lax', // Protects against CSRF attacks
			maxAge: 30 * 24 * 60 * 60 // 1 month expiry
		});
		
		if(!clientId){
			cookies.set('clientId', CLIENT_ID, {
				path: '/', // Accessible across the whole site
				httpOnly: true, // Prevents access from JavaScript (security measure)
				secure: true, // Ensures the cookie is only sent over HTTPS
				sameSite: 'lax', // Protects against CSRF attacks
				maxAge: 30 * 24 * 60 * 60 // 1 month expiry
			});
		}

		if(!clientKey){
			cookies.set('clientKey', CLIENT_SECRET, {
				path: '/', // Accessible across the whole site
				httpOnly: true, // Prevents access from JavaScript (security measure)
				secure: true, // Ensures the cookie is only sent over HTTPS
				sameSite: 'lax', // Protects against CSRF attacks
				maxAge: 30 * 24 * 60 * 60 // 1 month expiry
			});
		}

		// return json({ message: 'Service token and client details stored in cookies' }, { status: 200 });
		return json({ serviceToken: token }, { status: 200 });
	} catch (error) {
		return json({ error: 'Internal Server Error' }, { status: 500 });
	}
}
