<script>
	import ErrorMessage from '$lib/components/ErrorMessage.svelte';
	export let heading = '';
</script>

<article class="">
	<h2 class=" font-semibold mb-4">{heading}</h2>
	<section class="">
		<ErrorMessage error={'No records found'} />
	</section>
</article>
