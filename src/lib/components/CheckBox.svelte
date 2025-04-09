<script>
	export let checkBoxLabel = '';
	export let checkBoxDiscription = '';
	export let checked = false;
	export let name = 'comments';
</script>

<div class="relative flex items-start">
	<div class="flex h-6 items-center">
		<input
			id="comments"
			aria-describedby="comments-description"
			{name}
			type="checkbox"
			class="h-4 w-4 border-[1px] text-indigo-600 focus:ring-indigo-600"
			bind:checked
		/>
	</div>
	<div class="ml-3 sm:text-sm text-xs leading-6">
		<label for="comments" class="font-medium text-gray-900">{checkBoxLabel}</label>
		<span id="comments-description" class="text-gray-500"
			><span class="sr-only">{checkBoxLabel}</span>{checkBoxDiscription}</span
		>
	</div>
</div>
