export async function load({ fetch, url, params }) {
	const fetchTestimonialDetails = async () => {
		let id = params.officialTestimonialId;
		try {
			const res = await fetch(`/apis/officialTestimonials/${id}`);
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
		testimonialDetails: await fetchTestimonialDetails()
	};
}
