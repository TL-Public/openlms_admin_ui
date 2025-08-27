<script>
	import { createEventDispatcher, onMount } from 'svelte';
	import Datatable from '$lib/components/DataTable.svelte';
	import ErrorMessage from '$lib/components/ErrorMessage.svelte';
	import { goto } from '$app/navigation';
	import Button from '$lib/components/Button.svelte';
	import Spinner from '$lib/components/Spinner.svelte';

	let testimonials = [];
	let tableData = [];
	let selectedLanguage = 'en';
	let error = null;
	let searchValue = '';
	let loading = true;

	const dispatch = createEventDispatcher();

    // ------------------- Fetch Testimonials -------------------

	async function fetchOfficialTestimonials() {
		error = '';
		try {
			const response = await fetch('/apis/officialTestimonials');

			if (!response?.ok) {
				throw new Error('Failed to fetch testimonials');
			}

			const data = await response?.json();

			if (data?.error) {
				throw new Error(data.error);
			}

			if (!data || data?.length === 0) {
				throw new Error('No official testimonials found.');
			}

			testimonials = data;
			await createTableData();
		} catch (err) {
			error = err.message || 'An unexpected error occurred.';
			testimonials = [];
		} finally {
			loading = false;
		}
	}


    // ----------------- Table Data Related Functions---------------------

	async function createTableData() {
		tableData = [];

		if (!testimonials || testimonials?.length === 0) {
			error = error || 'No official testimonials found.';
		}

		testimonials?.forEach((testimonial) => {
			const translation = testimonial?.translations?.find(
				(t) => t?.languageCode?.toLowerCase().trim() === selectedLanguage?.toLowerCase().trim()
			);

			if (!translation) return;

			tableData?.push({
				uuid: testimonial?.uuid,
				name: translation?.name,
				orderNo: testimonial?.orderNo,
				designation: translation?.designation,
				testimonialText: translation?.testimonialText,
				videoUrl: testimonial?.videoUrl,
				type: testimonial?.videoUrl ? 'Video' : 'Text',
				textOrUrlValue: testimonial?.videoUrl ? testimonial?.videoUrl : translation?.testimonialText
			});
		});
	}

	let sortAccordingTo = {
		header: null,
		entityType: null,
		sortingOrder: null
	};

	let tableHeaderDisplay = [
		{ key: 'name', name: 'Name' },
		{ key: 'designation', name: 'Designation' },
		{ key: 'type', name: 'Testimonial Type' },
		{ key: 'orderNo', name: 'Priority Number' }
	];

	let actionConfigObject = [{ actionName: 'view', actionIconName: 'visibility', modal: false }];

	function handleTableAction(event) {
		const actionName = event.detail.actionName;
		const actionData = event.detail.actionData;
		const testimonialUuid = actionData?.uuid;

		if (actionName === 'view') {
			goto(`/officialTestimonials/${testimonialUuid}/details`);
		}
	}

    function closePopup() {
		dispatch('close');
	}

    onMount(async () => {
		await fetchOfficialTestimonials();
	});

</script>

<div
	class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6"
	on:click|self={closePopup}
>
	<div
		class="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-auto flex flex-col space-y-3"
	>
		<h2 class="heading-L mb-2">Official Testimonials</h2>

		{#if loading}
			<!-- Show spinner while loading -->
			<div class="flex justify-center py-10">
				<Spinner size={32} />
			</div>
		{:else if tableData.length !== 0 && !error}
			<Datatable
				on:tableActionClick={handleTableAction}
				{tableData}
				{searchValue}
				tableHeadersDisplay={tableHeaderDisplay}
				{actionConfigObject}
				showPagination={false}
				rowHeight={'compact'}
				bind:sortAccordingTo
			/>
		{:else}
			<h2>
				<ErrorMessage {error} />
			</h2>
		{/if}

		<div class="mt-3">
			<Button on:click={closePopup} btnType="secondary" customClass="w-full">Cancel</Button>
		</div>
	</div>
</div>
