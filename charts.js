$(function () { 

Highcharts.chart({
    chart: {
        renderTo: 'container',
        type: 'areaspline'
        
    },
    title: {
        text: 'Total Loans Originated by Year'
    },
    legend: {
        layout: 'vertical',
        align: 'left',
        verticalAlign: 'top',
        x: 150,
        y: 100,
        floating: true,
        borderWidth: 1,
        backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
    },
    xAxis: {
        categories: [
            '2013',
            '2014',
            '2015',
            '2016',
            '2017',
            '2018'
            
        ],
        plotBands: [{ // visualize the weekend
            from: 4.5,
            to: 6.5,
            color: 'rgba(68, 170, 213, .2)'
        }]
    },
    yAxis: {
        title: {
            text: 'Amount'
        }
    },
    tooltip: {
        shared: true,
        valueSuffix: ' units'
    },
    credits: {
        enabled: false
    },
    plotOptions: {
        areaspline: {
            fillOpacity: 0.5
        }
    },
    series: [{
        name: 'Approved',
        data: [3, 4, 3, 5, 4, 15]
    }, {
        name: 'Denied',
        data: [1, 3, 4, 3, 3, 5]
    }]
})

});