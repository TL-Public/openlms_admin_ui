<script>
	export let stats;
	export let showValueTxt = true; // Prop to control visibility of valueNumber
</script>

<div class="bg-white grid p-4 rounded-lg border border-gray-50 shadow-sm">
	<p class="text-sm 2xl:text-base">{stats?.label}</p>
	<div>
		<span class="text-2xl font-semibold text-primary">{stats?.valueNumber ?? '-'}</span>
		<span class="text-sm">{stats?.valueText ? stats?.valueText : ''}</span>
	</div>
	<p class=" text-xs">{stats?.trend ?? '-'}</p>
</div>
