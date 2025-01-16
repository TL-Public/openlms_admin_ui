<!-- 
 In manual syllabus creation, module data is the data of a single unit of syllabus.ManualSyllabusCreationmodule info is the info of a single module data -->

<script>
	import InputField from '$lib/components/InputField.svelte';
	import SingleAccordion from '$lib/components/SingleAccordion.svelte';
	import EditableDataTable from '$lib/courses/addCourse/EditableDataTable.svelte';

	let addModule = true;
	let disableAddModuleButton = true;
	let syllabusDataMaster = [];
	let dataTable;
	let itemToDelete = '';
	let itemToEditIndex = '';
	let moduleInfoEditIndex = '';
	let moduleInfoEditDataTableIndex = '';
	let draggedIndex = null;
	let moduleData = {
		moduleName: '',
		moduleInfo: [],
		id: ''
	};
	let dataTableHeaders = [
		{
			name: 'topic',
			id: 1
		},
		{
			name: 'contents',
			id: 2
		},
		{
			name: 'duration',
			id: 3
		},
		{
			name: 'actions',
			id: 4
		}
	];

	// Add new module data
	function handleAddModule() {
		moduleData.id = crypto.randomUUID();
		syllabusDataMaster.push(moduleData);
		syllabusDataMaster = syllabusDataMaster;
		moduleData = { moduleName: '', moduleInfo: [] };
		dataTable.resettingData();
	}

	// Edit module data
	function handleEdit(e) {
		itemToEditIndex = e.detail.index;
		syllabusDataMaster[itemToEditIndex].moduleName = e.detail?.name;
		syllabusDataMaster[itemToEditIndex].moduleInfo = moduleData?.moduleInfo;
		syllabusDataMaster = syllabusDataMaster;
	}

	//handle delete module
	function handleDelete(e) {
		itemToDelete = e.detail;
		let fileteredSyllabus = syllabusDataMaster?.filter((item, index) => index !== itemToDelete);
		syllabusDataMaster = fileteredSyllabus;
	}

	//Module info data from editable data table
	function handleModuleDataSave(e) {
		moduleData.moduleInfo = e.detail;
		let updatedArray = syllabusDataMaster?.map((item, index) => {
			if (index === moduleInfoEditIndex) {
				return { ...item, moduleInfo: e.detail };
			}
			return item;
		});
		syllabusDataMaster = updatedArray;
	}

	//Module info data from editable data table
	function handleModuleDataEditIndex(e, index) {
		moduleInfoEditIndex = index;
		moduleInfoEditDataTableIndex = e.detail;
	}
	function handleModuleDataInfoDelete(e, index) {
		itemToDelete = index;
		syllabusDataMaster[index].moduleInfo = e.detail;
	}

	//Drag and drop functions
	function dragStart(event, index) {
		event.target.style.cursor = 'grab';
		draggedIndex = index;
	}

	function dragOver(event) {
		event.preventDefault();
		event.target.style.cursor = 'grab';

		const scrollSpeed = 20; // Speed of scrolling
		const offset = 50; // Distance from the edge to start scrolling

		// Get the mouse Y position relative to the viewport
		const mouseY = event.clientY;
		const viewportHeight = window.innerHeight;

		// Check if we're near the top of the screen
		if (mouseY < offset) {
			window.scrollBy(0, -scrollSpeed); // Scroll up
		}
		// Check if we're near the bottom of the screen
		else if (mouseY > viewportHeight - offset) {
			window.scrollBy(0, scrollSpeed); // Scroll down
		}
	}

	function drop(event, index) {
		const draggedItem = syllabusDataMaster[draggedIndex];
		const targetItem = syllabusDataMaster[index];
		const targetIndex = index;

		let rearrangedArray = [...syllabusDataMaster]; // Create a copy of the original array

		// Remove the dragged item from its original position
		rearrangedArray.splice(draggedIndex, 1); // Remove the dragged item

		// Insert the dragged item at the new target index
		rearrangedArray.splice(targetIndex, 0, draggedItem);

		// Update the syllabusDataMaster with the new order
		syllabusDataMaster = rearrangedArray;
		// syllabusDataMaster = [...syllabusDataMaster];

		draggedIndex = null;
	}

	$: disablingAddModuleButton(moduleData);
	function disablingAddModuleButton() {
		if (moduleData?.moduleName === '') {
			disableAddModuleButton = true;
		} else {
			disableAddModuleButton = false;
		}
	}
</script>

{#if syllabusDataMaster?.length > 0}
	{#each syllabusDataMaster as syllabusItem, index (syllabusItem.id)}
		<div
			class="w-full mb-2 lg:mb-4 cursor-auto"
			draggable={true}
			on:dragstart={(event) => dragStart(event, index)}
			on:dragover={dragOver}
			on:drop={(event) => drop(event, index)}
			role="listitem"
			aria-grabbed={draggedIndex === index}
			aria-dropeffect="move"
			aria-label="Draggable accordion item"
			aria-live="polite"
		>
			<SingleAccordion
				name={syllabusItem?.moduleName}
				{index}
				draggable={true}
                editIcon={true}
                deleteIcon={true}
				on:handleEdit={handleEdit}
				on:handleDelete={handleDelete}
			>
				<p class="mt-2 text-sm leading-7 text-darkgray font-normal px-2 pb-4" id="innerAccordion">
					<EditableDataTable
						on:handleModuleDataSave={handleModuleDataSave}
						on:handleModuleDataEditIndex={(e) => handleModuleDataEditIndex(e, index)}
						on:handleModuleDataDelete={(e) => handleModuleDataInfoDelete(e, index)}
						syllabusItem={syllabusItem?.moduleInfo}
						{dataTableHeaders}
					/>
				</p>
			</SingleAccordion>
		</div>
	{/each}
	<hr class="my-2" />
{/if}

{#if addModule}
	<div class="grid grid-cols-1 mb-2 lg:mb-4">
		<div class="w-1/2 mb-2 mt-2">
			<InputField
				label={'Module Title'}
				placeholder={'Enter Module Title'}
				name={'title'}
				bind:value={moduleData.moduleName}
			/>
		</div>

		<div>
			<EditableDataTable
				on:handleModuleDataSave={handleModuleDataSave}
				addModule={true}
				resettingFields={true}
				bind:this={dataTable}
				{dataTableHeaders}
			/>
		</div>
	</div>
{/if}

<button
	type="button"
	class="mt-4 block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
	on:click={handleAddModule}
	disabled={disableAddModuleButton}>+ Add Module</button
>
