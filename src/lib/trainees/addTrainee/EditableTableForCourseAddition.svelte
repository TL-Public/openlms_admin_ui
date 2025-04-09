<script>
    import GoogleMatrialIcon from "$lib/components/GoogleMatrialIcon.svelte";

    let courses = [];
    let newCourse = { courseName: '', joiningDate: '', courseId: '' };
    let editing = false;
    let editIndex = -1;
    let errorMessage = ''; // To store the error message if the course is already added
  
    const courseOptions = [
      { name: "Course 1", id: 1 },
      { name: "Course 2", id: 2 }
    ];
  
    // Get today's date in the format yyyy-mm-dd to set max in the date picker
    let today = new Date().toISOString().split('T')[0];
  
    function addCourse() {
      // Clear previous error message
      errorMessage = '';
  
      // Check if course is already added, but ignore the course being edited
      if (!editing && courses.some(course => course.courseName === newCourse.courseName)) {
        errorMessage = 'This course is already added.';
        return;
      }
  
      // Proceed to add or edit the course
      if (newCourse.courseName && newCourse.joiningDate) {
        if (editIndex === -1) {
          // Add new course
          courses = [...courses, { ...newCourse }];
        } else {
          // If editing, update the course
          courses[editIndex] = { ...newCourse };
          editing = false;
          editIndex = -1;
        }
        // Reset form
        newCourse = { courseName: '', joiningDate: '', courseId: '' };
      }
    }
  
    function removeCourse(index) {
      courses = courses.filter((_, i) => i !== index);
      if (editIndex === index) {
        newCourse = { courseName: '', joiningDate: '', courseId: '' };
        editing = false;
        editIndex = -1;
      }
    }
  
    function editCourse(index) {
      newCourse = { ...courses[index] };
      editing = true;
      editIndex = index;
    }
  </script>
  
  <div class="container mx-auto p-4">
    <table class="w-full bg-white shadow-md rounded-lg overflow-hidden">
      <thead class="bg-gray-200">
        <tr>
          <th class="px-4 py-2 text-left">Course</th>
          <th class="px-4 py-2 text-left">Joining Date</th>
          <th class="px-4 py-2 text-left">Actions</th>
        </tr>
      </thead>
      <tbody>
        {#each courses as course, index}
          <tr class="border-b">
            {#if editIndex === index}
              <!-- Edit Mode for the current row -->
              <td class="px-4 py-2">
                <select
                  bind:value={newCourse.courseName}
                  class="w-full p-2 border rounded"
                >
                  <option value="">Select a course</option>
                  {#each courseOptions as option}
                    <option value={option.name}>{option.name}</option>
                  {/each}
                </select>
              </td>
              <td class="px-4 py-2">
                <input
                  type="date"
                  bind:value={newCourse.joiningDate}
                  
                  class="w-full p-2 border rounded"
                />
              </td>
              <td class="px-4 py-2">
                <button
                  on:click={addCourse}
                  class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  disabled={!newCourse.courseName || !newCourse.joiningDate}
                >
                  Save Changes
                </button>
              </td>
            {/if}
            {#if editIndex !== index}
              <!-- Normal display mode -->
              <td class="px-4 py-2">{course.courseName}</td>
              <td class="px-4 py-2">{course.joiningDate}</td>
              <td class="px-4 py-2">
                <button
                  on:click={() => editCourse(index)}
                  class=" px-2 py-1 rounded mr-2 "
                >
                <GoogleMatrialIcon iconName={'edit'} addClass="text-base" />
                </button>
                <button
                  on:click={() => removeCourse(index)}
                  class=" px-2 py-1 rounded "
                >
                <GoogleMatrialIcon iconName={'delete'} addClass="text-base" />
                </button>
              </td>
            {/if}
          </tr>
        {/each}
  
        {#if editIndex === -1}
          <!-- Add new course row, only visible when not editing -->
          <tr class="border-b">
            <td class="px-4 py-2">
              <select
                bind:value={newCourse.courseName}
                class="w-full p-2 border rounded"
              >
                <option value="">Select a course</option>
                {#each courseOptions as option}
                  <option value={option.name}>{option.name}</option>
                {/each}
              </select>
            </td>
            <td class="px-4 py-2">
              <input
                type="date"
                bind:value={newCourse.joiningDate}
                max={today} 
                class="w-full p-2 border rounded"
              />
            </td>
            <td class="px-4 py-2">
              <button
                on:click={addCourse}
                class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                disabled={!newCourse.courseName || !newCourse.joiningDate}
              >
                Add Course
              </button>
            </td>
          </tr>
        {/if}
      </tbody>
    </table>
  
    <!-- Display error message if a course is already added -->
    {#if errorMessage}
      <div class="text-red-500 mt-2">{errorMessage}</div>
    {/if}
  </div>
  