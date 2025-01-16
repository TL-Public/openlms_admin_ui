export async function load({ fetch, params, url }) {
	const fetchStateDetails = async () => {
		try {
            let id = params?.stateId
            const res = await fetch(`/apis/states/${id}`);
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
			return { error: err.message };
		}
	};
	return {
		stateDetails: await fetchStateDetails()
	};
}