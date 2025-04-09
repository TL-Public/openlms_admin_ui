<script>
    import { createEventDispatcher } from 'svelte';
    import Datatable from '$lib/components/DataTable.svelte';
    import ErrorMessage from '$lib/components/ErrorMessage.svelte';
	import { goto } from '$app/navigation';
	import Button from '$lib/components/Button.svelte';

    
    export let courses = [];
    export let chapters=[]
    const dispatch = createEventDispatcher();

    let error = null;
    let searchValue = '';
    let loading = false;

    let sortAccordingTo = {
      header: null,
      entityType: null,
      sortingOrder: null
    };
  
    let tableHeaderDisplay = [
      { key: 'name', name: 'Course Name' },
      { key: 'chapterName', name: 'Chapter Name' }
    ];
  
    let actionConfigObject = [
      {
        actionName: 'view',
        actionIconName: 'visibility',
        modal: false
      }
    ];
  
    function closePopup() {
      dispatch('close');
    }
  
    function handleTableAction(event) {
      const actionName = event.detail.actionName;
      const actionData = event.detail.actionData;
      const chapterUuid = actionData?.chapterUuid
      let courseUuid = actionData?.uuid
      let data = {
        uuid:courseUuid
      }

      if (actionName === 'view') {
        goto(`/courses/${courseUuid}/details#${chapterUuid}`);
      }
    }

    // Set to store processed course UUIDs to avoid duplicates
    let uniqueCourses = new Set();
    $: tableData = courses.reduce((acc, course) => {
    // Initialize a Set to track unique courses and avoid duplicates
    
    // Check if this course has already been processed
    if (uniqueCourses.has(course.uuid)) {
        return acc; // Skip duplicates
    }

    // Mark the course UUID as processed
    uniqueCourses.add(course.uuid);

    // Find the English title of the course or fallback to courseCode
    const courseTitle = course.translations.find(t => t.languageCode === 'en')?.title || course.courseCode;

    // Separate arrays for chapter titles and chapter UUIDs
    const chapterTitles = [];
    const chapterUuids = [];

    // Populate the chapter titles and UUIDs arrays
    chapters
        .filter(chapter => chapter.courseUuid === course.uuid)
        .forEach(chapter => {
            const chapterTitle = chapter.translations.find(t => t.languageCode === 'en')?.title 
            chapterTitles.push(chapterTitle);
            chapterUuids.push(chapter.uuid);
        });

    // Add the course data to the tableData array
    acc.push({
        uuid: course.uuid,
        name: courseTitle,
        chapterName: chapterTitles, // Array of chapter titles
        chapterUuid: chapterUuids[0]    // Array of chapter UUIDs
    });

    return acc;
}, []);

  </script>
  
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6" on:click|self={closePopup}>
    <div class="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-auto flex flex-col space-y-3">
      <h2 class="heading-L mb-2">Courses</h2>
      {#if tableData.length !== 0 && !error}
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
          <ErrorMessage error={'No courses found'} />
        </h2>
      {/if}
      <!-- <button
						type="button"
						class="mt-3 inline-flex w-full justify-center flex-end rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto "
						on:click={closePopup}>Close</button
					> -->

          <div class="mt-3 ">
            <Button on:click={closePopup}
            btnType='secondary'
            customClass='w-full'>Cancel</Button
            >
          </div>
    </div>
  </div>

