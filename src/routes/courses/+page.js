export async function load({ fetch }) {
	const fetchCourseListDetails = async () => {

		let res;
		try {
			res = await fetch(`/apis/courses`);
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
		coursesData: await fetchCourseListDetails()
	};
}
