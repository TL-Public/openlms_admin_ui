import { json } from '@sveltejs/kit';
import { BASE_URL } from '$lib/config';

export async function GET({request, fetch, cookies}) {
	const authToken = cookies.get('authToken');
	let res
	try {
		let queryparams = request.url.split('?');
		let endPoint = `${BASE_URL}/apis/v1/videos`;
		if (queryparams?.length > 1) {
			endPoint += '?' + queryparams[1];
		}
		 res = await fetch(endPoint, {
			method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${authToken}`
				}
		});
        if(!res.ok){
            throw new Error('Failed to fetch data')
        }

        if (res?.status != 200) {
			throw new Error('Failed to fetch data');
		}
		const data = await res.json();
		if (data?.content?.length ===0 || Object.keys(data)?.length===0) {
			throw new Error('Data not found');
		}
        return json(data)
	} catch (error) {
		return json({ error: error.message }, {status:res?.status})
	}
}
