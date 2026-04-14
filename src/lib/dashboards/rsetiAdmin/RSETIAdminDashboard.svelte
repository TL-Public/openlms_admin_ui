<script>
	import TopVideos from '$lib/dashboards/TopVideos.svelte';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import TraineeOnboardTrend from '$lib/dashboards/superAdmin/TraineeOnboardTrend.svelte';
	import ViewTrend from '$lib/dashboards/ViewTrend.svelte';
	import TopTraineesByWatchTime from '$lib/dashboards/TopTraineesByWatchTime.svelte';
	import RecentlyAddedCourses from '$lib/dashboards/RecentlyAddedCourses.svelte';
	import IndividualStats from '$lib/components/IndividualStats.svelte';
	import IndividualStatsSkeleton from '$lib/components/IndividualStatsSkeleton.svelte';
	import SubmissionErrorMessage from '$lib/components/SubmissionErrorMessage.svelte';
	import { formatNumberWithIntl, formatTimeWithIntl, formatTrend } from '$lib/utils/dashboard/helper.js';
	import TraineeOnboardTrendAcrossCategories from '$lib/dashboards/TraineeOnboardTrendAcrossCategories.svelte';
	import RecentlyAddedVideos from '$lib/dashboards/RecentlyAddedVideos.svelte';
	import { handleRedirection } from '$lib/utils/helper.js';

	export let minimalCoursesData = [];
	export let genderOptions = [];
	export let minimalRSETIData = [];

	// State
	let rsetiAdminStats = { data: [], loading: true, error: null };

	let dummyStatPods = new Array(6);

	// Filters
	let filters = [
		{
			id: 'courseFilter',
			label: 'Course',
			placeholder: 'Select Course',
			type: 'select',
			options: minimalCoursesData,
			optionListConfigObject: { optionNameKey: 'name', optionIdKey: 'uuid' },
			value: null,
			filterName: 'course',
			filterValue: minimalCoursesData
		},
		{
			id: 'genderFilter',
			label: 'Gender',
			placeholder: 'Select Gender',
			type: 'select',
			options: genderOptions,
			optionListConfigObject: { optionNameKey: 'name', optionIdKey: 'id' },
			value: null,
			filterName: 'gender',
			filterValue: genderOptions
		}
	];

	// ----------------------------- STATS API -----------------------------
	async function loadStats() {
		rsetiAdminStats = { ...rsetiAdminStats, loading: true, error: null };
		try {
			const queryParams = new URLSearchParams();

			// if ($page.data?.user?.rsetiId) {
			// 	const rseti = minimalRSETIData.find(r => r.uuid === $page.data?.user?.rsetiId);
			// 	if (rseti?.extId) {
			// 		queryParams.set('rseti', rseti.extId);
			// 	}
			// }

			const response = await fetch(`/apis/analytics/stats?${queryParams.toString()}`);

			if (response.ok) {
				const result = await response.json();
				if (result.success) {
					const transformedStats = transformApiDataToStats(result.data);
					rsetiAdminStats = { data: transformedStats, loading: false, error: null };
				} else {
					throw new Error(result.error || 'Failed to load stats');
				}
			} else {
					if(response.status === 401) {
					handleRedirection(response?.status, $page.url.pathname, $page.url.search);
				}
				throw new Error(`Failed to load stats: ${response.status}`);
			}
		} catch (err) {
			console.error('Error loading stats:', err);
			rsetiAdminStats = { data: [], loading: false, error: err.message || 'Failed to load stats' };
		}
	}

	// ----------------------------- DATA TRANSFORMATION -----------------------------
	function transformApiDataToStats(apiData) {
		const stats = [];

		if (apiData) {
			if (apiData.courses !== undefined) {
				const { number, text } = formatNumberWithIntl(apiData.courses?.count);
				stats.push({
					label: 'Courses',
					valueNumber: number,
					valueText: text,
					trend: formatTrend(apiData.courses)
				});
			}

				if (apiData.rsetiCourses !== undefined) {
				const { number, text } = formatNumberWithIntl(apiData.rsetiCourses?.count);
				stats.push({
					label: 'RSETI Courses',
					valueNumber: number,
					valueText: text,
					trend: formatTrend(apiData.rsetiCourses)
				});
			}

			if (apiData.trainees !== undefined) {
				const { number, text } = formatNumberWithIntl(apiData.trainees?.count);
				stats.push({
					label: 'Trainees',
					valueNumber: number,
					valueText: text,
					trend: formatTrend(apiData.trainees)
				});
			}

			if (apiData.trainers !== undefined) {
				const { number, text } = formatNumberWithIntl(apiData.trainers);
				stats.push({
					label: 'Trainers',
					valueNumber: number,
					valueText: text,
					trend: formatTrend(apiData.trainers)
				});
			}

			if (apiData.videos !== undefined) {
				const { number, text } = formatNumberWithIntl(apiData.videos?.count);
				stats.push({
					label: 'Videos',
					valueNumber: number,
					valueText: text,
					trend: formatTrend(apiData.videos)
				});
			}

			if (apiData.watchTime !== undefined) {
				const { number, text } = formatTimeWithIntl(apiData.watchTime.hours);
				stats.push({
					label: 'Watch time',
					valueNumber: number,
					valueText: text,
					trend: formatTrend(apiData.watchTime)
				});
			}

			if (apiData.totalViews !== undefined) {
				const { number, text } = formatNumberWithIntl(apiData.totalViews.count);
				stats.push({
					label: 'Total views',
					valueNumber: number,
					valueText: text,
					trend: formatTrend(apiData.totalViews)
				});
			}
		}

		return stats;
	}



	// Load all in parallel
	onMount(async () => {
		await loadStats();
	});
</script>

<div>
	<!-- Stats -->
	<div>
		<div
			class="grid grid-cols-2 bp-420px:grid-cols-3 sm:grid-cols-4 bp-900px:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 mb-4"
		>
			{#if rsetiAdminStats?.loading}
				{#each dummyStatPods as stats}
					<IndividualStatsSkeleton />
				{/each}
			{:else if rsetiAdminStats?.error}
				<div class="col-span-full">
					<SubmissionErrorMessage errorMessage={rsetiAdminStats.error} />
				</div>
			{:else}
				{#each rsetiAdminStats?.data as stats, index (index)}
					<IndividualStats {stats} loading={rsetiAdminStats?.loading} />
				{/each}
			{/if}
		</div>
	</div>

	<!-- Charts -->
	<div class="flex flex-col bp-900px:flex-row gap-2">
		<!-- Left Side Charts -->
		<div class="flex w-full bp-900px:w-3/5 flex-col gap-2">
			<ViewTrend {filters} />
			<TopVideos {filters} />
			<RecentlyAddedVideos/>
			<TraineeOnboardTrend {filters} />
			<TraineeOnboardTrendAcrossCategories
				{filters}
			/>
		</div>

		<!-- Right Side Charts -->
		<div
			class="grid gap-2 w-full bp-900px:w-2/5 h-auto grid-cols-1 sm:grid-cols-2 bp-900px:grid-cols-1 self-start"
		>
			<TopTraineesByWatchTime />

			<RecentlyAddedCourses {minimalCoursesData} {minimalRSETIData} />
		</div>
	</div>
</div>
