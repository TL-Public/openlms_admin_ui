export async function load({ fetch }) {
	const fetchVideoList = async () => {
		try {
			const res = await fetch(`/apis/videos`);
			if (!res.ok) {
				throw new Error('Data not found');
			}
            if(res.status!==200){
				throw new Error('Data not found')
			}
			let data = await res.json();
			if (data?.length===0 || Object.keys(data)?.length===0) {
				throw new Error('Data not found');
			}
            let dataToSend = data?.filter((item)=>item?.status?.toLowerCase().trim()!=='deleted')
            data=dataToSend
			return data;
		} catch (err) {
			return { error: err.message };
		}
	};

	return {
		videoList: await fetchVideoList()
	};
}
