document.getElementById('searchBtn').addEventListener('click', async () => {
    const term = document.getElementById('searchTerm').value;

    if (!term) {
        alert("Please enter a search term.");
        return;
    }

    try {
        const res = await fetch(`http://localhost:3000/products?term=${encodeURIComponent(term)}`);
        const data = await res.json();

        const resultsList = document.getElementById('results');

        //clear old search results
        resultsList.innerHTML = '';

        if (data.data && data.data.length > 0) {
            data.data.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item.description || "No description";
                resultsList.appendChild(li);
            });
        } else {
            resultsList.textContent = '<li>No results found.</li>';
        }

    } catch (error) {
        console.error('Fetch error:', error);
        alert('Failed to fetch products. Check console for details.');
    }
});