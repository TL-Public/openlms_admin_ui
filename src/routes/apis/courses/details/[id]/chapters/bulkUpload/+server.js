import { json } from '@sveltejs/kit';
import { BASE_URL } from '$lib/config';

export async function POST({ request, cookies }) {
	const authToken = cookies.get('authToken');
    let res
    let responseData

    try {
		const formData = await request.formData();

         res = await fetch(
            `${BASE_URL}/apis/v1/batch/videos`,
            {
                method: 'POST',
                headers: {
					Authorization: `Bearer ${authToken}`, 
                    
                },
               body: formData
            }
        );
console.log('res', res)
        if (!res.ok || !res?.status===202) {
            try{
                responseData = await res?.json();
                console.log('responseData', responseData)
                throw new Error(responseData ||'Failed to batch update chapters');
            } catch {
                throw new Error('Failed to batch update chapters');
            }
        }

        responseData = await res?.json();
        return json(responseData,{status:res?.status}); 

    } catch (error) {
        return json({ error: error?.message }, { status:res?.status}); 
    }
}

