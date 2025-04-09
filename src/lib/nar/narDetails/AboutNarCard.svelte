<script>
	import Edit from '$lib/svgComponents/Edit.svelte';
	export let narDetails = {};

	let phoneNumberArray = narDetails?.phoneNumber?.split(';');
	let phoneNumber1 = phoneNumberArray[0];
	let phoneNumber2 = phoneNumberArray[1];
	let emailArray = narDetails?.email?.split(';');
	let email1 = emailArray[0];
	let email2 = emailArray[1];
</script>

<div class="grid grid-cols-1 lg:grid-cols-2">
	<div class="shadow bg-offwhite rounded-lg p-6">
		<div>
			<div class="flex gap-1 items-center mb-4">
				<div class="heading-L">National Academy of RUDSETI</div>
				<a href={`/nar/${narDetails.uuid}/edit`}>
					<Edit stroke="#206FC9" />
				</a>
			</div>
			<div class="flex gap-5 flex-col sm:flex-row">
				<div class="flex flex-col gap-4">
					<p class="text-sm"><span class="label">Address</span>: 
						{narDetails?.address ?? '-'}</p>
					<!-- <p class="text-sm">
						Address:
						<span class="label">
							{narDetails?.address ?? '-'}
						</span>
					</p> -->
					<div>

						<p class="text-sm"><span class="label">Phone</span>:<br>
							{phoneNumber1 ?? '-'}<br>
							{phoneNumber2 ?? '-'}
						</p>
					</div>
				</div>
				<div>
					<p class="text-sm"><span class="label">Email</span>: 
						{email1 ?? '-'}<br>
						{email2 ?? '-'}
					</p>
					
				</div>
			</div>
		</div>
	</div>
</div>
