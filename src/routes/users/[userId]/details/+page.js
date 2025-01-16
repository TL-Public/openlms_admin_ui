export async function load({ fetch, url, params }) {
	const fetchUserDetails = async () => {
		let id = params?.userId;
		let res;
		try {
			res = await fetch(`/apis/users/${id}`);

			if (!res.ok) {
				throw new Error('Data not found');
			}
			if (res.status !== 200) {
				throw new Error('Data not found');
			}
			const data = await res.json();

			if (data?.length === 0 || Object.keys(data)?.length === 0) {
				throw new Error('Data not found');
			}
			return data;
		} catch (err) {
			return { status: res.status, error: err.message };
		}
	};

	return {
		userDetails: await fetchUserDetails()
	};
}
