import { json } from '@sveltejs/kit';


export async function POST({ request, params, cookies }) {
    const { id } = params;
	const authToken = cookies.get('authToken');
    let res

    try {
        const body = await request.json();
         res = await fetch(
            `http://read-admin-api-dev.ap-south-1.elasticbeanstalk.com/apis/v1/courses/${id}/chapters`,
            {
                method: 'POST',
                headers: {

                    'Content-Type': 'application/json',
					Authorization: `Bearer ${authToken}`, 
                    
                },
               body: JSON.stringify(body) 
            }
        );

        if (!res.ok) {
            throw new Error('Failed to add chapter');
        }

        const responseData = await res.json();
        return json(responseData); 

    } catch (error) {
        return json({ error: error.message, status:res.status }); 
    }
}


