//Step 1: Get the users inputs
$(document).ready(function (data) {
    let query = {
        //conditions to search for in the slice, in SQL WHERE style - string
        '$where': 'state_abbr = "AZ"',
        //fields to return, separated by commas, -string
        '$select': 'count(action_taken_name), sum(loan_amount_000s), loan_purpose',
        //fields to group by, summarizing the data, separated by commas - string
        '$group': 'action_taken_name, loan_purpose, as_of_year',
        //Number of records to return, 100 by default. Enter 0 for no limit - integer
        '$limit': 250,
        //Number of records to skip
        '$offset': '',
        //Fields to order by, separated by commas. ASC and DESC can be used to modify the order - string
        '$orderBy': '',
        //Javascript callback to invoke. Only useful with JSONP requests
        '$callback': ''
    };

    //get the result of the API
    $.ajax({
            // https://api.consumerfinance.gov:443/data/hmda/slice/census_tracts.json?$limit=100&$offset=0
            url: 'https://api.consumerfinance.gov:443/data/hmda/slice/hmda_lar.json',
            data: query,
            dataType: 'json',
            type: 'GET'
        })
        //grab the response from the API
        .done(function (hmda) {
            //update the chart data with the initial request
            hmdaChartData(hmda);
            //update the KPI's with the initial response
            loanOriginationKPI(hmda.results);
            loansDeniedKPI(hmda.results);
            filterResults(hmda, ['2017'], ['1']);
        })
        //handle any errors that occur
        .fail(function (jqXHR, error, errorThrown) {
            //data you are sending
            console.log(jqXHR);
            //data you are receiving
            console.log(error);
            //server errors
            console.log(errorThrown);
        })
});


// Hide the landing page and show the data response after data loads
$("#home-page-btn").on('click', function (event) {
    //hides the main welcome message and button
    $('main').hide();
    //shows the filters and insights
    $('section').show();
});


//Listen for the user to select a new state and then request new data
$('.state_code').change(function () {
    //Remove the previously checked values when the user picks a new state
    $("input[name='yearsOfData'], input[name='loanPurpose']").removeAttr('checked');
    //assign a default value for home purchase to be flagged as true and the year to be 2017
    $("#year2017, #home_purchase").prop('checked', true);
    //store the selected value as the new name
    var name = $(this).val();
    //pass the information into the new API request to update the state
    getNewStateData(name, ['2017'], ['1']);
});


//Event listener for the filter form
$("#hmda_form").on('submit', function (event) {
    event.preventDefault();

    let years = []; //array of the selected filter years
    let loanPurpose = []; //array of the loan purposes selected by the user

    //get State value
    let state = $("#state_list option:selected").val();

    //get Years of Data
    $("input[name='yearsOfData']:checked").each(function () {
        years.push($(this).val());
    })

    //get Loan Purpose
    $("input[name='loanPurpose']:checked").each(function () {
        loanPurpose.push($(this).val());
    })

    //pass the selected values in a new API request
    getNewStateData(state, years, loanPurpose);
});


/****************************     STEP 2: Make the request     ******************************* */

//Call the HMDA API with the new state variable
function getNewStateData(state, years, loanPurpose) {

    let where = 'state_abbr =' + '"' + state + '"';

    let query = {
        //conditions to search for in the slice, in SQL WHERE style - string 
        '$where': where,
        //fields to return, separated by commas, -string
        '$select': 'count(action_taken_name), sum(loan_amount_000s),loan_purpose',
        //fields to group by, summarizing the data, separated by commas - string
        '$group': 'action_taken_name, loan_purpose, as_of_year',
        //Number of records to return, 100 by default. Enter 0 for no limit - integer
        '$limit': 250,
        //Number of records to skip
        '$offset': '',
        //Fields to order by, separated by commas. ASC and DESC can be used to modify the order - string
        '$orderBy': '',
        //Javascript callback to invoke. Only useful with JSONP request 
        '$callback': ''
    };

    //get the result of the API
    $.ajax({
            url: 'https://api.consumerfinance.gov:443/data/hmda/slice/hmda_lar.json',
            data: query,
            dataType: 'json',
            type: 'GET'
        })
        .done(function (hmda) {
            //Check if the hmda data processed the information, if its null their database is still calculating
            if (hmda.results === null || hmda.results.length === 0) {
                //hide the KPIs and chart
                $('.hmda-data-container').hide();
                //add a description above the spinner
                $(".spinner-title").show().html(`<h2>The HMDA database is calculating data for ${state}</h2><p>Try a different state or click update and see if your response has loaded!</p>`)
                //show a spinner for the data calculating
                $(".spinner").show()
            } else {
                //hide the spinner if results exist
                $(".spinner").hide();
                //hide the description if results exist
                $(".spinner-title").hide();
                //filter the results with a new request
                filterResults(hmda, years, loanPurpose);
                //show the KPI and data charts
                $('.hmda-data-container').show();

                //pass the results into the Highcharts chart
                hmdaChartData(hmda);
            }
        })
        //handle any errors that occur
        .fail(function (jqXHR, error, errorThrown) {
            //data you are sending
            console.log(jqXHR);
            //data you are receiving
            console.log(error);
            //server errors
            console.log(errorThrown);
        });

}


//UPDATE THE HDMA CHART DATA BASED ON THE STATE RESPONSE

function hmdaChartData(data) {

    //Calculate the home purchase values for the selected state by filtering on the action taken and then reducing the values for the particular year
    let purchase = {
        '2012': data.results.filter((items) => {
                return (items.action_taken_name === "Loan originated" && items.as_of_year === 2012 && items.loan_purpose === 1);
            })
            .reduce(function (prev, cur) {
                return prev + cur.sum_loan_amount_000s;
            }, 0) * 1000 / (1000000000),

        '2013': data.results.filter((items) => {
                return (items.action_taken_name === "Loan originated" && items.as_of_year === 2013 && items.loan_purpose === 1);
            })
            .reduce(function (prev, cur) {
                return prev + cur.sum_loan_amount_000s;
            }, 0) * 1000 / (1000000000),


        '2014': data.results.filter((items) => {
                return (items.action_taken_name === "Loan originated" && items.as_of_year === 2014 && items.loan_purpose === 1);
            })
            .reduce(function (prev, cur) {
                return prev + cur.sum_loan_amount_000s;
            }, 0) * 1000 / (1000000000),

        '2015': data.results.filter((items) => {
                return (items.action_taken_name === "Loan originated" && items.as_of_year === 2015 && items.loan_purpose === 1);
            })
            .reduce(function (prev, cur) {
                return prev + cur.sum_loan_amount_000s;
            }, 0) * 1000 / (1000000000),

        '2016': data.results.filter((items) => {
                return (items.action_taken_name === "Loan originated" && items.as_of_year === 2016 && items.loan_purpose === 1);
            })
            .reduce(function (prev, cur) {
                return prev + cur.sum_loan_amount_000s;
            }, 0) * 1000 / (1000000000),

        '2017': data.results.filter((items) => {
                return (items.action_taken_name === "Loan originated" && items.as_of_year === 2017 && items.loan_purpose === 1);
            })
            .reduce(function (prev, cur) {
                return prev + cur.sum_loan_amount_000s;
            }, 0) * (1000 / 1000000000)

    }


    //Calculate the refinance value for each year and selected state
    let refinance = {
        '2012': data.results.filter((items) => {
                return (items.action_taken_name === "Loan originated" && items.as_of_year === 2012 && items.loan_purpose === 3);
            })
            .reduce(function (prev, cur) {
                return prev + cur.sum_loan_amount_000s;
            }, 0) * 1000 / (1000000000),

        '2013': data.results.filter((items) => {
                return (items.action_taken_name === "Loan originated" && items.as_of_year === 2013 && items.loan_purpose === 3);
            })
            .reduce(function (prev, cur) {
                return prev + cur.sum_loan_amount_000s;
            }, 0) * 1000 / (1000000000),

        '2014': data.results.filter((items) => {
                return (items.action_taken_name === "Loan originated" && items.as_of_year === 2014 && items.loan_purpose === 3);
            })
            .reduce(function (prev, cur) {
                return prev + cur.sum_loan_amount_000s;
            }, 0) * 1000 / (1000000000),

        '2015': data.results.filter((items) => {
                return (items.action_taken_name === "Loan originated" && items.as_of_year === 2015 && items.loan_purpose === 3);
            })
            .reduce(function (prev, cur) {
                return prev + cur.sum_loan_amount_000s;
            }, 0) * 1000 / (1000000000),

        '2016': data.results.filter((items) => {
                return (items.action_taken_name === "Loan originated" && items.as_of_year === 2016 && items.loan_purpose === 3);
            })
            .reduce(function (prev, cur) {
                return prev + cur.sum_loan_amount_000s;
            }, 0) * 1000 / (1000000000),

        '2017': data.results.filter((items) => {
                return (items.action_taken_name === "Loan originated" && items.as_of_year === 2017 && items.loan_purpose === 3);
            })
            .reduce(function (prev, cur) {
                return prev + cur.sum_loan_amount_000s;
            }, 0) * (1000 / 1000000000)
    }


    //Calculate the improvement value for each year and selected state
    let improvement = {
        '2012': data.results.filter((items) => {
                return (items.action_taken_name === "Loan originated" && items.as_of_year === 2012 && items.loan_purpose === 2);
            })
            .reduce(function (prev, cur) {
                return prev + cur.sum_loan_amount_000s;
            }, 0) * 1000 / (1000000000),

        '2013': data.results.filter((items) => {
                return (items.action_taken_name === "Loan originated" && items.as_of_year === 2013 && items.loan_purpose === 2);
            })
            .reduce(function (prev, cur) {
                return prev + cur.sum_loan_amount_000s;
            }, 0) * 1000 / (1000000000),


        '2014': data.results.filter((items) => {
                return (items.action_taken_name === "Loan originated" && items.as_of_year === 2014 && items.loan_purpose === 2);
            })
            .reduce(function (prev, cur) {
                return prev + cur.sum_loan_amount_000s;
            }, 0) * 1000 / (1000000000),

        '2015': data.results.filter((items) => {
                return (items.action_taken_name === "Loan originated" && items.as_of_year === 2015 && items.loan_purpose === 2);
            })
            .reduce(function (prev, cur) {
                return prev + cur.sum_loan_amount_000s;
            }, 0) * 1000 / (1000000000),

        '2016': data.results.filter((items) => {
                return (items.action_taken_name === "Loan originated" && items.as_of_year === 2016 && items.loan_purpose === 2);
            })
            .reduce(function (prev, cur) {
                return prev + cur.sum_loan_amount_000s;
            }, 0) * 1000 / (1000000000),

        '2017': data.results.filter((items) => {
                return (items.action_taken_name === "Loan originated" && items.as_of_year === 2017 && items.loan_purpose === 2);
            })
            .reduce(function (prev, cur) {
                return prev + cur.sum_loan_amount_000s;
            }, 0) * (1000 / 1000000000)


    }
    //Pass the values into the highcarts chart
    chart(purchase, refinance, improvement);
    //update the loan growth KPI for years 2012 - 2017
    loanGrowthKPI(purchase);

}


// FILTER THE FORM SUBMISSION AND RETURN A REDUCED VALUE

function filterResults(mortgageData, years, loanPurpose) {
    
    //create a new array from the API results based on the selected form values
    let filteredArray = mortgageData.results.filter((item) => {
        //Check for the years selected and then convert the year to a string
        let filteredYears = years.includes(item.as_of_year.toString());
        //Filter for the loan purpose
        let filteredPurpose = loanPurpose.includes(item.loan_purpose.toString());
        return (filteredPurpose && filteredYears);

    });

    //update all the KPI values that require the filtered array
    loanOriginationKPI(filteredArray);
    loansDeniedKPI(filteredArray);
    percentDeniedKPI(filteredArray);
    purchasePercentKPI(filteredArray);

}

//Update the Loan Origination KPI
function loanOriginationKPI(array) {

    //Get the loan Value
    var loanOriginationValue = array.filter((items) => {
            return items.action_taken_name === "Loan originated";
        })
        .reduce(function (prev, cur) {
            return prev + cur.sum_loan_amount_000s;
        }, 0);


    //Get the loan count
    var loanOriginationCount = array.filter((items) => {
            return items.action_taken_name === "Loan originated";
        })
        .reduce(function (prev, cur) {
            return prev + cur.count_action_taken_name;
        }, 0);


    //Get the average loan value 
    var averageLoanValue = Math.round((
        (loanOriginationValue * 1000) / loanOriginationCount) / 1000).toFixed(1);

    //update the origination KPI's
    updateOriginationKPIs(loanOriginationValue, loanOriginationCount, averageLoanValue);
}


//Update the Loans Denied KPI
function loansDeniedKPI(array) {
    
    let loanDeniedValue = array
        .filter((items) => {
            return items.action_taken_name === "Preapproval request denied by financial institution", "File closed for incompleteness";
        })
        .reduce(function (prev, cur) {
            return prev + cur.sum_loan_amount_000s;
        }, 0);

    let loanDeniedCount = array
        .filter((items) => {
            return items.action_taken_name === "Preapproval request denied by financial institution", "File closed for incompleteness";
        })
        .reduce(function (prev, cur) {
            return prev + cur.count_action_taken_name;
        }, 0);

    let loanWithdrawn = array
        .filter((items) => {
            return items.action_taken_name === "Application withdrawn by applicant";
        })
        .reduce(function (prev, cur) {
            return prev + cur.sum_loan_amount_000s;
        }, 0);


    updateDeniedKPIs(loanDeniedValue, loanDeniedCount, loanWithdrawn);


}


//Caclulate the percent denied KPI
function percentDeniedKPI(array) {

    let originated = array.filter((items) => {
            return items.action_taken_name === "Loan originated";
        })
        .reduce(function (prev, cur) {
            return prev + cur.sum_loan_amount_000s;
        }, 0);

    let denied = array
        .filter((items) => {
            return items.action_taken_name === "Preapproval request denied by financial institution", "File closed for incompleteness";
        })
        .reduce(function (prev, cur) {
            return prev + cur.sum_loan_amount_000s;
        }, 0);

    let percentDenied = ((denied / (originated + denied)) * 100).toFixed(1);

    $('#percent_denied').text((percentDenied) + '%');

}


//Update the Loans Denied KPI
function loanGrowthKPI(purchase) {

    let growth = ((((purchase["2017"] - purchase["2012"]) / purchase["2012"]) * 100)).toFixed(1);

    $('#loan_growth').text((growth) + '%');
}


//Update the Purchase Percent KPI
function purchasePercentKPI(array) {

    let purchase = array.filter((items) => {
            return items.action_taken_name === "Loan originated" && items.loan_purpose === 1;
        })
        .reduce(function (prev, cur) {
            return prev + cur.sum_loan_amount_000s;
        }, 0);

    let refinance = array.filter((items) => {
            return items.action_taken_name === "Loan originated" && items.loan_purpose === 3;
        })
        .reduce(function (prev, cur) {
            return prev + cur.sum_loan_amount_000s;
        }, 0);

    let improvement = array.filter((items) => {
            return items.action_taken_name === "Loan originated" && items.loan_purpose === 2;
        })
        .reduce(function (prev, cur) {
            return prev + cur.sum_loan_amount_000s;
        }, 0);

    let purchasePercent = ((purchase / (purchase + refinance + improvement)) * 100).toFixed(1);

    $('#purchase_percent').text((purchasePercent) + '%');

}


//Update the DOM with the new Origination KPI values
function updateOriginationKPIs(value, count, avgValue) {

    $('#originated_value').text('$' + ((((value * 1000) / 1000000000)).toFixed(1)) + 'B');
    $('#originated_count').text((count / 1000).toFixed(1) + 'k');
    $('#avg_loan_value').text((avgValue) + 'k');
}


//Update the DOM with the new values
function updateDeniedKPIs(value, count, withdrawn) {

    $('#denied_value').text('$' + ((((value * 1000) / 1000000000)).toFixed(1)) + 'B');
    $('#denied_count').text((count / 1000).toFixed(1) + 'k');
    $('#loan_withdrawn').text('$' + ((((withdrawn * 1000) / 1000000000)).toFixed(1)) + 'B');

}


/********************************** HICHARTS DATA *******************************/
function chart(purchase, refinance, improvement) {

    Highcharts.chart({
        chart: {
            renderTo: 'container',
            type: 'areaspline'
        },
        title: {
            text: '5 Year Loan Trend by State ($Billions)'
        },
        legend: {
            layout: 'vertical',
            align: 'left',
            verticalAlign: 'top',
            x: 150,
            y: 50,
            floating: true,
            borderWidth: 1,
            backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
        },
        xAxis: {
            categories: [
                '2012',
                '2013',
                '2014',
                '2015',
                '2016',
                '2017'
            ],
            plotBands: [{
                from: 4.5,
                to: 6.5,
                color: 'rgba(68, 170, 213, .2)'
            }]
        },
        yAxis: {
            title: {
                text: 'Amount in Billions'
            }
        },
        tooltip: {
            shared: true,
            valueSuffix: ' billion'
        },
        credits: {
            enabled: false
        },
        plotOptions: {
            areaspline: {
                fillOpacity: 0.5
            }
        },
        series: [
            {
                //Update the highcharts data with the new purchase values
                name: 'Purchase',
                data: [purchase["2012"], purchase["2013"], purchase["2014"], purchase["2015"], purchase["2016"], purchase["2017"]]
        }, {
                //Update the refinance data series with the new values
                name: 'Refinance',
                data: [refinance["2012"], refinance["2013"], refinance["2014"], refinance["2015"], refinance["2016"], refinance["2017"]]
        },
            {
                //Update the improvement data series with the new values
                name: 'Improvement',
                data: [improvement["2012"], improvement["2013"], improvement["2014"], improvement["2015"], improvement["2016"], improvement["2017"]]
        }

    ]
    })

};
