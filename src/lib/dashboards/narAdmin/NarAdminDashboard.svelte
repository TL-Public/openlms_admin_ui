<script>
	import TopVideos from '$lib/dashboards/TopVideos.svelte';
	import { onMount } from 'svelte';
	import TraineeOnboardTrend from '$lib/dashboards/superAdmin/TraineeOnboardTrend.svelte';
	import ViewTrend from '$lib/dashboards/ViewTrend.svelte';
	import TopRsetisOnboarded from '$lib/dashboards/TopRsetisOnboarded.svelte';
	import TopRsetisGraduated from '$lib/dashboards/TopRsetisGraduated.svelte';
	import TopRsetisOnboardedReap from '$lib/dashboards/TopRsetisOnboardedReap.svelte';
	import IndividualStats from '$lib/components/IndividualStats.svelte';
	import IndividualStatsSkeleton from '$lib/components/IndividualStatsSkeleton.svelte';
	import SubmissionErrorMessage from '$lib/components/SubmissionErrorMessage.svelte';
	import FilterComponent from '$lib/components/FilterComponent.svelte';
	import { formatNumberWithIntl, formatTimeWithIntl, formatTrend, getYesterdayDate } from '$lib/utils/dashboard/helper.js';
	import TopStatesVideoCompletions from '$lib/dashboards/TopStatesVideoCompletions.svelte';
	import TopStatesTraineeOnboard from '$lib/dashboards/TopStatesTraineeOnboard.svelte';
	import RecentlyAddedVideos from '$lib/dashboards/RecentlyAddedVideos.svelte';
	import TraineeOnboardTrendAcrossCategories from '$lib/dashboards/TraineeOnboardTrendAcrossCategories.svelte';
	import TrafficInsights from '$lib/dashboards/TrafficInsights.svelte';
	import { handleRedirection } from '$lib/utils/helper.js';
	import { page } from '$app/stores';

	export let minimalCoursesData = [];
	export let genderOptions = [];
	export let minimalStatesData = [];
	export let minimalRsetiData = []; 

	let globalFilterOptions = [];
	let globalFilterDependencies = { RSETI: 'States' };
	let globalSelectedFilters = {}; 
	let widgetFilters = []; //just pass it to the componenets, they are handling the filtering

	let superAdminStats = { data: [], loading: true, error: null };

	let dummyStatPods = new Array(6);

	// ----------------------------- STATS API -----------------------------
	async function loadStats() {
		superAdminStats = { ...superAdminStats, loading: true, error: null };
		try {
			const queryParams = new URLSearchParams();

			// Add filters if selected
			if (globalSelectedFilters?.States?.isoCode) {
				queryParams.set('state', globalSelectedFilters.States.isoCode);
			}

			if (globalSelectedFilters?.RSETI?.extId) {
				queryParams.set('rseti', globalSelectedFilters.RSETI.extId);
			}

			const response = await fetch(`/apis/analytics/stats?${queryParams.toString()}`);

			if (response.ok) {
				const result = await response.json();
				if (result.success) {
					const transformedStats = transformApiDataToStats(result.data);
					superAdminStats = { data: transformedStats, loading: false, error: null };
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
			superAdminStats = { data: [], loading: false, error: err.message || 'Failed to load stats' };
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

			if (apiData.rsetis !== undefined) {
				const { number, text } = formatNumberWithIntl(apiData.rsetis?.count);
				stats.push({
					label: 'RSETIS',
					valueNumber: number,
					valueText: text,
					trend: formatTrend(apiData.rsetis)
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

	// ----------------------------- FILTER HANDLING -----------------------------
	function handleGlobalFilterApplied(e) {
		globalSelectedFilters = e.detail.selectedFilters;
		// Reload stats when global filters are applied
		loadStats();
		// Note: Individual wrapper components will handle their own data fetching
		// based on the globalSelectedFilters reactive updates
	}

	async function handleGlobalFilterChanged(e) {
		const { category, selectedItem } = e.detail;

		if (category === 'States') {
			if (selectedItem) {
				// If a state is selected we are setting the dependant filter, if state is selected we are setting dependant filter RSETI with rsetis of that state
				const rsetiFilter = {
					filterName: 'RSETI',
					filterValue: selectedItem.rsetis?.map((r) => ({ id: r.id, name: r.name, extId: r.extId })) ?? []
				};

				const index = globalFilterOptions.findIndex((f) => f.filterName === 'RSETI');
				if (index >= 0) {
					globalFilterOptions[index] = rsetiFilter;
				} else {
					globalFilterOptions = [...globalFilterOptions, rsetiFilter];
				}
			} else {
				globalFilterOptions = globalFilterOptions.filter((f) => f.filterName !== 'RSETI');
			}
		}
	}

	async function setFilterOption() {
		if (minimalStatesData)
			globalFilterOptions = [{ filterName: 'States', filterValue: minimalStatesData }];

		widgetFilters = [
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
	}

	// ----------------------------- LIFECYCLE -----------------------------
	onMount(async () => {
		await setFilterOption();
		await loadStats();
	});
</script>

<div>
	<!-- Global Filter -->
	<div class="mb-4 flex justify-end">
		<FilterComponent
			on:filterApplied={handleGlobalFilterApplied}
			on:filterChanged={handleGlobalFilterChanged}
			filterOptions={globalFilterOptions}
			filterDependencies={globalFilterDependencies}
		>
			<span slot="btnContent" class="flex gap-2">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="feather feather-filter"
					><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg
				> Global Filters
			</span>
		</FilterComponent>
	</div>

	<!-- Stats -->
	<div>
		<div
			class="grid grid-cols-2 bp-420px:grid-cols-3 sm:grid-cols-4 bp-900px:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 mb-4"
		>
			{#if superAdminStats?.loading}
				{#each dummyStatPods as stats}
					<IndividualStatsSkeleton />
				{/each}
			{:else if superAdminStats?.error}
				<div class="col-span-full">
					<SubmissionErrorMessage errorMessage={superAdminStats.error} />
				</div>
			{:else}
				{#each superAdminStats?.data as stats, index (index)}
					<IndividualStats {stats} loading={superAdminStats?.loading} />
				{/each}
			{/if}
		</div>
	</div>

	<!-- Charts -->
	<div class="flex flex-col bp-900px:flex-row gap-2">
		<!-- Left Side Charts -->
		<div class="flex w-full bp-900px:w-3/5 flex-col gap-2">
			<ViewTrend filters={widgetFilters} selectedGlobalFilters={globalSelectedFilters} />
			<TopVideos filters={widgetFilters} selectedGlobalFilters={globalSelectedFilters} />
			<RecentlyAddedVideos/>
			<TraineeOnboardTrend filters={widgetFilters} selectedGlobalFilters={globalSelectedFilters} />
			<TraineeOnboardTrendAcrossCategories
				filters={widgetFilters}
				selectedGlobalFilters={globalSelectedFilters}
			/>
			<TrafficInsights
				filters={[{ filterName: 'Date', type: 'datepicker', maxDate:getYesterdayDate()}]}
				/>
		</div>

		<!-- Right Side Charts -->
		<div
			class="grid gap-2 w-full bp-900px:w-2/5 h-auto grid-cols-1 sm:grid-cols-2 bp-900px:grid-cols-1 self-start"
		>
			<!-- Commented out until API is ready -->

			<TopStatesVideoCompletions
				minimalStatesData={minimalStatesData}
			 />

			 <TopStatesTraineeOnboard
				minimalStatesData={minimalStatesData} 

			 />
			 
			<!-- <TopRsetisGraduated 
				selectedGlobalFilters={globalSelectedFilters}
				minimalRsetiData={minimalRsetiData}
				minimalStatesData={minimalStatesData}
			/> -->

			<TopRsetisOnboarded 
				selectedGlobalFilters={globalSelectedFilters}
				minimalRsetiData={minimalRsetiData}
				minimalStatesData={minimalStatesData}
			/>

			<!-- Commented out until API is ready -->
			<!-- <TopRsetisOnboardedReap 
				selectedGlobalFilters={globalSelectedFilters}
				minimalRsetiData={minimalRsetiData}
				minimalStatesData={minimalStatesData}
			/> -->
		</div>
	</div>
</div>
