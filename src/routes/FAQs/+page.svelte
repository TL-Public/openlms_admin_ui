<script>
	import { goto } from '$app/navigation';
	import { message } from '/src/routes/FAQs/faqStore.js';
	import ListingTable from '$lib/components/ListingTable.svelte';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import SuccessMessage from '$lib/components/SuccessMessage.svelte';
	import DeletionModalViaAPI from '$lib/components/DeletionModalViaAPI.svelte';
	import RadioButton from '$lib/components/RadioButton.svelte';
	import InputField from '$lib/components/InputField.svelte';
	import Button from '$lib/components/Button.svelte';
	import { combineErrorMessages } from '$lib/utils/helper.js';
	import SubmissionErrorMessage from '$lib/components/SubmissionErrorMessage.svelte';

	export let data;

	let { FAQData, faqCategoryListData } = data;

	let tableData = [];
	let viewModal = false;
	let searchValue = '';
	let selectedLanguage = 'en';
	let tableActionName = '';
	let faqUuid = '';
	let question = '';
	let answer = '';
	let deleteTextInput = '';
	let deletionConfirmText = 'please delete this faq';
	let deleteTextConfirmation = false;

	$: secondaryErrors = combineErrorMessages(faqCategoryListData.error);

	// Function to normalize text (removes spaces and ignores case)
	const normalizeText = (text) => text?.trim().toLowerCase().replace(/\s+/g, ' ');

	// Function to check if input matches the required text
	$: isTextValid(deleteTextInput);
	function isTextValid() {
		deleteTextConfirmation = normalizeText(deleteTextInput) === normalizeText(deletionConfirmText);
	}

	$: createTableData(FAQData, selectedLanguage);
	function createTableData() {
		let FAQsCopy = [];

		tableData = [];

		if (FAQData?.error || !FAQData || FAQData.length === 0) {
			return;
		}

		FAQsCopy = FAQData;

		tableData = FAQsCopy.map((FAQ) => {
			const translation = FAQ?.translations?.find(
				(t) => t?.languageCode?.toLowerCase()?.trim() === selectedLanguage?.toLowerCase()?.trim()
			);

			if (!translation) {
				return null;
			}

			let categoryName = '';

			if (FAQ?.categoryId && !faqCategoryListData.error) {
				const category = faqCategoryListData?.find(
					(cat) =>
						cat?.extId === FAQ?.categoryId &&
						cat?.languageCode?.toLowerCase().trim() === selectedLanguage?.toLowerCase().trim()
				);
				categoryName = category?.category || '';
			}

			return {
				uuid: FAQ?.uuid,
				answer: translation?.answer,
				question: translation?.question,
				categoryId: FAQ?.categoryId,
				categoryName: categoryName
			};
		}).filter(Boolean); // Remove null values

		return tableData;
	}

	function sendSearchValueToDatatable(e) {
		searchValue = e.detail;
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
		let filteredFaqs = tableData?.filter((faq) => {
			return faq?.uuid !== e.detail;
		});
		message.set(`Successully deleted the FAQ - "${question}"".`);
		tableData = filteredFaqs;
	}

	function handleLanguageSelectionFromRadioButton(e) {
		selectedLanguage = e.detail;
	}

	// --------------------- Listing Table ----------------------
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
			key: 'categoryName',
			name: 'Category'
		},
		{
			key: 'question',
			name: 'Question',
			width: '30%'
		},
		{
			key: 'answer',
			name: 'Answer',
			width: '45%'
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
			dispatch: false
		},
		{
			actionName: 'delete',
			actionIconName: 'delete',
			modal: true
		}
	];

	function handleTableAction(e) {
		const clickedItem = e.detail;
		const actionName = clickedItem?.actionName;

		message.set('');
		viewModal = clickedItem?.viewModal;
		tableActionName = clickedItem?.actionName;
		question = clickedItem?.actionData?.question;
		answer = clickedItem?.actionData?.answer;
		faqUuid = clickedItem?.actionData?.uuid;

		if (actionName === 'view') {
			goto(`FAQs/${faqUuid}/details`);
		}

		if (actionName === 'edit') {
			goto(`FAQs/${faqUuid}/details/edit`);
		}
	}

	function handleGoToFaq() {
		goto('/FAQs/add');
	}
	function handleGoToBulkUpload() {
		goto(`/FAQs/bulkUpload`);
	}
</script>

<div class="mb-2">
	{#if $message}
		<SuccessMessage
			successMessage={$message}
			on:handleSuccessMessageClose={handleSuccesMessageClose}
		/>
	{/if}
	{#if secondaryErrors}
		<SubmissionErrorMessage errorMessage={secondaryErrors} />
	{/if}
</div>

<div class="flex justify-between items-start mb-8 gap-4 flex-nowrap">
	<div>
		<h1 class="mb-2 font-semibold text-primary text-base">Frequently Asked Questions</h1>
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
			placeholder={'Search by category, question or answer'}
			showSearchButton={false}
		/>
		<div class="flex gap-2 ml-auto">
			<Button btnType="secondary" on:click={handleGoToBulkUpload}>Bulk Upload</Button>
			<Button on:click={handleGoToFaq}>+ New FAQ</Button>
		</div>
	</div>
	<ListingTable
		{searchValue}
		{tableData}
		on:tableActionClick={handleTableAction}
		error={FAQData?.error}
		{tableHeaderDisplay}
		{actionConfigObject}
		rowHeight={'compact'}
		bind:sortAccordingTo
	/>
</div>

<div>
	{#if viewModal && tableActionName === 'delete'}
		<DeletionModalViaAPI
			id={faqUuid}
			name={question}
			heading={`About to delete the FAQ - ${question}`}
			para={'Are you sure you want to delete this question? This action cannot be undone.'}
			endPoint={'/apis/faqs/'}
			{deleteTextConfirmation}
			on:handleCancelDeletion={handleCancel}
			on:handleDeletion={handleFAQDeletion}
		>
			<hr />
			<div
				class="flex flex-col gap-2 p-6 bg-offwhite rounded-lg mb-4 border border-gray-50 text-darkGray"
			>
				<div>
					<!-- <p class="label">Question : {question}</p> -->
					<p class="text-sm capitalize mb-1">
						<span class="label">Question :</span>
						{question}
					</p>

					<!-- <p class="text-sm text-darkGray">Answer : {answer}</p> -->
					<p class="text-sm"><span class="font-medium">Answer :</span>{answer}</p>
				</div>
			</div>
			<hr class="mb-2" />
			<div class="">
				<InputField
					label={"Type 'Please delete this FAQ' to confirm"}
					placeholder={" Type 'Please delete this FAQ'"}
					name={'deletion'}
					labelFontWeight={'font-normal'}
					bind:value={deleteTextInput}
					required
				/>
			</div>
		</DeletionModalViaAPI>
	{/if}
</div>
