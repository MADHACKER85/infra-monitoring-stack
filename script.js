// -------------------------------------------------------------
// Interactive Dashboard Simulation logic
// Controls Chart.js rendering and load simulation events
// -------------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
    // Simulated Variables
    let isStressed = false;
    let baseUptimeSeconds = 932; // starts at 15m 32s
    let alertCount = 0;
    
    // HTML Elements
    const uptimeValueEl = document.getElementById("uptime-value");
    const alertsCountValueEl = document.getElementById("alerts-count-value");
    const alertFeedEl = document.getElementById("alert-feed");
    const alertCpuValueEl = document.getElementById("alert-cpu-value");
    
    const btnStressOn = document.getElementById("btn-stress-on");
    const btnStressOff = document.getElementById("btn-stress-off");

    // Tab Navigation Elements
    const navOverview = document.getElementById("nav-overview");
    const navPrometheus = document.getElementById("nav-prometheus");
    const navAlertmanager = document.getElementById("nav-alertmanager");

    const overviewTab = document.getElementById("overview-tab");
    const prometheusTab = document.getElementById("prometheus-tab");
    const alertmanagerTab = document.getElementById("alertmanager-tab");

    const navItems = [navOverview, navPrometheus, navAlertmanager];
    const tabs = [overviewTab, prometheusTab, alertmanagerTab];

    // Prometheus Mock Elements
    const promCpuStateBadge = document.getElementById("prom-cpu-state-badge");
    const promCpuFiringList = document.getElementById("prom-cpu-firing-list");
    const promCpuValue = document.getElementById("prom-cpu-value");

    // Alertmanager Mock Elements
    const amGroupCount = document.getElementById("am-group-count");
    const amEmptyState = document.getElementById("am-empty-state");
    const amAlertsGrid = document.getElementById("am-alerts-grid");
    const amCpuValueDisplay = document.getElementById("am-cpu-value-display");

    // Tab switching handler
    function switchTab(targetId) {
        navItems.forEach(item => {
            if (item) item.classList.remove("active");
        });
        
        tabs.forEach(tab => {
            if (tab) {
                tab.style.display = "none";
                tab.classList.remove("active");
            }
        });

        if (targetId === "overview") {
            if (navOverview) navOverview.classList.add("active");
            if (overviewTab) {
                overviewTab.style.display = "block";
                overviewTab.classList.add("active");
            }
        } else if (targetId === "prometheus") {
            if (navPrometheus) navPrometheus.classList.add("active");
            if (prometheusTab) {
                prometheusTab.style.display = "block";
                prometheusTab.classList.add("active");
            }
        } else if (targetId === "alertmanager") {
            if (navAlertmanager) navAlertmanager.classList.add("active");
            if (alertmanagerTab) {
                alertmanagerTab.style.display = "block";
                alertmanagerTab.classList.add("active");
            }
        }
    }

    if (navOverview) {
        navOverview.addEventListener("click", (e) => {
            e.preventDefault();
            switchTab("overview");
        });
    }
    if (navPrometheus) {
        navPrometheus.addEventListener("click", (e) => {
            e.preventDefault();
            switchTab("prometheus");
        });
    }
    if (navAlertmanager) {
        navAlertmanager.addEventListener("click", (e) => {
            e.preventDefault();
            switchTab("alertmanager");
        });
    }

    // Initialize Chart.js default colors
    Chart.defaults.color = '#8e9aae';
    Chart.defaults.borderColor = '#2c323d';

    // Helper to generate time labels for the last 10 ticks
    const getInitialTimeLabels = () => {
        const labels = [];
        const now = new Date();
        for (let i = 9; i >= 0; i--) {
            const time = new Date(now.getTime() - i * 5000);
            labels.push(time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        }
        return labels;
    };

    // Helper to generate initial random metrics
    const getInitialMetricData = (min, max, count = 10) => {
        const data = [];
        for (let i = 0; i < count; i++) {
            data.push(Math.random() * (max - min) + min);
        }
        return data;
    };

    // 1. CPU Chart Setup
    const cpuCtx = document.getElementById('cpuChart').getContext('2d');
    const cpuChart = new Chart(cpuCtx, {
        type: 'line',
        data: {
            labels: getInitialTimeLabels(),
            datasets: [{
                label: 'CPU Utilization (%)',
                data: getInitialMetricData(2, 6, 10),
                borderColor: '#f8961e',
                backgroundColor: 'rgba(248, 150, 30, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.3,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { min: 0, max: 100 }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });

    // 2. Memory Chart Setup
    const memCtx = document.getElementById('memoryChart').getContext('2d');
    const memoryChart = new Chart(memCtx, {
        type: 'line',
        data: {
            labels: getInitialTimeLabels(),
            datasets: [{
                label: 'Memory Utilization (%)',
                data: getInitialMetricData(42, 45, 10),
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.3,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { min: 0, max: 100 }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });

    // 3. Network Chart Setup
    const netCtx = document.getElementById('networkChart').getContext('2d');
    const networkChart = new Chart(netCtx, {
        type: 'line',
        data: {
            labels: getInitialTimeLabels(),
            datasets: [
                {
                    label: 'Rx (Received) KB/s',
                    data: getInitialMetricData(120, 250, 10),
                    borderColor: '#2ecc71',
                    borderWidth: 2,
                    tension: 0.3,
                    pointRadius: 0
                },
                {
                    label: 'Tx (Transmitted) KB/s',
                    data: getInitialMetricData(40, 90, 10),
                    borderColor: '#9b59b6',
                    borderWidth: 2,
                    tension: 0.3,
                    pointRadius: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { min: 0 }
            }
        }
    });

    // Live Data Loop
    setInterval(() => {
        // Increment Uptime counter
        baseUptimeSeconds++;
        const days = Math.floor(baseUptimeSeconds / (3600 * 24));
        const hours = Math.floor((baseUptimeSeconds % (3600 * 24)) / 3600);
        const minutes = Math.floor((baseUptimeSeconds % 3600) / 60);
        const seconds = baseUptimeSeconds % 60;
        uptimeValueEl.innerText = `${days}d ${hours}h ${minutes}m ${seconds}s`;

        // Generate new time label
        const newTimeLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        // Calculate next values based on state (normal vs stress)
        let nextCpuVal;
        let nextMemVal;
        
        if (isStressed) {
            nextCpuVal = Math.random() * (95 - 82) + 82; // 82-95% under stress
            nextMemVal = Math.random() * (48 - 45) + 45; // memory creeps up slightly
            
            // Update alert card text
            if (alertCpuValueEl) alertCpuValueEl.innerText = nextCpuVal.toFixed(2);
            if (promCpuValue) promCpuValue.innerText = nextCpuVal.toFixed(2);
            if (amCpuValueDisplay) amCpuValueDisplay.innerText = nextCpuVal.toFixed(2);
        } else {
            nextCpuVal = Math.random() * (6 - 2) + 2;   // 2-6% normal
            nextMemVal = Math.random() * (44 - 42) + 42; // stable memory
        }

        const nextNetRx = Math.random() * (300 - 100) + 100;
        const nextNetTx = Math.random() * (100 - 30) + 30;

        // Update Charts
        // CPU
        cpuChart.data.labels.push(newTimeLabel);
        cpuChart.data.labels.shift();
        cpuChart.data.datasets[0].data.push(nextCpuVal);
        cpuChart.data.datasets[0].data.shift();
        cpuChart.update();

        // Memory
        memoryChart.data.labels.push(newTimeLabel);
        memoryChart.data.labels.shift();
        memoryChart.data.datasets[0].data.push(nextMemVal);
        memoryChart.data.datasets[0].data.shift();
        memoryChart.update();

        // Network
        networkChart.data.labels.push(newTimeLabel);
        networkChart.data.labels.shift();
        networkChart.data.datasets[0].data.push(nextNetRx);
        networkChart.data.datasets[0].data.shift();
        networkChart.data.datasets[1].data.push(nextNetTx);
        networkChart.data.datasets[1].data.shift();
        networkChart.update();

    }, 2000); // Scrapes and updates graphs every 2 seconds

    // Simulation Trigger Listeners
    btnStressOn.addEventListener("click", () => {
        isStressed = true;
        alertCount = 1;
        
        // UI Updates - Overview Tab
        alertsCountValueEl.innerText = alertCount;
        alertsCountValueEl.classList.remove("text-green");
        alertsCountValueEl.classList.add("text-red");
        
        alertFeedEl.style.display = "block";

        // UI Updates - Prometheus Tab
        if (promCpuStateBadge) {
            promCpuStateBadge.innerText = "firing";
            promCpuStateBadge.classList.remove("inactive");
            promCpuStateBadge.classList.add("firing");
        }
        if (promCpuFiringList) {
            promCpuFiringList.style.display = "block";
        }

        // UI Updates - Alertmanager Tab
        if (amGroupCount) {
            amGroupCount.innerText = "1 active alert";
        }
        if (amEmptyState) {
            amEmptyState.style.display = "none";
        }
        if (amAlertsGrid) {
            amAlertsGrid.style.display = "grid";
        }
        
        btnStressOn.disabled = true;
        btnStressOff.disabled = false;
    });

    btnStressOff.addEventListener("click", () => {
        isStressed = false;
        alertCount = 0;
        
        // UI Updates - Overview Tab
        alertsCountValueEl.innerText = alertCount;
        alertsCountValueEl.classList.remove("text-red");
        alertsCountValueEl.classList.add("text-green");
        
        alertFeedEl.style.display = "none";

        // UI Updates - Prometheus Tab
        if (promCpuStateBadge) {
            promCpuStateBadge.innerText = "inactive";
            promCpuStateBadge.classList.remove("firing");
            promCpuStateBadge.classList.add("inactive");
        }
        if (promCpuFiringList) {
            promCpuFiringList.style.display = "none";
        }

        // UI Updates - Alertmanager Tab
        if (amGroupCount) {
            amGroupCount.innerText = "0 active alerts";
        }
        if (amEmptyState) {
            amEmptyState.style.display = "flex";
        }
        if (amAlertsGrid) {
            amAlertsGrid.style.display = "none";
        }
        
        btnStressOn.disabled = false;
        btnStressOff.disabled = true;
    });
});
