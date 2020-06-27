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
const getOldestReview = user => {
    const { reviews } = user.userData;

    if (reviews.length > 1) {
        const sortedReviews = reviews.sort((a, b) => (new Date(a.date)).getTime() - (new Date(b.date)).getTime());
        return sortedReviews[0];
    }

    return reviews[0];
};

const renderRateStats = (data, selector) => {
    const averageRate = Math.round(data.reduce((total, entry) => total += entry.grade, 0) / data.length * 100) / 100;
    const entryCount = data.length;
    document.querySelector(selector).innerHTML = `<span class="rate-stat">${averageRate}</span> / <span class="count-stat">${entryCount} rates</span>`;
}
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
const renderProportionOfNewRates = (data, selector) => {
    let stats = {
        singleAccounts: {
            count: 0,
            rateSum: 0
        },
        newAccounts: {
            count: 0,
            rateSum: 0
        },
        oldAccounts: {
            count: 0,
            rateSum: 0
        }
    };

    for (let entry of data) {
        if (entry.userData.totalReviews <= 1 && entry.userData.totalRatings <= 1) {
            stats.singleAccounts.count++;
            stats.singleAccounts.rateSum += entry.grade;
        } else {
            const oldestRating = getOldestReview(entry);

            if ((new Date(oldestRating.date)).getTime() < (new Date('Jun 19, 2020')).getTime()) {
                stats.oldAccounts.count++;
                stats.oldAccounts.rateSum += entry.grade;
            } else {
                stats.newAccounts.count++;
                stats.newAccounts.rateSum += entry.grade;
            }
        }
    }

    const singleAverageRate = Math.round(stats.singleAccounts.rateSum / stats.singleAccounts.count * 100) / 100;
    const newAverageRate = Math.round(stats.newAccounts.rateSum / stats.newAccounts.count * 100) / 100;
    const oldAverageRate = Math.round(stats.oldAccounts.rateSum / stats.oldAccounts.count * 100) / 100;

    const keys = [`Single Voters (1 rating/review at all)`, `New Voters (more than 1 rating, but after release)`, `Old Voters (more than 1 rating, including before release)`];
    let columns = [[keys[0], stats.singleAccounts.count], [keys[1], stats.newAccounts.count], [keys[2], stats.oldAccounts.count]];

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
const renderRatesDistributionPerDate = (data, selector) => {
    let chartData = {};

    for (let entry of data) {
        if (typeof chartData[entry.date] === 'undefined') {
            chartData[entry.date] = {
                count: 0,
                rateSum: 0
            };
        }

        chartData[entry.date].count++;
        chartData[entry.date].rateSum += entry.grade;
    }

    let keys = ['Rate'];
    let columns = [['Rate']];
    let xAxisLabels = [];
    let dates = Object.keys(chartData).sort((a, b) => (new Date(a)).getTime() - (new Date(b)).getTime());

    for (let date of dates) {
        const avgRate = Math.round(chartData[date].rateSum / chartData[date].count * 100) / 100;
        xAxisLabels.push(date);
        columns[0].push(avgRate);
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

    renderRateStats(data, '#stat1');
    renderRatesDistributionChart(data, '#chart1');
    renderRatesDistributionChart(data.filter(entry => entry.date === 'Jun 19, 2020'), '#chart2');
    renderRatesDistributionByEdgeValues(data, '#chart3');
    renderRatesDistributionByEdgeValues(data.filter(entry => entry.date === 'Jun 19, 2020'), '#chart4');
    renderProportionOfNewRates(data, '#chart5')
    renderApprovalRateDistribution(data.filter(entry => entry.approvalRate), '#chart6');
    renderRatesDistributionPerDate(data, '#chart7')
    renderStatisticsByKeywords(data, ['garbage', 'Druckmann', 'SJW', 'gay', 'lesbian', 'gameplay', 'masterpiece'], '#chart8');
};
