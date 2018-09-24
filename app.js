//QUESTIONS


//2. Need to get the state request to be the first thing the user does, if they want to search a new state they have to start the process over
//3. Need to finish the total hicharts example

//Application State Variables

var mortgageData = {};
let filteredArray = []; //if blank, need to add more data
let years = []; //if blank add years of data
let loanPurpose = []; 
// let actionTaken = [];

////************************************************************************/


////************************************************************************************************************/

//Step 1: Get the users inputs
$("#hmda_form").on('submit', function(event) {

            event.preventDefault();

            years = [];
            loanPurpose = [];
            // actionTaken = [];

            //get State
            var state = $("#state_list option:selected").val();
            
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
           
    
});

//Listen for the state selection to call the API again
$('.state_code').change(function () {
   
    //Clear out the years
        //remove the selected class
        //clear all children with a selected class
    //Clear out the purpose
   




    // var name = $(this).val();
    // var check = $(this).attr('checked');
    // console.log("Change: " + name + " to " + check);
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


function filterResults(mortgageData, years, loanPurpose) {

    //1. Filter array results based on the selected filters (years, purpose, state, action taken)

    var filteredArray = mortgageData.results
    
    .filter((item) => {
        return (years.includes(item.as_of_year.toString())) &&
               (loanPurpose.includes(item.loan_purpose.toString())) //&&       
            //    (actionTaken.includes(item.action_taken_name))
        
    });
          console.log('Filtered array = ', filteredArray); 

          loanOriginationKPI(filteredArray);
          
          
}

//2. GET THE INSIGHT VALUES

function loanOriginationKPI(array) {
    
    var loanOriginationValue = array
    
    .filter((items) => {
        return items.action_taken_name === "Loan originated";
    })

    .reduce(function(prev, cur){

            return prev + cur.sum_loan_amount_000s;
        
            }, 0);

            console.log('Loan Origination Value = ', (((loanOriginationValue * 1000) / 1000000000)).toFixed(1));

    //GET THE LOAN COUNT
    var loanOriginationCount = array

    .filter((items) => {
        return items.action_taken_name === "Loan originated";
    })

    .reduce(function(prev, cur){

            return prev + cur.count_action_taken_name;
        
            }, 0);

            console.log('Loan Origination Count = ', (((loanOriginationCount) / 1000)).toFixed(1));


    
    var averageLoanValue = Math.round((
        (loanOriginationValue * 1000) / loanOriginationCount)/1000).toFixed(1);
        console.log('Average Loan Value = ', averageLoanValue)

        
    updateKPIs(loanOriginationValue, loanOriginationCount, averageLoanValue);

}



//3. Update the User Interface

function updateKPIs (value, count, avgValue) {

    $('#originated_value').text('$' + ((((value * 1000) / 1000000000)).toFixed(1)) + 'B' );
    $('#originated_count').text((count / 1000).toFixed(1) + 'k');
    $('#avg_loan_value').text((avgValue) + 'k');

    
}




// var insight = [
    
    //     {'2015': {
    //         purchase: {
    //             amount: {
    //                 totalAmount: 0,
    //                 originated: 0,
    //                 denied: 0,
    //                 incomplete: 0,
    //                 notAccepted: 0,
    //                 purchasedByBank: 0
    //             },
    //             count: {
    //                 totalCount: 0,
    //                 originated: 0,
    //                 denied: 0,
    //                 incomplete: 0,
    //                 notAccepted: 0,
    //                 purchasedByBank: 0
    //             },
    //         },
    //         refinance: {
    //             amount: {
    //                 totalAmount: 0,
    //                 originated: 0,
    //                 denied: 0,
    //                 incomplete: 0,
    //                 notAccepted: 0,
    //                 purchasedByBank: 0
    //             },
    //             count: {
    //                 totalCount: 0,
    //                 originated: 0,
    //                 denied: 0,
    //                 incomplete: 0,
    //                 notAccepted: 0,
    //                 purchasedByBank: 0
    //             },
    //         },
    
    //         improvement: {
    //             amount: {
    //                 totalAmount: 0,
    //                 originated: 0,
    //                 denied: 0,
    //                 incomplete: 0,
    //                 notAccepted: 0,
    //                 purchasedByBank: 0
    //             },
    //             count: {
    //                 totalCount: 0,
    //                 originated: 0,
    //                 denied: 0,
    //                 incomplete: 0,
    //                 notAccepted: 0,
    //                 purchasedByBank: 0
    //             },
    //         }
    
    
    //         }   
    //     },
       
    // ];




   //GET TOTAL LOAN VALUE
//    var totalLoanAmount = hmda.results.reduce(function(prev, cur){

//          return prev + cur.sum_loan_amount_000s;

//     }, 0);

//     var totalLoans = hmda.results.reduce(function(prev, cur){

//     return prev + cur.count_action_taken_name;

//     }, 0);



//     console.log('Total Loan Value: ', totalLoanAmount * 1000);
//     console.log('Total Loans: ', totalLoans);

//     console.log('Avg Loan Size: ', Math.round((totalLoanAmount*1000)/totalLoans));
//     console.log('Total Loan in Billions: ', totalLoanAmount/1000000);



















/*****************************************     STEP 3     ******************************* */

//Step 3: Get the results and display them in the browser






//Load all functions

function watchsubmit () {

    getFilters();

}
(watchsubmit);