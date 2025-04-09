<script>
	import Edit from '$lib/svgComponents/Edit.svelte';
	import RadioButton from '$lib/components/RadioButton.svelte';

	export let stateDetails = {};
	
	
</script>

<div class="flex flex-col text-sm p-6 rounded-lg gap-4 text-darkGray border border-gray-50 bg-white leading-relaxed">
	<div class="">
		<div class="flex gap-1 items-center mb-4">
			<div class="text-base font-bold capitalize text-primary">{stateDetails?.name ?? ''}</div>
			<a href={`/states/edit?data=` + encodeURIComponent(JSON.stringify(stateDetails))}>
				<Edit stroke="#FF6A1F" />
			</a>
			
		</div>
		<div class="flex gap-5">
			<div class="flex flex-col gap-4">
				<div>
					<p class="text-sm">
						<span class="label">ISO Code:</span>
						{stateDetails?.isocode ?? '-'}
					</p>
				</div>
				<div>
					<p class="test-sm">
						<span class="label">District count:</span>
						{stateDetails?.distictcount ?? '-'}
					</p>
				</div>
			</div>
		</div>
	</div>
</div>
