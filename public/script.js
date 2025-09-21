// script.js
const countrySelect = document.getElementById('countrySelect');
const casesEl = document.getElementById('cases');
const recoveredEl = document.getElementById('recovered');
const deathsEl = document.getElementById('deaths');
const ctx = document.getElementById('covidChart').getContext('2d');

let covidChart; // Chart.js instance

// Populate countries dropdown
async function populateCountries() {
  try {
    const res = await fetch('https://disease.sh/v3/covid-19/countries');
    const countries = await res.json();

    // Add a "Global" option at the top
    const globalOption = document.createElement('option');
    globalOption.value = 'global';
    globalOption.textContent = 'Global';
    countrySelect.appendChild(globalOption);

    countries.forEach(country => {
      const option = document.createElement('option');
      option.value = country.country;
      option.textContent = country.country;
      countrySelect.appendChild(option);
    });
  } catch (error) {
    console.error('Error fetching countries:', error);
  }
}

// Fetch COVID data for selected country or global
async function fetchCovidData(country = 'global') {
  let url = 'https://disease.sh/v3/covid-19/all';
  if (country !== 'global') {
    url = `https://disease.sh/v3/covid-19/countries/${encodeURIComponent(country)}`;
  }

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Network response was not ok');
    const data = await res.json();

    // Update stats
    casesEl.textContent = data.cases.toLocaleString();
    recoveredEl.textContent = data.recovered.toLocaleString();
    deathsEl.textContent = data.deaths.toLocaleString();

    // Update chart
    updateChart(data);
  } catch (error) {
    console.error('Error fetching COVID data:', error);
    casesEl.textContent = 'N/A';
    recoveredEl.textContent = 'N/A';
    deathsEl.textContent = 'N/A';
  }
}

// Initialize or update Chart.js bar chart
function updateChart(data) {
  const chartData = {
    labels: ['Confirmed', 'Recovered', 'Deaths'],
    datasets: [{
      label: 'COVID-19 Cases',
      data: [data.cases, data.recovered, data.deaths],
      backgroundColor: ['#e0876a', '#4caf50', '#f44336']
    }]
  };

  const config = {
    type: 'bar',
    data: chartData,
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return value.toLocaleString();
            }
          }
        }
      }
    }
  };

  if (covidChart) {
    covidChart.data = chartData;
    covidChart.update();
  } else {
    covidChart = new Chart(ctx, config);
  }
}

// Listen to dropdown changes
countrySelect.addEventListener('change', (e) => {
  fetchCovidData(e.target.value);
});

// Initial load
populateCountries().then(() => fetchCovidData());

// Refresh data every 10 minutes
setInterval(() => {
  fetchCovidData(countrySelect.value);
}, 10 * 60 * 1000);
