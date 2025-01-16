<script>
    export let size = 16; // Default size
    export let color = "#007bff"; // Default color
  </script>
  
  <div
    style="
    display: inline-block;
      width: {size}px;
      height: {size}px;
      border: {size / 8}px solid #ccc;
      border-top-color: {color};
      border-radius: 50%;
      animation: spin 1s linear infinite;
    "
  ></div>
  
  <style>
    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
  </style>
  