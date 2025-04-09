<script>
    export let options = [];
    export let display_func = a => a;
    export let value_func = a => a;
    export let value;
    
  </script>
  
  <select bind:value={value} class="px-6 py-2 bg-blue-20 rounded border border-gray-50">
    {#each options as option, i}
      <option value={value_func(option)}>{display_func(option) }</option>
    {/each}
  </select>