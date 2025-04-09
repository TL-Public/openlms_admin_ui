<script>
	import { message } from '/src/routes/officialTestimonials/store.js';
	import ListingTable from '$lib/components/ListingTable.svelte';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import SuccessMessage from '$lib/components/SuccessMessage.svelte';
	import DeletionModalViaAPI from '$lib/components/DeletionModalViaAPI.svelte';
	import RadioButton from '$lib/components/RadioButton.svelte';
	import InputField from '$lib/components/InputField.svelte';
	import Button from '$lib/components/Button.svelte';
	import { goto } from '$app/navigation';

	export let data;

	let { testimonials } = data;

	let error;
	let tableData = [];
	let viewModal = false;
	let searchValue = '';
	let selectedLanguage = 'en';
	let tableActionName = '';
	let testimonialUuid = '';
	let personName = '';
	let designation = '';
	let testimonialText = '';

	let deleteTextInput = '';

	let deletionConfirmText = 'please delete this testimonial';
	let deleteTextConfirmation = false;

	// Function to normalize text (removes spaces and ignores case)
	const normalizeText = (text) => text?.trim().toLowerCase().replace(/\s+/g, ' ');

	function sendSearchValueToDatatable(e) {
		searchValue = e.detail;
	}
	// Function to check if input matches the required text
	$: isTextValid(deleteTextInput);
	function isTextValid() {
		deleteTextConfirmation = normalizeText(deleteTextInput) === normalizeText(deletionConfirmText);
	}

	$: createTableData(testimonials, selectedLanguage);
	function createTableData() {
		let testimonialsCopy = [];
		error = '';
		tableData = [];

		if (testimonials?.error || !testimonials || testimonials.length === 0) {
			error = testimonials?.error || 'No testimonials available';
			return;
		}

		testimonialsCopy = testimonials;
		testimonialsCopy?.forEach((testimonial) => {
			const translation = testimonial?.translations?.find(
				(t) => t?.languageCode?.toLowerCase().trim() === selectedLanguage?.toLowerCase().trim()
			);

			if (!translation) {
				return;
			}

			const testimonialData = {
				uuid: testimonial?.uuid,
				name: translation?.name,
				designation: translation?.designation,
				testimonialText: translation?.testimonialText,
				videoUrl: testimonial?.videoUrl,
				type: testimonial?.videoUrl ? 'Video' : 'Text',
				textOrUrlValue: testimonial?.videoUrl ? testimonial?.videoUrl : translation?.testimonialText
			};

			tableData.push(testimonialData);
			tableData = tableData;
		});

		return tableData;
	}

	function handleSuccesMessageClose(e) {
		message.set('');
	}

	function handleCancel() {
		deleteTextInput = '';
		viewModal = false;
	}

	function handleFAQDeletion(e) {
		deleteTextInput = '';
		message.set('');
		const filteredTestimonials = tableData?.filter((faq) => {
			return faq?.uuid !== e.detail;
		});
		message.set(`Successully deleted the testimonial of - "${personName}".`);
		tableData = filteredTestimonials;
	}

	function handleLanguageSelectionFromRadioButton(e) {
		selectedLanguage = e.detail;
	}

	function addPage() {
		goto('/officialTestimonials/add');
	}

	// --------------------------Listing Table---------------------
	// this object needs to be in accordance with the datatable sortAccordingTo object
	// Can be used to set to a predefined sortingOrder for a predefined header
	let sortAccordingTo = {
		header: null,
		entityType: null,
		sortingOrder: null
	};

	// define header names for the desired headers to be displayed
	let tableHeaderDisplay = [
		{
			key: 'name',
			name: 'name'
		},
		{
			key: 'designation',
			name: 'Designation'
		},
		{
			key: 'type',
			name: 'Testimonial Type'
		},
		{
			key: 'textOrUrlValue',
			name: 'Text/URL',
			width: '50%'
		}
	];

	// to configure the action tab (see comments of datatable.svelte)
	let actionConfigObject = [
		{
			actionName: 'view',
			actionIconName: 'visibility',
			modal: false
		},
		{
			actionName: 'edit',
			actionIconName: 'edit',
			modal: false
		},
		{
			actionName: 'delete',
			actionIconName: 'delete',
			modal: true
		}
	];

	function handleTableAction(event) {
		const actionName = event.detail.actionName;
		const actionData = event.detail.actionData;
		message.set('');
		viewModal = event.detail.viewModal;
		tableActionName = event.detail.actionName;
		personName = actionData.name;
		designation = actionData.designation;
		testimonialText = actionData.testimonialText;
		testimonialUuid = actionData.uuid;

		if (actionName === 'view') {
			goto(`officialTestimonials/${testimonialUuid}/details`);
		}

		if (actionName === 'edit') {
			goto(`officialTestimonials/${testimonialUuid}/details/edit`);
		}
	}
</script>

<div class="mb-2">
	{#if $message}
		<SuccessMessage
			successMessage={$message}
			on:handleSuccessMessageClose={handleSuccesMessageClose}
		/>
	{/if}
</div>

<div class="flex justify-between items-start mb-8 gap-4 flex-nowrap">
	<div>
		<h1 class="mb-2 font-semibold text-primary text-base">Official Testimonials</h1>
		<div class="">
			<RadioButton
				languageOptionOne={'english'}
				languageCodeOne={'en'}
				languageOptionTwo={'hindi'}
				languageCodeTwo={'hi'}
				on:handleLanguageFromRadioButton={handleLanguageSelectionFromRadioButton}
			/>
		</div>
	</div>
</div>

<div class="mt-5">
	<div class="mb-5 flex gap-2 md:flex-nowrap flex-wrap">
		<SearchBar
			on:handleSearchValue={sendSearchValueToDatatable}
			placeholder={'Search by name'}
			showSearchButton={false}
		/>
		<div class="flex gap-2 ml-auto">
			<Button on:click={addPage}>+ New Testimonial</Button>
		</div>
	</div>
	<ListingTable
		{searchValue}
		{tableData}
		on:tableActionClick={handleTableAction}
		{error}
		{tableHeaderDisplay}
		{actionConfigObject}
		rowHeight={'compact'}
		bind:sortAccordingTo
	/>
</div>

<div>
	{#if viewModal && tableActionName === 'delete'}
		<DeletionModalViaAPI
			id={testimonialUuid}
			name={personName}
			heading={`About to delete the testimonial by - ${personName}`}
			para={'Are you sure you want to delete this testimonial? This action cannot be undone.'}
			endPoint={'/apis/officialTestimonials/'}
			{deleteTextConfirmation}
			on:handleCancelDeletion={handleCancel}
			on:handleDeletion={handleFAQDeletion}
		>
			<hr />
			<div
				class="flex flex-col gap-2 p-6 bg-offwhite rounded-lg mb-4 border border-gray-50 text-darkGray"
			>
				<div>
					<p class="text-sm text-darkGray capitalize">
						<span class="label"> Name : </span>
						{personName}
					</p>
					<p class="text-sm">
						<span class="label"> Designation : </span>
						{designation}
					</p>
					<p class="text-sm">
						<span class="label"> Testimonial text : </span>
						{testimonialText}
					</p>
				</div>
			</div>
			<hr class="mb-2" />
			<div class="">
				<InputField
					label={"Type 'Please delete this testimonial' to confirm"}
					placeholder={" Type 'Please delete this testimonial'"}
					name={'deletion'}
					labelFontWeight={'font-normal'}
					bind:value={deleteTextInput}
					required
				/>
			</div>
		</DeletionModalViaAPI>
	{/if}
</div>
