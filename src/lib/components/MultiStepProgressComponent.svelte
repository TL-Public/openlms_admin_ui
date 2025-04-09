<script>
	export let steps = [];
	export let currentStep = 1;
	export let primaryColor = 'bg-primary';
	export let activeColor = 'bg-orange-100';
	export let textColor = 'text-darkGray';

	$: stepsArray = steps.map((step, index) => ({
		...step,
		isActive: step?.number === currentStep,
		isCompleted: step?.number < currentStep,
		isLast: index === steps?.length - 1
	}));

	function getStepClass(step) {
		if (step.isActive) {
			return `${activeColor} text-white `;
		} else if (step.isCompleted) {
			return `${primaryColor} text-white `;
		}
		return 'border border-primary font-semibold';
	}

	function getStepContent(step) {
		if (step?.isLast) {
			return '✓';
		}
		return step?.number;
	}
</script>

<div class="flex mb-8 lg:mb-4 text-sm max-w-2xl mx-auto relative">
	{#each stepsArray as step, index}
		<div class="flex flex-col items-center flex-1">
			<!-- Step Indicator -->
			<span
				class={`flex items-center justify-center mb-2 px-2 py-0.5 lg:px-2 lg:py-1 rounded-full text-xs lg:text-sm h-6 w-6 lg:h-8 lg:w-8 ${getStepClass(step)} `}
			>
				{getStepContent(step)}
			</span>
			<!-- Step Label -->
			<span
				class={`text-xs lg:text-sm ${step?.isActive || step?.isCompleted ? `font-medium ${textColor}` : 'text-gray-90'}`}
			>
				{step?.text}
			</span>
		</div>

		<!-- Separator Line -->
		{#if !step?.isLast}
			<div class="flex-grow border-t lg:border-t-2 border-darkGray border-dashed mx-2 mt-4"></div>
		{/if}
	{/each}
</div>
