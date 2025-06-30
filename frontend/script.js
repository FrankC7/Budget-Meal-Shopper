const searchBtn = document.getElementById('searchBtn');
const searchTerm = document.getElementById('searchTerm');
const resultsList = document.getElementById('results');

searchBtn.addEventListener('click', async () => {
    //gets what the user inputed in the text box
    const term = searchTerm.value.trim();

    if (!term) {
        alert("Please enter a search term.");
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/products?term=${encodeURIComponent(term)}`);
        const data = await response.json();

        const resultsList = document.getElementById('results');

        //clear old search results
        resultsList.innerHTML = '';

        if (data.data && data.data.length > 0) {

            data.data.forEach((item) => {
                const card = document.createElement('div');
                card.className = 'product_card';
                card.textContent = item.description;

                card.innerHTML = `
                <img src="${item.image || 'https://dummyimage.com/200x200/cccccc/000000&text=No+Image'}"}" />
                <div class="info">
                    <div class="product_name">${item.description || 'Unnamed Product'}</div>
                    <div class="product_price">${typeof item.price === 'number' ? `$${item.price.toFixed(2)}` : 'Price Unavailable'}</div>
                    
                </div>
            `;

            resultsList.appendChild(card);
            });
            
        } else {
            resultsList.textContent = '<li>No results found.</li>';
        }

    } catch (error) {
        console.error('Fetch error:', error);
        alert('Failed to fetch products.');
    }
});