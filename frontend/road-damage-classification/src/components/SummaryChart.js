import React from 'react';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

const SummaryChart = ({ summary }) => {
    const data = {
        labels: ['Very Poor', 'Poor', 'Satisfactory', 'Good'],
        datasets: [
            {
                label: 'Damage Severity (%)',
                data: [
                    summary['very poor'] || 0,
                    summary['poor'] || 0,
                    summary['satisfactory'] || 0,
                    summary['good'] || 0,
                ],
                backgroundColor: ['#FF6384', '#FF9F40', '#FFCD56', '#36A2EB'],
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { display: true, position: 'top' },
        },
        scales: {
            y: { beginAtZero: true, max: 100 },
        },
    };

    return (
        <div className="chart-container">
            <h3>Damage Severity Overview</h3>
            <Bar data={data} options={options} />
        </div>
    );
};

export default SummaryChart;
