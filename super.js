document.addEventListener('DOMContentLoaded', function() {
    const cryptoBoxes = document.querySelectorAll('.cryptoBox');

    function checkVisibility() {
        cryptoBoxes.forEach(box => {
            const boxTop = box.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;

            if (boxTop < windowHeight) {
                box.classList.add('show');
            } else {
                box.classList.remove('show');
            }
        });
    }

    window.addEventListener('scroll', checkVisibility);
    window.addEventListener('resize', checkVisibility);

    // Check visibility on page load
    checkVisibility();

    // Fetch exchange rates and historical data for each cryptocurrency
    const cryptocurrencies = ['bitcoin', 'ethereum', 'litecoin', 'ripple', 'stellar', 'bitcoin-cash'];
    cryptocurrencies.forEach(crypto => {
        fetchExchangeRates(crypto);
        fetchHistoricalData(crypto, '1year'); // Fetch historical data for 1 year by default
    });

    function fetchExchangeRates(crypto) {
        fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${crypto}&vs_currencies=inr,usd`)
        .then(response => response.json())
        .then(data => {
            const inrValue = data[crypto].inr;
            const usdValue = data[crypto].usd;
            const cryptoBox = document.getElementById(crypto);
            const inrElement = cryptoBox.querySelector('.inrValue');
            const usdElement = cryptoBox.querySelector('.usdValue');
            inrElement.textContent = `INR: ${inrValue.toFixed(2)}`;
            usdElement.textContent = `USD: ${usdValue.toFixed(2)}`;
        })
        .catch(error => console.error('Error fetching exchange rates:', error));
    }

    function fetchHistoricalData(crypto, period) {
        const currentDate = new Date();
        const endDate = currentDate.toISOString().split('T')[0];
        let startDate;

        switch (period) {
            case '1year':
                startDate = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), currentDate.getDate());
                break;
            case '10months':
                startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 10, currentDate.getDate());
                break;
            case '6months':
                startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 6, currentDate.getDate());
                break;
            case '1month':
                startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, currentDate.getDate());
                break;
            case 'present':
                startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
                break;
            default:
                startDate = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), currentDate.getDate());
                break;
        }

        const startDateString = startDate.toISOString().split('T')[0];

        const apiUrl = `https://api.coingecko.com/api/v3/coins/${crypto}/market_chart/range?vs_currency=usd&from=${startDateString}&to=${endDate}`;

        fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const prices = data.prices.map(price => price[1]);
            const labels = data.prices.map(price => new Date(price[0]).toLocaleDateString('en-US'));
            renderGraph(prices, labels, crypto);
        })
        .catch(error => console.error('Error fetching historical data:', error));
    }

    function renderGraph(prices, labels, crypto) {
        const ctx = document.getElementById(`${crypto}Chart`).getContext('2d');
        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: `${crypto.toUpperCase()} Exchange Rate`,
                    data: prices,
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Time'
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Exchange Rate'
                        }
                    }
                }
            }
        });
    }
});