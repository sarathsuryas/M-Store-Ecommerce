async function showDropdown() {
  const input = document.getElementById('searchInput').value;
  const dropdown = document.getElementById('autocompleteDropdown');

  // Clear previous results
  dropdown.innerHTML = '';

  // Make a POST request to the server to fetch matching items
  try {
    const response = await fetch('/search-product', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    const filteredItems = data.products;

    // Display matching items in the dropdown
    filteredItems.forEach(item => {
      const itemElement = document.createElement('div');
      itemElement.classList.add('autocomplete-dropdown-item');
      itemElement.textContent = item.title;

      // Handle item selection
      itemElement.addEventListener('click',async () => {
      const searchName =  document.getElementById('searchInput').value = item.title;
        dropdown.innerHTML = ''; // Clear dropdown after selection
        const response = await fetch('/search-input',{
          method:"POST",
          headers:{
            "Content-type":"application/json"
          },
          body:JSON.stringify({searchName})
        })
        if (response.ok) {
          const data = await response.json();
          const productId = data.productId;
          window.location.href = `/search-result?id=${productId}`;
        }
        
        
      });

      dropdown.appendChild(itemElement);
    });

    // Show or hide the dropdown based on the search input
    dropdown.style.display = filteredItems.length > 0 ? 'block' : 'none';
  } catch (error) {
    console.error('Error:', error);
  }
}

// Close the dropdown if the user clicks outside of it
document.addEventListener('click', function (event) {
  const dropdown = document.getElementById('autocompleteDropdown');
  if (!event.target.closest('.autocomplete') && dropdown.style.display === 'block') {
    dropdown.style.display = 'none';
  }
});
