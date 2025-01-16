export async function load({ fetch, url ,params}) {
	const fetchFaqDetails = async () => {
		let id = params.faqId;
		try {
			const res = await fetch(`/apis/faqs/${id}`);
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
		faqDetails: await fetchFaqDetails()
	};
}
