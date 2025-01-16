export async function load({ fetch }) {
	
	const fetchFaqCategoryList = async () => {
		let res
		try {
			 res = await fetch(`/apis/faqs/faqCategories`);
            
			if (!res.ok || res.status !== 200) {
				throw new Error('Data not found');
			}

			const data = await res.json();
			if (data?.length === 0 || Object.keys(data)?.length === 0) {
				throw new Error('Data not found');
			}

			return data;
		} catch (err) {
			return { status:res.status, error: err.message };
		}
	};
	
	return {
		faqCategoryListData: await fetchFaqCategoryList(),
	};
}