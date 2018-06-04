
var rev_yr = [] // data.map is only available for Array, not for Directory data type
var svg_his_location = "#reviews_histogram"
// ----------------------------------------------------------------


function drawHistogram(data){

    // dynamic resolutionx
    let swidth = $(svg_his_location).width();
    let sheight = 500;

    // draw viz frame
    let svg = d3.select(svg_his_location)
                    .append("svg")
                    .attr("width", swidth)
                    .attr("height", sheight)
                    .attr("class", "svgCanvas");

    let margin = {top: 20, right: 20, bottom: 30, left: 40},
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom;

    // padding between different columns
    let xScale = d3.scale.ordinal().rangeRoundBands([0, width], .1);
    // helper function to calculate the height of each bar
    let yScale = d3.scale.linear().rangeRound([height, 0]);

    // create the area to draw the bar chart
    // g is a SVG element to group multiple SVG elements
    let g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // tooltip config
    let tooltip = d3.select("body").append("div").attr("class", "tooltip_ext");

    // range / domain of x-axis and y-axis
    xScale.domain(data.map(function(d) { return d.years; }));
    yScale.domain([0, d3.max(data, function(d) { return d.reviews; })]);
    
    // draw the x-axis, y-axis (the lines)
    g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.svg.axis().scale(xScale).orient("bottom"));
    
    // add y axis with ticks
    g.append("g")
        .attr("class", "axis axis--y")
        .call(d3.svg.axis().scale(yScale).orient("left").ticks(null, "S")) // ? ticks
     .append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", 2)
        .attr("y", yScale(yScale.ticks().pop() + 0.5))
        .attr("dy", "0.32em")
        .attr("text-anchor", "end")
        .text("No.Reviews");
    
    // draw bar columns
    let bar = g.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return xScale( d.years); })
        .attr("y", function(d) { return yScale(d.reviews); })
        .attr("width", xScale.rangeBand())
        .attr("height", function(d) { return height - yScale(d.reviews); })
        .attr("opacity", 0.8)
        .on("mousemove", function(d){
            // console.log(d.reviews);
            tooltip
                .style("left", d3.event.pageX - 50 + "px")
                .style("top", d3.event.pageY - 70 + "px")
                .style("display", "inline-block")
                .html('<strong class="text-primary">'+(d.reviews) + "</strong><br>" + "reviews");
        })
        .on("mouseout", function(d){
            tooltip.style("display", "none");
        });


    //------------------------------------------------------
    //              Prepare data for trendline
    //------------------------------------------------------

    // var xLabels = data.map(function (d) { return d['year']; })
    // var currencyFormat = d3.format("$0.2f");
    // var decimalFormat = d3.format("0.2f");
    
    // // get the x and y values for least squares
    // var xSeries = d3.range(1, xLabels.length + 1);
    // var ySeries = data.map(function(d) { return parseFloat(d['reviews']); });

    // var leastSquaresCoeff = leastSquares(xSeries, ySeries);

    // var x1 = xLabels[0];
    // var y1 = leastSquaresCoeff[0] + leastSquaresCoeff[1];
    // var x2 = xLabels[xLabels.length - 1];
    // var y2 = leastSquaresCoeff[0] * xSeries.length + leastSquaresCoeff[1];
    // var trendData = [[x1,y1,x2,y2]];
    
    // // draw trend line
    // var trendline = svg.selectAll(".trendline").data(trendData);
			
    // trendline.enter()
    //     .append("line")
    //     .attr("class", "trendline")
    //     .attr("x1", function(d) { return xScale(d[0]); })
    //     .attr("y1", function(d) { return yScale(d[1]); })
    //     .attr("x2", function(d) { return xScale(d[2]); })
    //     .attr("y2", function(d) { return yScale(d[3]); })
    //     .attr("stroke", "black")
    //     .attr("stroke-width", 1);
    
    // display equation on the chart
    // svg.append("text")
    //     .text("eq: " + decimalFormat(leastSquaresCoeff[0]) + "x + " + 
    //         decimalFormat(leastSquaresCoeff[1]))
    //     .attr("class", "text-label")
    //     .attr("x", function(d) {return xScale(x2) - 60;})
    //     .attr("y", function(d) {return yScale(y2) - 30;});
    
    // // display r-square on the chart
    // svg.append("text")
    //     .text("r-sq: " + decimalFormat(leastSquaresCoeff[2]))
    //     .attr("class", "text-label")
    //     .attr("x", function(d) {return xScale(x2) - 60;})
    //     .attr("y", function(d) {return yScale(y2) - 10;});


}


function processData(allText){
    let allTextLines = allText.split(/\r\n|\n/);
    // console.log(allTextLines)
    let headers = allTextLines[0].split(',');
    let lines = []

    for (let i=1; i<allTextLines.length; i++) {
        let data = allTextLines[i].split(',');
        if(data.length == headers.length){
            lines.push(Object({'years': data[0], 'reviews': Number(data[1])}));
            
        }
        // rev_yr[Number(data[0])] = Number(data[1])
    }
    rev_yr = lines;
    // console.log(rev_yr)
}


// returns slope, intercept and r-square of the line
function leastSquares(xSeries, ySeries) {
    var reduceSumFunc = function(prev, cur) { return prev + cur; };
    
    var xBar = xSeries.reduce(reduceSumFunc) * 1.0 / xSeries.length;
    var yBar = ySeries.reduce(reduceSumFunc) * 1.0 / ySeries.length;

    var ssXX = xSeries.map(function(d) { return Math.pow(d - xBar, 2); })
        .reduce(reduceSumFunc);
    
    var ssYY = ySeries.map(function(d) { return Math.pow(d - yBar, 2); })
        .reduce(reduceSumFunc);
        
    var ssXY = xSeries.map(function(d, i) { return (d - xBar) * (ySeries[i] - yBar); })
        .reduce(reduceSumFunc);
        
    var slope = ssXY / ssXX;
    var intercept = yBar - (xBar * slope);
    var rSquare = Math.pow(ssXY, 2) / (ssXX * ssYY);
    
    return [slope, intercept, rSquare];
}

// ----------------------------------------------------------------

$(document).ready(function(){

    // Reading new_bag_words dataset for Word_Cloud Viz
    $.ajax({
        type: "GET",
        url: "/data/reviews_histogram.csv",
        dataType: "text",
        success: function(data){
            processData(data);

            // Draw simple bar chart with d3js
            drawHistogram(rev_yr);
        }
    });

    

});