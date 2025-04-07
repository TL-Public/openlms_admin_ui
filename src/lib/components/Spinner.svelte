<script>
    export let size = 16; 
    export let color = "#007bff"; 
    export let overlay = false; // If true, will show as overlay
</script>

{#if overlay}
    <div
        class="fixed inset-0 bg-gray-300 bg-opacity-50 flex items-center justify-center z-50 pointer-events-auto"
        on:wheel|preventDefault
        on:touchmove|preventDefault
    >
        <div 
            class="animate-spin rounded-full border-4 border-gray-300"
            style="width: {size}px; height: {size}px; border-top-color: {color};"
        ></div>
    </div>

    <!-- Prevent scrolling on the main content -->
    <style>
        body {
            overflow: hidden;
        }
    </style>
{:else}
    <div 
    class="inline-block animate-spin rounded-full border-[3px] border-gray-300 border-t-transparent"
    style="width: {size}px; height: {size}px; border-top-color: {color};"
></div>
{/if}
