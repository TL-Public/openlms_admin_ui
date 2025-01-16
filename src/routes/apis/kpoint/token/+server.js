export async function POST(event) {
	try {
		const body = await event.request.json();
		const options = {
			method: 'POST',
			body: JSON.stringify(body),
			headers: {
				'Content-Type': 'application/json'
			}
		};
		const res = await fetch(
			`http://reap-demo-env1.ap-south-1.elasticbeanstalk.com/reap/kpoint/token`,
			options
		);
		const data = await res.json();

		return new Response(JSON.stringify(data), {
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (error) {
		return new Response(JSON.stringify({ error: error.message }), {
			headers: { 'Content-Type': 'application/json' }
		});
	}
}