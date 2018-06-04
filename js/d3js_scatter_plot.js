// Visualize Scatter Plot

// "variable","aror","asd","maxdd"
// asin,title,salesRank,price,category,numReviews

$(document).ready(function(){

    /** Global Variables */
    let sp_location = '#scatter_plot';
    let WIDTH = $(sp_location).width();
    let HEIGHT = 500;

    let margin = {top: 50, right: 50, bottom: 50, left: 50}
    let h = HEIGHT - margin.top - margin.bottom
    let w = WIDTH - margin.left - margin.right
    let formatPercent = d3.format('')
    var dataPath = '/data/top_review_top_salerank.csv';

    // tooltip for Scatter Plot : mouseover event
    let tooltip = d3.select("body").append("div").attr("class", "tooltip_ext");

    //  create layout
    function colorScale(cat){
        // console.log(cat)
        if(cat == 'overlapped')
            return '#fff50a';
        else if(cat == 'top_salesrank')
            return '#90bddf';
        else
            return '#b2e575';
    }

    function htmlTooltip(node){
        let str = `
        <div class="hoverinfo">
            <strong class="text-primary">ASIN: </strong>`+node.asin+`<br>
            <strong class="text-primary">Title: </strong>`+node.title+`<br>
            <strong class="text-primary">Price: </strong>`+node.price+`<br>
            <strong class="text-primary">Sales Rank: </strong>`+node.salesRank+`<br>
            <strong class="text-primary">No.Reviews: </strong>`+node.numReviews+`<br>
        </div>`;
        return str;
    }

    //  SVG
    var svg_sp = d3.select(sp_location).append('svg')
                        .attr('height', h + margin.top + margin.bottom)
                        .attr('width', w + margin.left + margin.right)
                    .append('g')
                        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    
    /***********    Main Function *************/
    d3.csv(dataPath, function(data){
        // console.log(data)

        // **************** Highlight Overlapped Points *** //
        let asinDict = {}
        for(let i=0; i<data.length; i++){
            if(asinDict[data[i].asin] == undefined)
                asinDict[data[i].asin] = 1
            else{
                asinDict[data[i].asin] += 1
                if(asinDict[data[i].asin] == 2){ // appear in 2 groups
                    data[i].category = 'overlapped'
                }
            }
        }

        // ********* Remove Duplication
        // for(let i=0; i<data.length; i++){
        //     if(data[i].category == 'overlapped'){
        //         data.splice(i, 1);
        //     }
        // }
        // console.log(data)

        // **************** normalize data **************** //
        for(let i=0; i<data.length; i++){
            data[i].salesRank = Number(data[i].salesRank)
            data[i].price = Number(data[i].price)
            data[i].numReviews = Number(data[i].numReviews)

            data[i].salesRank_n = Math.log(data[i].salesRank)
            data[i].numReviews_n = Math.log(data[i].numReviews)
            if(data[i].price >= 35)
                data[i].weight_n = data[i].price - 8
            else
                data[i].weight_n = data[i].price
        }

        // ************************************************ //

        // create y-axis, x-axis
        let xScale = d3.scale.linear()
                    .domain([
                        d3.min([4, d3.min(data, function(d){ return d.numReviews_n})]),
                        d3.max([0, d3.max(data, function(d){ return d.numReviews_n})])
                    ])
                    .range([0, w])
        let yScale = d3.scale.linear()
                    .domain([
                        d3.min([3, d3.min(data, function(d){ return d.salesRank_n})]),
                        d3.max([0, d3.max(data, function(d){ return d.salesRank_n})])
                    ])
                    .range([h, 0])
        let outColor = d3.scale.threshold()
                            .domain(['overlapped', 'top_review', 'top_salesrank'])
                            .range(['#fff50a', '#b2e575', '90bddf']);

        //  X-Axis
        let xAxis = d3.svg.axis()
            .scale(xScale)
            .tickFormat(formatPercent)
            .ticks(5)
            .orient('bottom')
        // Y-axis
        let yAxis = d3.svg.axis()
            .scale(yScale)
            .tickFormat(formatPercent)
            .ticks(5)
            .orient('left')

        // circle | measure
        var circle = svg_sp.selectAll('circle')
                        .data(data)
                        .enter()
                    .append('circle')
                        .attr('cx', function(d){ return xScale(d.numReviews_n)})
                        .attr('cy', function(d){ return yScale(d.salesRank_n)})
                        // .attr('cx', function(d){ console.log(d) ;return 1})
                        // .attr('cy', function(d){ console.log(d) ;return 2})
                        .attr('r', function(d){ return d.weight_n})
                        .attr('stroke', 'black')
                        .attr('stroke-width', 1)
                        .attr('fill', function(d, i){
                            // console.log(d.category)
                            return colorScale(d.category)
                        })
                        .attr('opacity', 0.8)
                        .on('mousemove', function(d){
                            d3.select(this)
                                .transition()
                                .duration(200)
                                .attr('r', function(d){ return d.weight_n + 8})
                                .attr('stroke-widhh', 3);

                            // ----- Tooltip ----- //
                            tooltip
                                .style("left", d3.event.pageX + 10 + "px")
                                .style("top", d3.event.pageY + 10 + "px")
                                .style("display", "inline-block")
                                .html(htmlTooltip(d));
                        })
                        .on('mouseout', function(d){
                            d3.select(this)
                                .transition()
                                .duration(400)
                                .attr('r', function(d){ return d.weight_n})
                                .attr('stroke-width', 1);
                            
                            tooltip.style("display", "none");
                        });


        // X-axis
        svg_sp.append('g')
                    .attr('class','axis')
                    .attr('transform', 'translate(0,' + h + ')')
                    .call(xAxis)
                .append('text') // X-axis Label
                    .attr('class','label')
                    .attr('y', -20)
                    .attr('x', w)
                    .attr('dy','1em')
                    .style('text-anchor','end')
                    .text('The number of Reviews')
        // Y-axis
        svg_sp.append('g')
                    .attr('class', 'axis')
                    .call(yAxis)
                .append('text') // y-axis Labelcy
                    .attr('class','label')
                    .attr('transform','rotate(-90)')
                    .attr('x',0)
                    .attr('y',5)
                    .attr('dy','1em')
                    .style('text-anchor','end')
                    .text('Sales Rank')

        // // Now build the legend
        // legend = svg_sp.append("g")
        //                     .attr("class", "legend")
        //                     .attr("transform","translate(50,30)")
        //                     .style("font-size","12px")
        //                     .call(d3.legend)
        // setTimeout(function() {
        //     legend
        //         .style("font-size","20px")
        //         .attr("data-style-padding",10)
        //         .call(d3.legend)
        //     },1000)

        
        
    });
    

});