// $(function () { 

// Highcharts.chart({
//     chart: {
//         renderTo: 'container',
//         type: 'areaspline'
        
//     },
//     title: {
//         text: '5 Year Loan Trend by State ($)'
//     },
//     legend: {
//         layout: 'vertical',
//         align: 'left',
//         verticalAlign: 'top',
//         x: 150,
//         y: 100,
//         floating: true,
//         borderWidth: 1,
//         backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
//     },
//     xAxis: {
//         categories: [
//             '2012',
//             '2014',
//             '2015',
//             '2016',
//             '2017'
       
            
//         ],
//         plotBands: [{ // visualize the weekend
//             from: 4.5,
//             to: 6.5,
//             color: 'rgba(68, 170, 213, .2)'
//         }]
//     },
//     yAxis: {
//         title: {
//             text: 'Amount'
//         }
//     },
//     tooltip: {
//         shared: true,
//         valueSuffix: ' million'
//     },
//     credits: {
//         enabled: false
//     },
//     plotOptions: {
//         areaspline: {
//             fillOpacity: 0.5
//         }
//     },
//     series: [{
//         name: 'Approved',
//         data: [11, 27, 31, 22, 30]
//     }, {
//         name: 'Denied',
//         data: [14, 22, 33, 45, 36]
//     }]
// })

// });