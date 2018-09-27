//Application State Variables

var mortgageData = {};
let filteredArray = []; //if blank, need to add more data
let years = []; //if blank add years of data
let loanPurpose = [];
let state = ""; 


////************************************************************************************************************/

//Step 1: Get the users inputs
$("#hmda_form").on('submit', function(event) {

            event.preventDefault();

            years = [];
            loanPurpose = [];
            // actionTaken = [];

            //get State
            state = $("#state_list option:selected").val();
           
            
            //get Years of Data
            $("input[name='yearsOfData']:checked").each(function(){
                years.push($(this).val());
            })      
            
            //get Loan Purpose
            $("input[name='loanPurpose']:checked").each(function(){
                loanPurpose.push($(this).val());
            })  

             //get Action Taken
            //  $("input[name='actionTaken']:checked").each(function(){
            //     actionTaken.push($(this).val());
            // })  
                      

            console.log('Selected state = ', state);
            console.log('Years of data = ', years);
            console.log('Loan purpose = ', loanPurpose);
            // console.log('Action taken = ', actionTaken);
            
            filterResults(mortgageData, years, loanPurpose);

            getNewStateData(state);
           
    
});

//Listen for the state selection to call the API again
$('.state_code').change(function (state) {

    $("input[name='yearsOfData']:checked").removeAttr('checked');
    $("input[name='loanPurpose']:checked").removeAttr('checked');
   
    var name = $(this).val();
    var check = $(this).attr('selected');

    getNewStateData(state);
    
    console.log("Change: ", name, check);


});


/****************************     STEP 2: Make the request     ******************************* */
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
        console.log(hmda);
        mortgageData = hmda;
        
    })

    //handle any errors that occur
    .fail(function(jqXHR, error, errorThrown) {
        console.log(jqXHR); //data you are sending
        console.log(error); //data you are receiving
        console.log(errorThrown); //server errors
    })



});


function getNewStateData(state) {

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
            mortgageData = hmda;
            
        })
    
        //handle any errors that occur
        .fail(function(jqXHR, error, errorThrown) {
            console.log(jqXHR); //data you are sending
            console.log(error); //data you are receiving
            console.log(errorThrown); //server errors
        });

}





function filterResults(mortgageData, years, loanPurpose) {

    //1. Filter array results based on the selected filters (years, purpose, state, action taken)

    var filteredArray = mortgageData.results
    
    .filter((item) => {
        return (years.includes(item.as_of_year.toString())) &&
               (loanPurpose.includes(item.loan_purpose.toString())) 
    });
          console.log('Filtered array = ', filteredArray); 

          loanOriginationKPI(filteredArray)
          loansDeniedKPI(filteredArray);
          
          
}

//2. GET THE INSIGHT VALUES ****************************


function loanOriginationKPI(array) {
    
    //Get the loan Value
    var loanOriginationValue = array
    .filter((items) => {
        return items.action_taken_name === "Loan originated";
    })
    .reduce(function(prev, cur){
            return prev + cur.sum_loan_amount_000s;
            }, 0);
            console.log('Loan Origination Value = ', (((loanOriginationValue * 1000) / 1000000000)).toFixed(1));

    //Get the loan count
    var loanOriginationCount = array

    .filter((items) => {
        return items.action_taken_name === "Loan originated";
    })
    .reduce(function(prev, cur){

            return prev + cur.count_action_taken_name;
            }, 0);
            console.log('Loan Origination Count = ', (((loanOriginationCount) / 1000)).toFixed(1));
    

    //Get the average loan value 
    var averageLoanValue = Math.round((
        (loanOriginationValue * 1000) / loanOriginationCount)/1000).toFixed(1);
        console.log('Average Loan Value = ', averageLoanValue)

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
    console.log('Loan Denied Value = ', (((loanDeniedValue * 1000) / 1000000000)).toFixed(1));


    var loanDeniedCount = array
    .filter((items) => {
        return items.action_taken_name === "Preapproval request denied by financial institution", "File closed for incompleteness";
    })
    .reduce(function(prev, cur){
            return prev + cur.count_action_taken_name;
            }, 0);
            console.log('Loan Origination Count = ', (((loanDeniedCount) / 1000)).toFixed(1));


    var loanWithdrawn = array
    .filter((items) => {
        return items.action_taken_name === "Application withdrawn by applicant";
    })
    .reduce(function(prev, cur){
        return prev + cur.sum_loan_amount_000s; 
        }, 0);
    console.log('Value Withdrawn = ', (((loanWithdrawn * 1000) / 1000000000)).toFixed(1));


    updateDeniedKPIs(loanDeniedValue, loanDeniedCount, loanWithdrawn);

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


$(function () { 

    Highcharts.chart({
        chart: {
            renderTo: 'container',
            type: 'areaspline'
            
        },
        title: {
            text: '5 Year Loan Trend by State ($)'
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
                '2012',
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
                text: 'Amount'
            }
        },
        tooltip: {
            shared: true,
            valueSuffix: ' million'
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
            data: [11, 27, 31, 22, 30]
        }, {
            name: 'Denied',
            data: [14, 22, 33, 45, 36]
        }]
    })
    
    });



/*****************************************     STEP 3     ******************************* */

//Step 3: Get the results and display them in the browser






//Load all functions

function watchsubmit () {

    getFilters();

}
(watchsubmit);