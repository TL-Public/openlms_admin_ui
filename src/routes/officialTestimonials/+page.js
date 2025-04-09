export async function load({ fetch }) {
	const fetchTestimonials = async () => {
		try {
			const res = await fetch(`/apis/officialTestimonials`);
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
		testimonials: await fetchTestimonials()
	};
}
