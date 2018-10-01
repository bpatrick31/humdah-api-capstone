//Need to clear the checked value from the loan purpose once the state changes

//Application State Variables

////************************************************************************************************************/

//Step 1: Get the users inputs

$( document ).ready(function(data) {

    let query = { 
        //enter in filter parameters
       // 'slice': '',   //name of the slice - string
        '$where': 'state_abbr = "AZ"',  //conditions to search for in the slice, in SQL WHERE style - string
        '$select': 'count(action_taken_name), sum(loan_amount_000s), loan_purpose', //fields to return, separated by commas, -string
        '$group': 'action_taken_name, loan_purpose, as_of_year', //fields to group by, summarizing the data, separated by commas - string
        '$limit': 250, //Number of records to return, 100 by default. Enter 0 for no limit - integer
        '$offset': '', //Number of records to skip
        '$orderBy': '', //Fields to order by, separated by commas. ASC and DESC can be used to modify the order - string
        '$callback': '' //Javascript callback to invoke. Only useful with JSONP requests
    
        };
    //get the result of the API
     $.ajax({
        
        // https://api.consumerfinance.gov:443/data/hmda/slice/census_tracts.json?$limit=100&$offset=0
        url: 'https://api.consumerfinance.gov:443/data/hmda/slice/hmda_lar.json',
        data: query,
        dataType: 'json',
        type: 'GET'

    }) 
  
    .done(function(hmda){
        //update and display search results if response is successful
        hmdaChartData(hmda);
        loanOriginationKPI(hmda.results);
        loansDeniedKPI (hmda.results);
        filterResults(hmda, ['2017'], ['1']);

        //update the chart
    
    })

    //handle any errors that occur
    .fail(function(jqXHR, error, errorThrown) {
        console.log(jqXHR); //data you are sending
        console.log(error); //data you are receiving
        console.log(errorThrown); //server errors
    })

});


$("#home-page-btn").on('click', function(event) {
    $('main').hide();
    $('section').show();
});  


$('.state_code').change(function () {

    $("input[name='yearsOfData']:checked").removeAttr('checked');
    $("input[name='loanPurpose']:checked").removeAttr('checked');

    $("#year2017, #home_purchase").prop('checked', true);
   
    var name = $(this).val();

    getNewStateData(name, ['2017'], ['1']);

});



$("#hmda_form").on('submit', function(event) {

            event.preventDefault();

            let years = [];
            let loanPurpose = [];
            // actionTaken = [];

            //get State
            let state = $("#state_list option:selected").val();
           
            
            //get Years of Data
            $("input[name='yearsOfData']:checked").each(function(){
                years.push($(this).val());
            })      
            
            //get Loan Purpose
            $("input[name='loanPurpose']:checked").each(function(){
                loanPurpose.push($(this).val());
            })  

            getNewStateData(state, years, loanPurpose);
           
            
    
});


/****************************     STEP 2: Make the request     ******************************* */


function getNewStateData(state, years, loanPurpose) {

        let where = 'state_abbr =' + '"' + state + '"';

        let query = { 
            //enter in filter parameters
           // 'slice': '',   //name of the slice - string
            '$where': where,   // 'state_abbr = "AZ"'
            
            //conditions to search for in the slice, in SQL WHERE style - string
            '$select': 'count(action_taken_name), sum(loan_amount_000s),loan_purpose', //fields to return, separated by commas, -string
            '$group': 'action_taken_name, loan_purpose, as_of_year', //fields to group by, summarizing the data, separated by commas - string
            '$limit': 250, //Number of records to return, 100 by default. Enter 0 for no limit - integer
            '$offset': '', //Number of records to skip
            '$orderBy': '', //Fields to order by, separated by commas. ASC and DESC can be used to modify the order - string
            '$callback': '' //Javascript callback to invoke. Only useful with JSONP requests
        
            };
    
    
        //get the result of the API
         $.ajax({
            
            // https://api.consumerfinance.gov:443/data/hmda/slice/census_tracts.json?$limit=100&$offset=0
            url: 'https://api.consumerfinance.gov:443/data/hmda/slice/hmda_lar.json',
            data: query,
            dataType: 'json',
            type: 'GET'
    
        }) 
      
        .done(function(hmda){
            //update and display search results if response is successful
            console.log(hmda);

            if (hmda.results === null || hmda.results.length === 0) {
                $('.hmda-data-container').hide();
                $(".spinner").show()
                $(".spinner-title").show().html(`<h2>The HMDA database is calculating data for ${state}</h2><p>Try a different state or click update and see if your response has loaded!</p>`)

            } else {
                $(".spinner").hide();
                $(".spinner-title").hide();
                filterResults(hmda, years, loanPurpose);
                console.log('Mortgage data on submit = ', hmda);
                $('.hmda-data-container').show();

                //Get loan data by year
                hmdaChartData(hmda)
            }
        })
    
        //handle any errors that occur
        .fail(function(jqXHR, error, errorThrown) {
            console.log(jqXHR); //data you are sending
            console.log(error); //data you are receiving
            console.log(errorThrown); //server errors
        });

}


//UPDATE THE HDMA CHART DATA BASED ON THE STATE RESPONSE

function hmdaChartData(data) {

    let purchase = {
        '2012': data.results.filter((items) => {
            return (items.action_taken_name === "Loan originated" && items.as_of_year === 2012 && items.loan_purpose === 1);
        })
        .reduce(function(prev, cur){
                return prev + cur.sum_loan_amount_000s;
                }, 0) * 1000 / (1000000000).toFixed(1),

        '2013': data.results.filter((items) => {
            return (items.action_taken_name === "Loan originated" && items.as_of_year === 2013 && items.loan_purpose === 1);
        })
        .reduce(function(prev, cur){
                return prev + cur.sum_loan_amount_000s;
                }, 0) * 1000 / (1000000000).toFixed(1),

        
        '2014': data.results.filter((items) => {
            return (items.action_taken_name === "Loan originated" && items.as_of_year === 2014 && items.loan_purpose === 1);
        })
        .reduce(function(prev, cur){
                return prev + cur.sum_loan_amount_000s;
                }, 0) * 1000 / (1000000000).toFixed(2),
        
        '2015': data.results.filter((items) => {
            return (items.action_taken_name === "Loan originated" && items.as_of_year === 2015 && items.loan_purpose === 1);
        })
        .reduce(function(prev, cur){
                return prev + cur.sum_loan_amount_000s;
                }, 0) * 1000 / (1000000000).toFixed(1),
        
        '2016': data.results.filter((items) => {
            return (items.action_taken_name === "Loan originated" && items.as_of_year === 2016 && items.loan_purpose === 1);
        })
        .reduce(function(prev, cur){
                return prev + cur.sum_loan_amount_000s;
                }, 0) * 1000 / (1000000000).toFixed(1),

        '2017': data.results.filter((items) => {
            return (items.action_taken_name === "Loan originated" && items.as_of_year === 2017 && items.loan_purpose === 1);
        })
        .reduce(function(prev, cur){
                return prev + cur.sum_loan_amount_000s;
                }, 0)*(1000/1000000000)

    }



    let refinance = {
        '2012': data.results.filter((items) => {
            return (items.action_taken_name === "Loan originated" && items.as_of_year === 2012 && items.loan_purpose === 3);
        })
        .reduce(function(prev, cur){
                return prev + cur.sum_loan_amount_000s;
                }, 0) * 1000 / (1000000000).toFixed(1),

        '2013': data.results.filter((items) => {
            return (items.action_taken_name === "Loan originated" && items.as_of_year === 2013 && items.loan_purpose === 3);
        })
        .reduce(function(prev, cur){
                return prev + cur.sum_loan_amount_000s;
                }, 0) * 1000 / (1000000000).toFixed(1),

        
        '2014': data.results.filter((items) => {
            return (items.action_taken_name === "Loan originated" && items.as_of_year === 2014 && items.loan_purpose === 3);
        })
        .reduce(function(prev, cur){
                return prev + cur.sum_loan_amount_000s;
                }, 0) * 1000 / (1000000000).toFixed(2),
        
        '2015': data.results.filter((items) => {
            return (items.action_taken_name === "Loan originated" && items.as_of_year === 2015 && items.loan_purpose === 3);
        })
        .reduce(function(prev, cur){
                return prev + cur.sum_loan_amount_000s;
                }, 0) * 1000 / (1000000000).toFixed(1),
        
        '2016': data.results.filter((items) => {
            return (items.action_taken_name === "Loan originated" && items.as_of_year === 2016 && items.loan_purpose === 3);
        })
        .reduce(function(prev, cur){
                return prev + cur.sum_loan_amount_000s;
                }, 0) * 1000 / (1000000000).toFixed(1),

        '2017': data.results.filter((items) => {
            return (items.action_taken_name === "Loan originated" && items.as_of_year === 2017 && items.loan_purpose === 3);
        })
        .reduce(function(prev, cur){
                return prev + cur.sum_loan_amount_000s;
                }, 0)*(1000/1000000000)
    

            }


    
    let improvement = {
        '2012': data.results.filter((items) => {
            return (items.action_taken_name === "Loan originated" && items.as_of_year === 2012 && items.loan_purpose === 2);
        })
        .reduce(function(prev, cur){
                return prev + cur.sum_loan_amount_000s;
                }, 0) * 1000 / (1000000000).toFixed(1),

        '2013': data.results.filter((items) => {
            return (items.action_taken_name === "Loan originated" && items.as_of_year === 2013 && items.loan_purpose === 2);
        })
        .reduce(function(prev, cur){
                return prev + cur.sum_loan_amount_000s;
                }, 0) * 1000 / (1000000000).toFixed(1),

        
        '2014': data.results.filter((items) => {
            return (items.action_taken_name === "Loan originated" && items.as_of_year === 2014 && items.loan_purpose === 2);
        })
        .reduce(function(prev, cur){
                return prev + cur.sum_loan_amount_000s;
                }, 0) * 1000 / (1000000000).toFixed(2),
        
        '2015': data.results.filter((items) => {
            return (items.action_taken_name === "Loan originated" && items.as_of_year === 2015 && items.loan_purpose === 2);
        })
        .reduce(function(prev, cur){
                return prev + cur.sum_loan_amount_000s;
                }, 0) * 1000 / (1000000000).toFixed(1),
        
        '2016': data.results.filter((items) => {
            return (items.action_taken_name === "Loan originated" && items.as_of_year === 2016 && items.loan_purpose === 2);
        })
        .reduce(function(prev, cur){
                return prev + cur.sum_loan_amount_000s;
                }, 0) * 1000 / (1000000000).toFixed(1),

        '2017': data.results.filter((items) => {
            return (items.action_taken_name === "Loan originated" && items.as_of_year === 2017 && items.loan_purpose === 2);
        })
        .reduce(function(prev, cur){
                return prev + cur.sum_loan_amount_000s;
                }, 0)*(1000/1000000000)
    

        }
        
    chart(purchase, refinance, improvement);
    loanGrowthKPI (purchase);

}


// FILTER THE FORM SUBMISSION AND RETURN A REDUCED VALUE

function filterResults(mortgageData, years, loanPurpose) {

  
    let filteredArray = mortgageData.results.filter((item) => {
        
        let filteredYears = years.includes(item.as_of_year.toString());
        let filteredPurpose = loanPurpose.includes(item.loan_purpose.toString());      
        return (filteredPurpose && filteredYears);


    });
          console.log('Filtered array = ', filteredArray); 

          loanOriginationKPI(filteredArray);
          loansDeniedKPI(filteredArray);
          percentDeniedKPI(filteredArray);
          purchasePercentKPI(filteredArray);
          
          
}
    
//2. GET THE INSIGHT VALUES ****************************


function loanOriginationKPI(array) {
    
    //Get the loan Value
    var loanOriginationValue = array.filter((items) => {
        return items.action_taken_name === "Loan originated";
    })
    .reduce(function(prev, cur){
            return prev + cur.sum_loan_amount_000s;
            }, 0);
            

    //Get the loan count
    var loanOriginationCount = array.filter((items) => {
        return items.action_taken_name === "Loan originated";
    })
    .reduce(function(prev, cur){

            return prev + cur.count_action_taken_name;
            }, 0);
         
    

    //Get the average loan value 
    var averageLoanValue = Math.round((
        (loanOriginationValue * 1000) / loanOriginationCount)/1000).toFixed(1);
     
    updateOriginationKPIs(loanOriginationValue, loanOriginationCount, averageLoanValue);

   

}


//*******************LOANS DENIED KPI ************************ */



function loansDeniedKPI (array) {

    var loanDeniedValue = array
    .filter((items) => {
        return items.action_taken_name === "Preapproval request denied by financial institution", "File closed for incompleteness";
    })
    .reduce(function(prev, cur){
            return prev + cur.sum_loan_amount_000s;       
            }, 0);
   


    var loanDeniedCount = array
    .filter((items) => {
        return items.action_taken_name === "Preapproval request denied by financial institution", "File closed for incompleteness";
    })
    .reduce(function(prev, cur){
            return prev + cur.count_action_taken_name;
            }, 0);
       

    var loanWithdrawn = array
    .filter((items) => {
        return items.action_taken_name === "Application withdrawn by applicant";
    })
    .reduce(function(prev, cur){
        return prev + cur.sum_loan_amount_000s; 
        }, 0);
   

    updateDeniedKPIs(loanDeniedValue, loanDeniedCount, loanWithdrawn);
   

}


//*******************LOANS DENIED KPI ************************ */

function percentDeniedKPI (array) {

    
    //Percent Denied KPI
    
    let originated = array.filter((items) => {
        return items.action_taken_name === "Loan originated";
    })
    .reduce(function(prev, cur){
            return prev + cur.sum_loan_amount_000s;
            }, 0);
           

    let denied = array
    .filter((items) => {
        return items.action_taken_name === "Preapproval request denied by financial institution", "File closed for incompleteness";
    })
    .reduce(function(prev, cur){
            return prev + cur.sum_loan_amount_000s;       
            }, 0);
    
    
    let percentDenied = ((denied / (originated + denied)) * 100).toFixed(1);
       

    $('#percent_denied').text((percentDenied) + '%');

}


//*******************LOAN GROWTH KPI ************************ */

function loanGrowthKPI (purchase) {

    let growth = ((((purchase["2017"] - purchase["2012"]) / purchase["2012"])*100)).toFixed(1);

    $('#loan_growth').text((growth) + '%');
}


//******************* Percent of Purchase Loans ************************ */

function purchasePercentKPI (array) {

    let purchase = array.filter((items) => {
        return items.action_taken_name === "Loan originated" && items.loan_purpose === 1;
    })
    .reduce(function(prev, cur){
            return prev + cur.sum_loan_amount_000s;
            }, 0);

    let refinance = array.filter((items) => {
        return items.action_taken_name === "Loan originated" && items.loan_purpose === 3;
    })
    .reduce(function(prev, cur){
            return prev + cur.sum_loan_amount_000s;
            }, 0);
    
    let improvement = array.filter((items) => {
        return items.action_taken_name === "Loan originated" && items.loan_purpose === 2;
    })
    .reduce(function(prev, cur){
            return prev + cur.sum_loan_amount_000s;
            }, 0);
    
    
    let purchasePercent = ((purchase / (purchase + refinance + improvement)) * 100).toFixed(1);
        
            

    $('#purchase_percent').text((purchasePercent) + '%');

}


//3. Update the User Interface

function updateOriginationKPIs (value, count, avgValue) {

    $('#originated_value').text('$' + ((((value * 1000) / 1000000000)).toFixed(1)) + 'B' );
    $('#originated_count').text((count / 1000).toFixed(1) + 'k');
    $('#avg_loan_value').text((avgValue) + 'k');

    
}

function updateDeniedKPIs (value, count, withdrawn) {

    $('#denied_value').text('$' + ((((value * 1000) / 1000000000)).toFixed(1)) + 'B' );
    $('#denied_count').text((count / 1000).toFixed(1) + 'k');
    $('#loan_withdrawn').text('$' + ((((withdrawn * 1000) / 1000000000)).toFixed(1)) + 'B' );
     
}






// ********************************** HICHARTS DATA ******************************* 

function chart (purchase, refinance, improvement) { 

   

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
            plotBands: [{ // visualize the weekend
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
            name: 'Purchase',
            data: [purchase["2012"], purchase["2013"], purchase["2014"], purchase["2015"], purchase["2016"], purchase["2017"]]
        }, {
            name: 'Refinance',
            data: [refinance["2012"], refinance["2013"], refinance["2014"], refinance["2015"], refinance["2016"], refinance["2017"]]
        },
        {
            name: 'Improvement',
            data: [improvement["2012"], improvement["2013"], improvement["2014"], improvement["2015"], improvement["2016"], improvement["2017"]]
        }
        
    ]
    })
    
    };



/*****************************************     STEP 3     ******************************* */

//Step 3: Get the results and display them in the browser






//Load all functions

function watchsubmit () {

    getFilters();

}
(watchsubmit);
