import { json } from '@sveltejs/kit';


export async function POST({ request, cookies }) {
	const authToken = cookies.get('authToken');
    let res
    let responseData

    try {
		const formData = await request.formData();

         res = await fetch(
            // `http://read-admin-api-dev.ap-south-1.elasticbeanstalk.com/apis/v1/courses/batch-update`,
            {
                method: 'POST',
                headers: {
					Authorization: `Bearer ${authToken}`, 
                    
                },
               body: formData
            }
        );
        if (!res.ok || !res?.status===200) {
            responseData = await res?.text();
            throw new Error(responseData ||'Failed to batch update users');
        }

        responseData = await res?.text();
        return json(responseData); 

    } catch (error) {
        return json({ error: error?.message }, { status:res?.status}); 
    }
}

