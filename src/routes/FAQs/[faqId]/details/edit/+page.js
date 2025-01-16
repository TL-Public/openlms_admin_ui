export async function load({ fetch, params, url }) {
	let id=params.faqId
	const fetchFAQs = async () => {
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
		FAQData: await fetchFAQs()
	};
}
