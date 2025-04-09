import { json } from "@sveltejs/kit";
import { BASE_URL } from '$lib/config';


// API to get list of all states 
export async function GET() {
	// const authToken = cookies.get('authToken');

	try {
		// const options = {
		// 	method: 'GET',
		// 	headers: {
		// 		'Content-Type': 'application/json',
		// 		Authorization: `Bearer ${authToken}`
		// 	}
		// };
		const res = await fetch(
			`${BASE_URL}/apis/v1/states`
		);
		if(!res.ok){
            throw new Error('Failed to fetch data')
        }

        if (res.status != 200) {
			throw new Error('Failed to fetch data');
		}
		const data = await res.json();
		if (data?.length ===0 || Object.keys(data)?.length===0) {
			throw new Error('Data not found');
		}
		// sort data before returning response
		// data.sort(function (a, b) {
		// 	if (a.title < b.title ) {
		// 	  return -1;
		// 	}
		// 	if (a.title  > b.title ) {
		// 	  return 1;
		// 	}
		// 	return 0;
		//   })
		
		return json(data)
	} catch (error) {
		
		return json({ error: error.message })
	}
}