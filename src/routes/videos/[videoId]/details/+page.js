export async function load({ fetch, url, params }) {
	const fetchVideoDetails = async () => {
	const id =  params?.videoId;
	let res
		try {
			 res = await fetch(`/apis/videos/details/${id}`);
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
			return data;
		} catch (err) {
			return {status:res?.status, error: err.message };
		}
	};

	return {
		videoDetails: await fetchVideoDetails()
	};
}
