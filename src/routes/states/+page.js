export async function load({ fetch }) {
	const fetchStatesList = async () => {
		try {
			const res = await fetch(`/apis/states`);
			if (!res.ok) {
				throw new Error('Data not found');
			}
            if(res.status!==200){
				throw new Error('Data not found')
			}
			const data = await res.json();
			if (data?.length===0 || Object.keys(data)?.length===0) {
				throw new Error('Data not found');
			}
			return data;
		} catch (err) {
			return { error: err.message };
		}
	};

	return {
		statesListData: await fetchStatesList()
	};
}
