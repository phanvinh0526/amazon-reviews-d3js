// Visualize Bag of Word
$(document).ready(function(){

    /** Global Variables */
    var svg = d3.select("svg"),
        margin = {top: 20, right: 20, bottom: 120, left: 60},
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom;
    var x = d3.scaleBand().rangeRound([0, width]).padding(0.2),
        y = d3.scaleLinear().rangeRound([height, 0]);
    var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    var userName = "phanvinh0526";
    var authToken = "8h1S0t1h8E3g2d5B5t1o"
    var selectedTable = "new_bag_word";
    var selectedDomain = "";
    var selectedRange = "";

    //  Get API Server connection
    populateTableOptions();

    //  

    
    /***********    Main Function *************/

    populateTableOptions = function(){
        d3.json("http://localhost:8153/api.rsc/")
                .header("Authorization", "Basic" + btoa(userName + ":" + authToken))
                .get(function(error, data){
                    if(error) throw error;

                    var values = data.values;

                    d3.select("")
                })
    }

});