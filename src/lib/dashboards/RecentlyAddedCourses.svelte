<!-- This Widget is only for RSETI Admin/Staff -->
<script>
	import { onMount, onDestroy, tick } from 'svelte';
	import DataCard from '$lib/dashboards/DataCard.svelte';
	import { debounce } from '$lib/utils/dashboard/helper.js';
	import { page } from '$app/stores';
	import { months } from '$lib/data.js';
	import { handleRedirection } from '$lib/utils/helper.js';

	export let selectedGlobalFilters = {};
	export let minimalCoursesData = [];
	export let minimalRSETIData = [];

	let data = [];
	let loading = true;
	let error = null;
	let currentAbortController = null;

	const debouncedFetchRecentCourses = debounce((globalFilters) => {
		// Cancel any ongoing request
		if (currentAbortController) {
			currentAbortController.abort();
		}

		// Create new AbortController
		currentAbortController = new AbortController();

		// Fetch data with abort signal
		fetchRecentCourses(globalFilters, currentAbortController.signal);
	}, 300);

	$: {
		debouncedFetchRecentCourses(selectedGlobalFilters);
	}

	// ------------------------------- Fetch Recently Added Courses -----------------------------------
	async function fetchRecentCourses(globalFilters, signal = null) {
		try {
			loading = true;
			error = null;
			const queryParams = new URLSearchParams();

			queryParams.append('limit', '10');
			queryParams.append('days', '7'); // Last 7 days


			const response = await fetch(
				`/apis/analytics/courses/recent?${queryParams.toString()}`
			);

			if (!response.ok) {
				if(response.status === 401) {
					handleRedirection(response?.status, $page.url.pathname, $page.url.search);
				}
				throw new Error(`Failed to fetch recent courses. Status: ${response.status}`);
			}

			const result = await response.json();

			// console.log('Recently Added Courses result:', result);

			if (!result.success) {
				throw new Error(result.error || 'Failed to fetch recent courses data');
			}

			const recentCourses = result.data?.courses || [];
			// console.log('Recent Courses:', recentCourses);


			data = recentCourses.map((course) => {
				const courseInfo = minimalCoursesData.find(c => 
					c.courseCode === course.courseCode || 
					c.courseCode === course.displayCourseCode
				);
				const courseTitle = courseInfo?.name || 'Unknown Course';

				const courseUuid = courseInfo?.uuid || courseInfo?.id

				// Get rsetiUuid from page data
				const rsetiUuid = $page?.data?.user?.rsetiId;
				
				const rsetiInfo = minimalRSETIData.find(r => r.uuid === rsetiUuid);
				const rsetiName = rsetiInfo?.name || 'Unknown RSETI';

				// Create course data object for query params 
				const courseData = {
					rsetiCourseUuid: course.rsetiCourseId, 
					courseUuid: courseUuid,
					name: courseTitle,
					courseName: courseTitle,
					startDate: course.startDate,
					endDate: course.endDate,
					traineesGraduated: null,
					courseCode: course.displayCourseCode || course.courseCode,
					duration: course.duration,
					rsetiUuid: rsetiUuid,
					rsetiName: rsetiName
				};

				// Generate URL with encoded data 
				const courseUrl = `/trainingCenters/${courseData.rsetiUuid}/details/courseDetails/addTrainees?data=${encodeURIComponent(JSON.stringify(courseData))}`;

				return {
					title: courseTitle,
					subtitle: course.startDate ? `Start date: ${formatDate(course.startDate)}` : 'No start date',
					value: 'Add Trainees', 
					link: true,
					src: courseUrl, 
					id: course.rsetiCourseId,
					courseCode: course.courseCode,
					displayCourseCode: course.displayCourseCode,
					duration: course.duration,
					imageUrl: course.imageUrl,
					createdAt: course.createdAt
				};
			});

			await tick()
			loading = false;
		} catch (err) {
			console.error('Error fetching recently added courses:', err);
			
			if (err.name === 'AbortError') {
				// Request was aborted, this is expected behavior
				return;
			}

			error = err.message || 'Failed to load recent courses data';
			data = [];
			await tick();
			loading = false;
		}
	}

	// Generate mock data for recently added courses
	async function generateMockRecentCourses() {
		const course1Data = {
			rsetiCourseUuid: "4d5bd253-908f-44c9-b886-dbfcb5038f1b",
			courseUuid: "ca0ea45a-0b2a-44e8-960d-ea753d3928a1",
			name: "Photo Framing, Lamination and Screen Printing",
			courseName: "Photo Framing, Lamination and Screen Printing",
			startDate: "5 / 2024",
			endDate: "7 / 2024",
			traineesGraduated: 0,
			courseCode: "PFL001",
			duration: 90,
			rsetiUuid: "8fbac7df-e0d8-4e25-9c56-e4f544ba37c5",
			rsetiName: "CANB Thrissur"
		};

		const course2Data = {
			rsetiCourseUuid: "6e8ca354-919f-55d9-c997-ecfdd6149g2c",
			courseUuid: "db1fb56b-1c3b-55f9-a71e-fb864e4a39b2",
			name: "Organic farming and processing",
			courseName: "Organic farming and processing",
			startDate: "5 / 2024",
			endDate: "8 / 2024",
			traineesGraduated: 0,
			courseCode: "OFP002",
			duration: 120,
			rsetiUuid: "8fbac7df-e0d8-4e25-9c56-e4f544ba37c5",
			rsetiName: "CANB Thrissur"
		};

		const course3Data = {
			rsetiCourseUuid: "7f9db465-a2af-66ea-da8f-fdg75f5b4ac3",
			courseUuid: "ec2gc67c-2d4c-66ga-b82f-gc975f5c4bd3",
			name: "Welding and Metalcraft",
			courseName: "Welding and Metalcraft",
			startDate: "5 / 2024",
			endDate: "9 / 2024",
			traineesGraduated: 125,
			courseCode: "WMC003",
			duration: 150,
			rsetiUuid: "8fbac7df-e0d8-4e25-9c56-e4f544ba37c5",
			rsetiName: "CANB Thrissur"
		};

		const course1Url = `/trainingCenters/${course1Data.rsetiUuid}/details/courseDetails/addTrainees?data=${encodeURIComponent(JSON.stringify(course1Data))}`;
		const course2Url = `/trainingCenters/${course2Data.rsetiUuid}/details/courseDetails/addTrainees?data=${encodeURIComponent(JSON.stringify(course2Data))}`;

		return [
			{
				title: 'Photo Framing, Lamination and Screen Printing',
				subtitle: 'Start date: 09-May-2024',
				value: 'Add Trainees',
				link: true,
				src: course1Url,
				id: course1Data.rsetiCourseUuid
			},
			{
				title: 'Organic farming and processing',
				subtitle: 'Start date: 10-May-2024',
				value: 'Add Trainees',
				link: true,
				src: course2Url,
				id: course2Data.rsetiCourseUuid
			},
			{
				title: 'Welding and Metalcraft',
				subtitle: 'Start date: 12-May-2024',
				value: 'Trainees 125',
				link: false,
				id: course3Data.rsetiCourseUuid
			}
		];
	}

	// Format date helper function
	function formatDate(dateString) {

	// Handle ISO format YYYY-MM-DD
	if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
		const [year, month] = dateString.split('-');
		const monthIndex = parseInt(month, 10) - 1;
		return `${months[monthIndex]} - ${year}`;
	}

	// Handle format M/YYYY or MM/YYYY
	if (/^\d{1,2}\/\d{4}$/.test(dateString)) {
		const [month, year] = dateString.split('/');
		const monthIndex = parseInt(month, 10) - 1;
		return `${months[monthIndex]} - ${year}`;
	}

	return "Invalid date format";
	}

	// Cleanup function to abort ongoing requests
	onDestroy(() => {
		if (currentAbortController) {
			currentAbortController.abort();
		}
	});

	// Initial load on mount
	onMount(() => {
		fetchRecentCourses({});
	});
</script>

<DataCard
	title="Recently Added Courses"
	subtitle="Last 7 days"
	{data}
	{loading}
	{error}
	selectedGlobalFilters={selectedGlobalFilters}
/>