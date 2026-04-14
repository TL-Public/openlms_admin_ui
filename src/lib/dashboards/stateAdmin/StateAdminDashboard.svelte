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
	import {
		formatNumberWithIntl,
		formatTimeWithIntl,
		formatTrend
	} from '$lib/utils/dashboard/helper.js';
	import TraineeOnboardTrendAcrossCategories from '$lib/dashboards/TraineeOnboardTrendAcrossCategories.svelte';
	import RecentlyAddedVideos from '$lib/dashboards/RecentlyAddedVideos.svelte';
	import { handleRedirection } from '$lib/utils/helper.js';
	import { page } from '$app/stores';

	export let minimalCoursesData = [];
	export let genderOptions = [];
	export let minimalRSETIData = [];
	export let minimalStatesData = [];

	let globalFilterOptions = [];
	let globalSelectedFilters = {};
	let widgetFilters = []; //just pass it to the componenets, they are handling the filtering

	let stateAdminStats = { data: [], loading: true, error: null };

	let dummyStatPods = new Array(6);

	// ----------------------------- STATS API -----------------------------
	async function loadStats() {
		stateAdminStats = { ...stateAdminStats, loading: true, error: null };
		try {
			const queryParams = new URLSearchParams();

			// if ($page.data?.user?.stateId) {
			// 	const state = minimalStatesData.find((s) => s.id === $page.data?.user?.stateId);
			// 	if (state?.isoCode) {
			// 		queryParams.set('state', state.isoCode);
			// 	}
			// }

			// Add RSETI filter if selected (StateAdmin only has RSETI filter)
			if (globalSelectedFilters?.RSETI?.extId) {
				queryParams.set('rseti', globalSelectedFilters.RSETI.extId);
			}

			const response = await fetch(`/apis/analytics/stats?${queryParams.toString()}`);

			if (response.ok) {
				const result = await response.json();
				if (result.success) {
					const transformedStats = transformApiDataToStats(result.data);
					stateAdminStats = { data: transformedStats, loading: false, error: null };
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
			stateAdminStats = { data: [], loading: false, error: err.message || 'Failed to load stats' };
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
			// if (apiData.rsetiCourses !== undefined) {
			// 	const { number, text } = formatNumberWithIntl(apiData.rsetiCourses?.count);
			// 	stats.push({
			// 		label: 'RSETI Courses',
			// 		valueNumber: number,
			// 		valueText: text,
			// 		trend: formatTrend(apiData.rsetiCourses)
			// 	});
			// }

			if (apiData.rsetis !== undefined) {
				const { number, text } = formatNumberWithIntl(apiData.rsetis?.count);
				stats.push({
					label: 'RSETIs',
					valueNumber: number,
					valueText: text,
					trend: formatTrend(apiData.rsetis)
				});
			}

			// RSETI Courses - specific to StateAdmin dashboard
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
		// No dependent filters needed for StateAdmin - RSETI is the only filter
		// This function is kept for consistency but doesn't need to handle dependencies
	}

	async function setFilterOption() {
		if (minimalRSETIData)
			globalFilterOptions = [{ filterName: 'RSETI', filterValue: minimalRSETIData }];

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
			{#if stateAdminStats?.loading}
				{#each dummyStatPods as stats}
					<IndividualStatsSkeleton />
				{/each}
			{:else if stateAdminStats?.error}
				<div class="col-span-full">
					<SubmissionErrorMessage errorMessage={stateAdminStats.error} />
				</div>
			{:else}
				{#each stateAdminStats?.data as stats, index (index)}
					<IndividualStats {stats} loading={stateAdminStats?.loading} />
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
			<!-- <TopCourses
				coursesData={topCourses?.data}
				filters={widgetFilters}
				selectedGlobalFilters={globalSelectedFilters}
			/> -->
			<TraineeOnboardTrend filters={widgetFilters} selectedGlobalFilters={globalSelectedFilters} />
			<TraineeOnboardTrendAcrossCategories
				filters={widgetFilters}
				selectedGlobalFilters={globalSelectedFilters}
			/>
		</div>

		<!-- Right Side Charts -->
		<div
			class="grid gap-2 w-full bp-900px:w-2/5 h-auto grid-cols-1 sm:grid-cols-2 bp-900px:grid-cols-1 self-start"
		>
			<!-- <TopRsetisGraduated 
				selectedGlobalFilters={globalSelectedFilters}
				minimalRsetiData={minimalRSETIData}
				minimalStatesData={minimalStatesData}
			/> -->

			<TopRsetisOnboarded minimalRsetiData={minimalRSETIData} {minimalStatesData} />

			<!-- <TopRsetisOnboardedReap 
				selectedGlobalFilters={globalSelectedFilters}
				minimalRsetiData={minimalRSETIData}
				minimalStatesData={minimalStatesData}
			/> -->
		</div>
	</div>
</div>
