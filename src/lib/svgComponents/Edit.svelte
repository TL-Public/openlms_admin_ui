<script>
	export let stroke = '#565E6C';
	export let strokeWidth = 1.5;
	export let filled = false;
	export let fillColor = '';
</script>

<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
	<path
		d="M8.29199 2.19763H6.87533C3.33366 2.19763 1.91699 3.6143 1.91699 7.15597V11.406C1.91699 14.9476 3.33366 16.3643 6.87533 16.3643H11.1253C14.667 16.3643 16.0837 14.9476 16.0837 11.406V9.9893"
		{stroke}
		stroke-width={strokeWidth}
		stroke-linecap="round"
		stroke-linejoin="round"
	/>
	<path
		d="M11.8618 2.92023L6.28016 8.5019C6.06766 8.7144 5.85516 9.13231 5.81266 9.4369L5.50808 11.569C5.39474 12.3411 5.94016 12.8794 6.71224 12.7731L8.84432 12.4686C9.14182 12.4261 9.55974 12.2136 9.77933 12.0011L15.361 6.4194C16.3243 5.45606 16.7777 4.3369 15.361 2.92023C13.9443 1.50356 12.8252 1.9569 11.8618 2.92023Z"
		{stroke}
		stroke-width={strokeWidth}
		fill={filled && fillColor ? fillColor : 'none'}
		stroke-miterlimit="10"
		stroke-linecap="round"
		stroke-linejoin="round"
	/>
	<path
		d="M11.0615 3.72058C11.5361 5.4135 12.8607 6.73808 14.5607 7.21975"
		{stroke}
		stroke-width={strokeWidth}
		stroke-miterlimit="10"
		stroke-linecap="round"
		stroke-linejoin="round"
	/>
</svg>
