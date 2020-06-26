const colorPattern = ['#001f3f', '#0074D9', '#7FDBFF', '#39cccc', '#3D9970', '#2ECC40', '#01FF70', '#FFDC00', '#FF851B', '#FF4136', '#85144b'];
const transformKeysToColorPalette = keys => {
    let index = 0;
    let colors = {};

    for (let key of keys) {
        colors[key] = colorPattern[index];
        index++;
    }

    return colors;
};

const renderRatesDistributionChart = (data, selector) => {
    let chartData = {};
    let totalNumberOfEntries = 0;
    for (let entry of data) {
        if (typeof chartData[entry.grade] === 'undefined') {
            chartData[entry.grade] = 0;
        }

        chartData[entry.grade]++;
        totalNumberOfEntries++;
    }

    let keys = [];
    let columns = [];
    for (let key in chartData) {
        const fullKey = `${key} (${Math.round(chartData[key] / totalNumberOfEntries * 10000) / 100}%)`;
        columns.push([fullKey, chartData[key]]);
        keys.push(fullKey);
    }

    c3.generate({
        bindto: selector,
        data: {
            columns,
            type: 'pie',
            colors: transformKeysToColorPalette(keys)
        },
        legend: {
            position: 'right'
        }
    });
};
const renderRatesDistributionByEdgeValues = (data, selector) => {
    let chartData = {
        'Low (0-1)': 0,
        'Medium (2-8)': 0,
        'High (9-10)': 0
    };
    let totalNumberOfEntries = 0;
    for (let entry of data) {
        if (entry.grade <= 1) {
            chartData['Low (0-1)']++;
        } else if (entry.grade >= 9) {
            chartData['Medium (2-8)']++;
        } else {
            chartData['High (9-10)']++;
        }
        totalNumberOfEntries++;
    }

    let keys = [];
    let columns = [];
    for (let key in chartData) {
        const fullKey = `${key} - ${Math.round(chartData[key] / totalNumberOfEntries * 10000) / 100}%`;
        columns.push([fullKey, chartData[key]]);
        keys.push(fullKey);
    }

    c3.generate({
        bindto: selector,
        data: {
            columns,
            type: 'pie',
            colors: transformKeysToColorPalette(keys)
        },
        legend: {
            position: 'right'
        }
    });
};
const renderApprovalRateDistribution = (data, selector) => {
    let chartData = {};

    for (let entry of data) {
        if (typeof chartData[entry.grade] === 'undefined') {
            chartData[entry.grade] = {
                count: 0,
                approvalSum: 0
            };
        }

        chartData[entry.grade].count++;
        chartData[entry.grade].approvalSum += entry.approvalRate;
    }

    let keys = ['Approval Rate %'];
    let columns = [['Approval Rate %']];
    for (let key in chartData) {
        columns[0].push(Math.round(chartData[key].approvalSum / chartData[key].count * 10000) / 100);
    }

    c3.generate({
        bindto: selector,
        data: {
            columns,
            type: 'bar',
            colors: transformKeysToColorPalette(keys)
        }
    });
};
const renderStatisticsByKeywords = (data, words, selector) => {
    let chartData = {};

    for (let entry of data) {
        for (let word of words) {
            if (entry.text.toLowerCase().indexOf(word.toLowerCase()) > -1) {
                if (typeof chartData[word] === 'undefined') {
                    chartData[word] = {
                        count: 0,
                        rateSum: 0
                    };
                }

                chartData[word].count++;
                chartData[word].rateSum += entry.grade;
            }
        }
    }

    let keys = ['Count'];
    let columns = [['Count']];
    let xAxisLabels = [];
    for (let word of words) {
        columns[0].push(chartData[word].count);
        xAxisLabels.push(`${word} (avg. rate: ${Math.round(chartData[word].rateSum / chartData[word].count * 100) / 100})`);
    }

    c3.generate({
        bindto: selector,
        data: {
            x: 'x',
            columns: [['x', ...xAxisLabels], ...columns],
            type: 'bar',
            colors: transformKeysToColorPalette(keys)
        },
        axis: {
            x: {
                type: 'category'
            }
        }
    });
};

window.onload = async () => {
    let data = await fetch('/data/index.json');
    data = await data.json();

    renderRatesDistributionChart(data, '#chart1');
    renderRatesDistributionChart(data.filter(entry => entry.date === 'Jun 19, 2020'), '#chart2');
    renderRatesDistributionByEdgeValues(data, '#chart3');
    renderRatesDistributionByEdgeValues(data.filter(entry => entry.date === 'Jun 19, 2020'), '#chart4');
    renderApprovalRateDistribution(data.filter(entry => entry.approvalRate), '#chart5');
    renderStatisticsByKeywords(data, ['garbage', 'Druckmann', 'SJW', 'gay', 'lesbian', 'gameplay', 'masterpiece'], '#chart6');
};