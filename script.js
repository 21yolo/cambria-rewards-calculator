document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const coinsHeldInput = document.getElementById('coins-held');
    const trinketsInput = document.getElementById('trinkets');
    const customMarketCapToggle = document.getElementById('custom-mcap-toggle');
    const customMarketCapInput = document.getElementById('custom-mcap-input');
    const customMarketCapValueInput = document.getElementById('custom-mcap');
    const calculateBtn = document.getElementById('calculate-btn');
    const resultsCard = document.getElementById('results-card');
    
    // Result elements
    const coinRewardUsd = document.getElementById('coin-reward-usd');
    const cashoutWarning = document.getElementById('cashout-warning');
    const trinketLabel = document.getElementById('trinket-label');
    const trinketAmount = document.getElementById('trinket-amount');
    const tokenRewardUsd = document.getElementById('token-reward-usd');
    const totalRewardUsd = document.getElementById('total-reward-usd');
    const totalNote = document.getElementById('total-note');
    
    // Stats display elements
    const prizePooEl = document.getElementById('prize-pool');
    const coinsCirculationEl = document.getElementById('coins-circulation');
    const defaultMcapEl = document.getElementById('default-mcap');
    const lastUpdatedEl = document.getElementById('last-updated');
    
    // Initialize values from config
    function initializeFromConfig() {
        // Format numbers with commas
        prizePooEl.textContent = `$${CONFIG.totalPrizePoolUSD.toLocaleString()}`;
        coinsCirculationEl.textContent = CONFIG.totalCoinsInCirculation.toLocaleString();
        defaultMcapEl.textContent = `$${CONFIG.defaultMarketCap.toLocaleString()}`;
        
        // Set the last updated timestamp from config
        lastUpdatedEl.textContent = CONFIG.lastUpdated;
    }
    
    // Toggle custom market cap input
    function toggleCustomMarketCap() {
        if (customMarketCapToggle.checked) {
            customMarketCapInput.classList.remove('hidden');
        } else {
            customMarketCapInput.classList.add('hidden');
        }
    }
    
    // Calculate rewards based on inputs
    function calculateRewards() {
        // Get input values - only accept explicitly entered values
        const userCoinsNum = coinsHeldInput.value.trim() === '' ? 0 : parseFloat(coinsHeldInput.value) || 0;
        const userTrinketsNum = trinketsInput.value.trim() === '' ? 0 : parseFloat(trinketsInput.value) || 0;
        
        // Validate inputs
        if (userCoinsNum < 0 || userTrinketsNum < 0) {
            alert("Please enter positive values only.");
            return;
        }
        
        if (userCoinsNum === 0 && userTrinketsNum === 0) {
            alert("Please enter at least one value (Coins Held or Trinkets).");
            return;
        }
        
        // Get config values
        const { totalPrizePoolUSD, totalCoinsInCirculation, totalTokenSupply, defaultMarketCap } = CONFIG;
        
        // In-game purchase pool calculation (90% to coin holders)
        const coinPoolRewardUSD = (userCoinsNum / totalCoinsInCirculation) * (totalPrizePoolUSD * 0.9);
        
        // Token rewards calculation
        const marketCap = customMarketCapToggle.checked ? 
            (parseFloat(customMarketCapValueInput.value) || defaultMarketCap) : 
            defaultMarketCap;
        
        const tokenValue = marketCap / totalTokenSupply;
        
        // Only use direct trinket input, no estimation - use exactly 0 if field is empty
        const hasExplicitTrinkets = trinketsInput.value.trim() !== '';
        const tokenRewardUSD = hasExplicitTrinkets ? (userTrinketsNum * tokenValue) : 0;
        
        // Check if eligible for cashout (>= $10)
        const isCashoutEligible = coinPoolRewardUSD >= 10;
        
        // Calculate total (excluding coin rewards if below $10 threshold)
        const totalRewardUSD = (isCashoutEligible ? coinPoolRewardUSD : 0) + tokenRewardUSD;
        
        // Update results display
        updateResults({
            coinPoolRewardUSD,
            trinkets: hasExplicitTrinkets ? userTrinketsNum : 0,
            tokenRewardUSD,
            totalRewardUSD,
            isCashoutEligible,
            hasExplicitTrinkets
        });
        
        // Show results card
        resultsCard.classList.remove('hidden');
    }
    
    // Update results display
    function updateResults(results) {
        // Update coin pool reward
        coinRewardUsd.textContent = `${results.coinPoolRewardUSD.toFixed(2)}`;
        
        // Show/hide cashout warning
        if (!results.isCashoutEligible) {
            cashoutWarning.classList.remove('hidden');
            totalNote.classList.remove('hidden');
        } else {
            cashoutWarning.classList.add('hidden');
            totalNote.classList.add('hidden');
        }
        
        // Update trinket display
        trinketLabel.textContent = 'Trinkets:';
        trinketAmount.textContent = results.trinkets.toLocaleString(undefined, {maximumFractionDigits: 0});
        
        // Update token reward
        tokenRewardUsd.textContent = `${results.tokenRewardUSD.toFixed(2)}`;
        
        // Update total reward
        totalRewardUsd.textContent = `${results.totalRewardUSD.toFixed(2)}`;
    }
    
    // Input validation for numbers
    function setupInputValidation() {
        const numberInputs = [coinsHeldInput, trinketsInput, customMarketCapValueInput];
        
        numberInputs.forEach(input => {
            if (!input) return; // Skip if element doesn't exist
            
            // Add input event listener to validate as user types
            input.addEventListener('input', function(e) {
                // Replace commas with periods for decimal handling
                if (this.value.includes(',')) {
                    this.value = this.value.replace(',', '.');
                }
                
                // Parse as float to handle decimals properly
                const value = parseFloat(this.value);
                
                // Check if negative and correct
                if (value < 0) {
                    this.value = "0";
                }
            });
        });
    }
    
    // Initialize the app
    function init() {
        // Initialize values from config
        initializeFromConfig();
        
        // Set up event listeners
        customMarketCapToggle.addEventListener('change', toggleCustomMarketCap);
        calculateBtn.addEventListener('click', calculateRewards);
        
        // Set up input validation
        setupInputValidation();
    }
    
    // Start the app
    init();
});