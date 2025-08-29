<script>
	import InputField from '$lib/components/InputField.svelte';
	import TextDescriptionField from '$lib/components/TextDescriptionField.svelte';
	import { createEventDispatcher } from 'svelte';

	export let syllabusItem = null;
	export let resettingFields;
	export let dataTableHeaders = [
		{
			name: '',
			id: ''
		}
	];

	export function resettingData() {
		if (resettingFields === true) {
			moduleInfoDataMaster = [];
			moduleInfoData = { topic: '', content: '', duration: '' };
			syllabusItem = null;
		}
	}

	let dispatch = createEventDispatcher();
	let edit = true;
	let addNewRow = true;
	let editingIndex = null;
	let disableSaveButton = true;
	let moduleInfoDataMaster = [];
	let moduleInfoData = {
		topic: '',
		content: '',
		duration: ''
	};

	function handleModuleSave(index = null) {
		edit = false;
		if (index !== null) {
			// Save edited row
			moduleInfoDataMaster[index] = { ...moduleInfoData };
		} else {
			// Save new row
			moduleInfoDataMaster.push({ ...moduleInfoData });
		}
		moduleInfoData = { topic: '', content: '', duration: '' }; // Reset moduleInfoData
		moduleInfoDataMaster = moduleInfoDataMaster;
		editingIndex = null;
		edit = true;
		addNewRow = true;
		dispatch('handleModuleDataSave', moduleInfoDataMaster);
	}

	function handleModuleEdit(index) {
		edit = true;
		addNewRow = false;
		editingIndex = index;
		moduleInfoData = { ...moduleInfoDataMaster[index] };
		dispatch('handleModuleDataEditIndex', index);
	}

	function handleModuleDelete(index) {
		let filteredModuleDataMaster = moduleInfoDataMaster?.filter(
			(module, indexNumber) => indexNumber != index
		);
		moduleInfoDataMaster = filteredModuleDataMaster;
		dispatch('handleModuleDataDelete', moduleInfoDataMaster);
	}

	$: disablingSaveButton(moduleInfoData);
	function disablingSaveButton() {
		if (
			moduleInfoData?.duration === '' ||
			moduleInfoData?.topic === '' ||
			moduleInfoData?.content === ''
		) {
			disableSaveButton = true;
		} else {
			disableSaveButton = false;
		}
	}

	if (syllabusItem) {
		if (syllabusItem?.length > 0)
			syllabusItem?.map((item) => {
				moduleInfoData = {
					topic: '',
					content: '',
					duration: ''
				};
				moduleInfoData.topic = item?.topic;
				moduleInfoData.content = item?.content;
				moduleInfoData.duration = item?.duration;
				moduleInfoDataMaster?.push(moduleInfoData);
				moduleInfoDataMaster = moduleInfoDataMaster;
				moduleInfoData = {
					topic: '',
					content: '',
					duration: ''
				};
			});
	}
</script>

<div class="">
	<div class="mt-4 border borde-gray-100 rounded-lg">
		<table class="min-w-full divide-y divide-gray-300 rounded-lg">
			<thead class="  ">
				<tr class="bg-gray-100 rounded-lg">
					{#each dataTableHeaders as header, index}
						<th
							scope="col"
							class="py-2.5 pl-4 pr-3 text-left text-sm font-semibold text-darkGray sm:pl-6 capitalize"
							>{header?.name}</th
						>
					{/each}
				</tr>
			</thead>
			<tbody class="divide-y divide-gray-200">
				{#if moduleInfoDataMaster?.length > 0}
					{#each moduleInfoDataMaster as moduleItem, index}
						{#if index === editingIndex}
							<tr>
								<td class="relative py-4 pl-4 pr-3 text-sm sm:pl-6">
									<div class="font-medium text-gray-900">
										<TextDescriptionFeild
											placeholder={'Enter Topic'}
											name={'topic'}
											rows={1}
											bind:value={moduleInfoData.topic}
										/>
									</div>
								</td>
								<td class="relative py-4 pl-4 pr-3 text-sm sm:pl-6">
									<div class="font-medium text-gray-900">
										<TextDescriptionField
											placeholder={'Enter Content'}
											name={'content'}
											rows={1}
											bind:value={moduleInfoData.content}
										/>
									</div></td
								>
								<td class="relative py-4 pl-4 pr-3 text-sm sm:pl-6">
									<div class="font-medium text-gray-900 mt-2">
										<InputField
											placeholder={'Enter duration(mins)'}
											name={'duration'}
											rows={1}
											bind:value={moduleInfoData.duration}
										/>
									</div></td
								>
								<td class="px-3 py-3.5 text-sm text-gray-500">
									<button on:click={() => handleModuleSave(index)} disabled={disableSaveButton}>
										Save
									</button></td
								>

								<!-- More plans... -->
							</tr>
						{:else}
							<tr>
								<td class="relative py-4 pl-4 pr-3 text-sm sm:pl-6">
									<div class="font-medium text-gray-900">
										{moduleItem?.topic}
									</div>
								</td>
								<td class="hidden px-3 py-3.5 text-sm text-gray-500 lg:table-cell">
									<div class="mt-1 flex flex-col text-gray-500">
										{moduleItem?.content}
									</div></td
								>
								<td class="hidden px-3 py-3.5 text-sm text-gray-500 lg:table-cell">
									<div class="mt-1 flex flex-col text-gray-500">
										{moduleItem?.duration}
									</div></td
								>
								<td class="px-3 py-3.5 text-sm text-gray-500">
									<div class="flex gap-2">
										<button on:click={() => handleModuleEdit(index)} class="block">
											<img src="/edit.svg" alt="icon for edit" />
										</button>
										<button on:click={() => handleModuleDelete(index)} class="block">
											<img src="/trash.svg" alt="icon for delete" />
										</button>
									</div>
								</td>
							</tr>{/if}
					{/each}
				{/if}
				{#if addNewRow}
					<tr class="align-text-top">
						<td class="relative py-4 pl-4 pr-3 text-sm sm:pl-6">
							<div class="font-medium text-gray-900">
								<TextDescriptionField
									placeholder={'Enter Topic'}
									name={'topic'}
									rows={1}
									bind:value={moduleInfoData.topic}
								/>
							</div>
						</td>
						<td class="relative py-4 pl-4 pr-3 text-sm sm:pl-6">
							<div class="font-medium text-gray-900">
								<TextDescriptionField
									placeholder={'Enter Content'}
									name={'content'}
									rows={1}
									bind:value={moduleInfoData.content}
								/>
							</div></td
						>
						<td class="relative py-4 pl-4 pr-3 text-sm sm:pl-6">
							<div class="font-medium text-gray-900 mt-2">
								<InputField
									placeholder={'Enter duration(mins)'}
									name={'duration'}
									bind:value={moduleInfoData.duration}
								/>
							</div></td
						>
						<td class="px-3 py-3.5 text-sm text-gray-500">
							<button on:click={() => handleModuleSave()} disabled={disableSaveButton}>
								Save
							</button></td
						>

						<!-- More plans... -->
					</tr>
				{/if}
			</tbody>
		</table>
	</div>
</div>
