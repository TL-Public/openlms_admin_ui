export async function load({ fetch }) {
	const fetchTraineesData = async () => {

		let res;
		let data;
		try {
			res = await fetch(`/apis/trainees`);
			if (!res.ok) {
				throw new Error('Data not found');

			}
			if (res?.status !== 200) {
				throw new Error('Data not found');
			}
			 data = await res.json();
			if (data?.length === 0 || Object.keys(data)?.length === 0) {
				throw new Error('Data not found');
			}
			return data;
		} catch (err) {
			return { status: data?.status || 500, error: err.message };
		}
	};

	return {
		traineesData: await fetchTraineesData()
	};
}
