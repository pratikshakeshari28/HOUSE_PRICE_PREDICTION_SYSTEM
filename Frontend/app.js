const API_BASE = "http://127.0.0.1:5000/api";

async function loadOptions() {
    try {
        const response = await fetch(`${API_BASE}/options`);
        const options = await response.json();

        populateDropdown('location', options.locations);
        populateDropdown('condition', options.conditions);
        populateDropdown('garage', options.garages);
    } catch (error) {
        console.error("Failed to load backend options:", error);
    }
}

function populateDropdown(elementId, items) {
    const select = document.getElementById(elementId);
    select.innerHTML = items.map(item => `<option value="${item}">${item}</option>`).join('');
}

document.getElementById('predictForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
        Area: document.getElementById('area').value,
        Bedrooms: document.getElementById('bedrooms').value,
        Bathrooms: document.getElementById('bathrooms').value,
        Floors: document.getElementById('floors').value,
        YearBuilt: document.getElementById('year_built').value,
        Location: document.getElementById('location').value,
        Condition: document.getElementById('condition').value,
        Garage: document.getElementById('garage').value
    };

    const resultDiv = document.getElementById('result');
    
    
    resultDiv.innerText = "Calculating price...";
    resultDiv.style.display = 'block';

    try {
        const response = await fetch(`${API_BASE}/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        
        
        resultDiv.innerText = `Estimated Price: $${data.price.toLocaleString()}`;
    } catch (error) {
        
        resultDiv.innerText = "Error getting prediction!";
        console.error("Prediction Error:", error);
    }
});

loadOptions();