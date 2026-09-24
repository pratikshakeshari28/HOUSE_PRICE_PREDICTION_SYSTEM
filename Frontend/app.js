// app.js

// Use the API URL defined in config.js with a fallback to local host
const API_BASE = (typeof CONFIG !== 'undefined' && CONFIG.API_BASE) 
    ? CONFIG.API_BASE 
    : "http://127.0.0.1:5000/api";

async function loadOptions() {
    try {
        const response = await fetch(`${API_BASE}/options`);
        
        if (!response.ok) {
            throw new Error(`Server returned status: ${response.status}`);
        }

        const options = await response.json();

        populateDropdown('location', options.locations, 'Select Location');
        populateDropdown('condition', options.conditions, 'Select Condition');
        populateDropdown('garage', options.garages, 'Select Garage');
    } catch (error) {
        console.error("Failed to load backend options:", error);
    }
}

function populateDropdown(elementId, items, placeholder) {
    const select = document.getElementById(elementId);
    if (!select || !Array.isArray(items)) return;

    select.innerHTML = ''; // Clear existing options
    
    // Add default placeholder option
    const defaultOption = new Option(placeholder, "");
    select.add(defaultOption);

    // Safely add items without risk of HTML injection or broken quotes
    items.forEach(item => {
        select.add(new Option(item, item));
    });
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

        if (!response.ok) {
            throw new Error(`Server error (${response.status})`);
        }

        const data = await response.json();
        
        if (data.price !== undefined) {
            resultDiv.innerText = `Estimated Price: $${data.price.toLocaleString()}`;
        } else {
            resultDiv.innerText = "Unable to compute price prediction.";
        }
    } catch (error) {
        resultDiv.innerText = "Error getting prediction!";
        console.error("Prediction Error:", error);
    }
});

// Initial launch call
loadOptions();