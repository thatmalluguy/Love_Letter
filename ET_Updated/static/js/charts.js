document.addEventListener('DOMContentLoaded', function() {
    initializeCharts();
});

function initializeCharts() {
    try {
        const chartDataElement = document.getElementById('chart-data');
        const monthlyChartDataElement = document.getElementById('monthly-chart-data');
        
        if (!chartDataElement || !monthlyChartDataElement) {
            console.error('Chart data elements not found');
            displayNoDataMessage();
            return;
        }

        let chartData = [];
        let monthlyChartData = [];

        try {
            chartData = JSON.parse(chartDataElement.dataset.chartData || '[]');
            monthlyChartData = JSON.parse(monthlyChartDataElement.dataset.monthlyChartData || '[]');
        } catch (e) {
            console.error('Error parsing JSON:', e);
            chartData = [];
            monthlyChartData = [];
        }

        if (!chartData.length && !monthlyChartData.length) {
            displayNoDataMessage();
            return;
        }

        // Enhanced color palette
        const colors = {
            primary: '#6366f1',
            secondary: '#64748b',
            success: '#10b981',
            warning: '#f59e0b',
            danger: '#ef4444',
            info: '#3b82f6',
            purple: '#8b5cf6',
            pink: '#ec4899',
            indigo: '#4f46e5',
            teal: '#14b8a6'
        };

        const colorPalette = [
            colors.primary,
            colors.success,
            colors.warning,
            colors.danger,
            colors.purple,
            colors.info,
            colors.pink,
            colors.indigo,
            colors.teal,
            colors.secondary
        ];

        // Common chart options with enhanced styling
        const commonOptions = {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 1000,
                easing: 'easeInOutQuart'
            },
            layout: {
                padding: {
                    top: 20,
                    right: 20,
                    bottom: 20,
                    left: 20
                }
            }
        };

        // Initialize pie chart with enhanced styling
        const pieCtx = document.getElementById('categoryPieChart');
        if (pieCtx && chartData.length > 0) {
            pieCtx.height = 300; // Set fixed height
            new Chart(pieCtx, {
                type: 'doughnut',
                data: {
                    labels: chartData.map(item => item.category),
                    datasets: [{
                        data: chartData.map(item => item.amount),
                        backgroundColor: colorPalette,
                        borderWidth: 2,
                        borderColor: '#ffffff',
                        hoverOffset: 15,
                        hoverBorderWidth: 3
                    }]
                },
                options: {
                    ...commonOptions,
                    cutout: '65%',
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: {
                                padding: 20,
                                usePointStyle: true,
                                pointStyle: 'circle',
                                font: {
                                    size: 12,
                                    family: "'Inter', sans-serif",
                                    weight: '500'
                                }
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            titleColor: '#1e293b',
                            bodyColor: '#1e293b',
                            bodyFont: {
                                size: 13,
                                family: "'Inter', sans-serif"
                            },
                            padding: 12,
                            boxWidth: 10,
                            boxHeight: 10,
                            boxPadding: 3,
                            usePointStyle: true,
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.parsed || 0;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((value * 100) / total).toFixed(1);
                                    return `${label}: Rs. ${value.toLocaleString()} (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
        }

        // Initialize bar chart with enhanced styling
        const barCtx = document.getElementById('monthlyBarChart');
        if (barCtx && monthlyChartData.length > 0) {
            barCtx.height = 300; // Set fixed height
            new Chart(barCtx, {
                type: 'bar',
                data: {
                    labels: monthlyChartData.map(item => item.month),
                    datasets: [{
                        label: 'Monthly Expenses',
                        data: monthlyChartData.map(item => item.amount),
                        backgroundColor: colors.primary,
                        borderRadius: 8,
                        borderSkipped: false,
                        barThickness: 32,
                        hoverBackgroundColor: colors.indigo
                    }]
                },
                options: {
                    ...commonOptions,
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(0, 0, 0, 0.06)',
                                drawBorder: false
                            },
                            ticks: {
                                padding: 10,
                                callback: function(value) {
                                    return 'Rs. ' + value.toLocaleString();
                                },
                                font: {
                                    size: 12,
                                    family: "'Inter', sans-serif",
                                    weight: '500'
                                },
                                color: '#64748b'
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            },
                            ticks: {
                                padding: 10,
                                font: {
                                    size: 12,
                                    family: "'Inter', sans-serif",
                                    weight: '500'
                                },
                                color: '#64748b'
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            titleColor: '#1e293b',
                            bodyColor: '#1e293b',
                            bodyFont: {
                                size: 13,
                                family: "'Inter', sans-serif"
                            },
                            padding: 12,
                            displayColors: false,
                            callbacks: {
                                title: function(items) {
                                    return items[0].label;
                                },
                                label: function(context) {
                                    return 'Rs. ' + context.parsed.y.toLocaleString();
                                }
                            }
                        }
                    }
                }
            });
        }
    } catch (error) {
        console.error('Error initializing charts:', error);
        displayNoDataMessage();
    }
}

function displayNoDataMessage() {
    const chartContainers = document.querySelectorAll('.chart-card');
    chartContainers.forEach(container => {
        const canvas = container.querySelector('canvas');
        if (canvas) {
            canvas.remove();
        }
        if (!container.querySelector('.no-data-message')) {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'no-data-message';
            messageDiv.style.cssText = `
                text-align: center;
                padding: 2rem;
                color: #64748b;
                font-family: 'Inter', sans-serif;
                font-size: 0.875rem;
                border: 2px dashed #e2e8f0;
                border-radius: 0.75rem;
                margin: 1rem;
            `;
            messageDiv.innerHTML = '<p>No data available. Add some expenses to see the charts.</p>';
            container.appendChild(messageDiv);
        }
    });
}