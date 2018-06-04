
// ----------------------------------------------------------------
//  use dictionary to save {key, value} of all 15 products
var product = {};
var word_count = {};
var map_data_dict = {};

var svg_wc_location = "#word_cloud";
var h_chart = '#hori_bar_chart';
var review_map = "#review_map";
var bars = '';

function createSelector(product){
    if(product.length != 0){
        //  dynamic asin_selector
        asin_selector = document.getElementById('asin_selector');
        // console.log(asin_l)
        for(let key in product){
            asin_selector.options[asin_selector.options.length] = new Option(key, key);
        };
    }
}


function processData(allText){
    let allTextLines = allText.split(/\r\n|\n/);
    // console.log(allTextLines)
    let headers = allTextLines[0].split(',');
    
    for (let i=1; i<allTextLines.length; i++) {
        let data = allTextLines[i].split(',');

        product[data[1]] = data.toString();
    }
    // console.log(asin_list)
    // console.log(asin_cloud_word[0])
}

function processData_map(data){
    let allLines = data.split(/\r\n|\n/);
    let headers = allLines[0].split(',');

    map_data_dict = {};
    let tmp_asin = '-1';
    let tmp_lis = [];
    let tmp_country = {};

    for(let i=1; i < allLines.length; i++){
        let ele = allLines[i].split(',');
        
        if(tmp_asin == '-1'){
            tmp_asin = ele[0]
        }

        if(ele[0] != tmp_asin){
            // new asin
            map_data_dict[tmp_asin] = JSON.stringify(tmp_country);

            tmp_asin = ele[0];
            tmp_country = {};
        }else{
            // update the tmp_lis
            cSelect = 1;    // 
            if(ele[2] < 6)
                cSelect = 2 // fda403
            else if(ele[2] < 9)
                cSelect = 3 // c51350
            else if(ele[2] < 13)
                cSelect = 4 // fc3c3c
            else
                cSelect = 5 // 8a1253
            tmp_country[ele[1]] = {'count': ele[2], 'fillKey': cSelect};
        }
    }


}

function drawWordCloud(text_string){
    //let common = "poop,i,me,my,myself,we,us,our,ours,ourselves,you,your,yours,yourself,yourselves,he,him,his,himself,she,her,hers,herself,it,its,itself,they,them,their,theirs,themselves,what,which,who,whom,whose,this,that,these,those,am,is,are,was,were,be,been,being,have,has,had,having,do,does,did,doing,will,would,should,can,could,ought,i'm,you're,he's,she's,it's,we're,they're,i've,you've,we've,they've,i'd,you'd,he'd,she'd,we'd,they'd,i'll,you'll,he'll,she'll,we'll,they'll,isn't,aren't,wasn't,weren't,hasn't,haven't,hadn't,doesn't,don't,didn't,won't,wouldn't,shan't,shouldn't,can't,cannot,couldn't,mustn't,let's,that's,who's,what's,here's,there's,when's,where's,why's,how's,a,an,the,and,but,if,or,because,as,until,while,of,at,by,for,with,about,against,between,into,through,during,before,after,above,below,to,from,up,upon,down,in,out,on,off,over,under,again,further,then,once,here,there,when,where,why,how,all,any,both,each,few,more,most,other,some,such,no,nor,not,only,own,same,so,than,too,very,say,says,said,shall";
    let common = "quot,quote,say,shall,too,voice,theory,,something,make,makes,could,can";

    let words = text_string.split(',');
        if (words.length == 1){
            word_count[words[0]] = 1;
        } else {
            // count word density
            words.forEach(function(w){
                var w = w.toLowerCase();
                if (w != "" && common.indexOf(w)==-1 && w.length>1){
                if (word_count[w]){
                    word_count[w]++;
                } else {
                    word_count[w] = 1;
                }
                }
            })
        }


    //  Variables
    let width = $('#word_cloud').width();
    let height = $('#word_cloud').height();

    let fill_color = d3.scale.category20();

    let word_entries = d3.entries(word_count);
    // ----------------------------


    let xScale = d3.scale.linear()
        .domain([0, d3.max(word_entries, function(d) {
            return d.value;
        })
        ])
        .range([10,100]);

    d3.layout.cloud().size([width, height])
        .timeInterval(20)
        .words(word_entries)
        .fontSize(function(d) { return xScale(+d.value); })
        .text(function(d) { return d.key; })
        .rotate(function() { return ~~(Math.random() * 2) * 90; })
        .font("Impact")
        .on("end", draw)
        .start();

    function draw(words) {
        d3.select(svg_wc_location).append("svg")
            .attr("width", width)
            .attr("height", height)
        .append("g")
            .attr("transform", "translate(" + [width >> 1, height >> 1] + ")")
        .selectAll("text")
            .data(words)
            .enter()
        .append("text")
            .style("font-size", function(d) { return xScale(d.value) + "px"; })
            .style("font-family", "Impact")
            .style("fill", function(d, i) { return fill_color(i); })
            .attr("text-anchor", "middle")
            .attr("transform", function(d) {
            return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            })
            .text(function(d) { return d.key; })
            .on('mouseover', function(){
                d3.select(this)
                    .transition()
                    .duration(500)
                    .style('stroke', 'black')
                    .style('stroke-widhh', 5)
                
                
                // bars.data.filter(function(key, i){
                //     console.log(key)
                // })


            })
            .on('mouseout', function(){
                d3.select(this)
                    .transition()
                    .duration(500)
                    .attr('r', function(d){ return d.weight_n})
                    .style('stroke', "none")
                    .style('stroke-width', 1)
            })
        .append('title') // Tooltip
            .text(function(d){
                let tx = 'Word Count: ' + d.value;
                return tx;
            });
    }

    d3.layout.cloud().stop();
}


// ----------------------------------------------------------------
//                Word Cloud
// ----------------------------------------------------------------

$(document).ready(function(){

    // Reading new_bag_words dataset for Word_Cloud Viz
    $.ajax({
        type: "GET",
        url: "/data/new_bag_words.csv",
        dataType: "text",
        success: function(data){
            processData(data);
            createSelector(product);
        }
    });

    // Loading Review Map data
    $.ajax({
        type: "GET",
        url: "/data/new_review_map.csv",
        dataType: "text",
        success: function(data){
            processData_map(data);
        }
    });


    //  onChange "selector" | Main Function
    $('#asin_selector').on('change', function(){
        // console.log(this.value);

        // clean old viz
        d3.select(svg_wc_location).selectAll("svg").remove();
        d3.select(h_chart).selectAll("svg").remove();
        d3.select(review_map).selectAll("svg").remove();

        // draw new viz
        drawWordCloud(product[this.value]);

        // draw horizontal bar chart
        drawHorBarchar(word_count);

        // draw choropleth map
        drawChorMap(this.value);
    });


});

// ----------------------------------------------------------------
//               Horizontal Bar Chart
// ----------------------------------------------------------------

// args[0]: dict
function drawHorBarchar(data){

    let top_words = 20 // only display top 20 words
    let tmp_data = []

    //  convert dict to array tuple
    for(let key in data){
        // console.log(key)
        tmp_data.push({"name": key, "value": data[key], "value_n": Math.log(data[key])})
    }

    //  select top words
    data = tmp_data.splice(0, top_words)

    data = data.sort(function(a, b){
        return d3.ascending(a.value, b.value); d3.de
    })

    //  ---------------------------

    //set up svg using margin conventions - we'll need plenty of room on the left for labels
    let margin = {
        top: 15,
        right: 25,
        bottom: 15,
        left: 60
    };

    let width = $(h_chart).width() - margin.left - margin.right,
        height = $(h_chart).height() - margin.top - margin.bottom;

    let svg = d3.select(h_chart).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    let x = d3.scale.linear()
                .range([0, width])
                .domain([0, d3.max(data, function (d) {
                    return d.value;
                })]);

    let y = d3.scale.ordinal()
                .rangeRoundBands([height, 0], .1)
                .domain(data.map(function (d) {
                    return d.name;
                }));

    //make y axis to show bar names
    let yAxis = d3.svg.axis()
                    .scale(y)
                    //no tick marks
                    .tickSize(0)
                    .orient("left");

    let gy = svg.append("g")
                    .attr("class", "y axis")
                    .call(yAxis)

    bars = svg.selectAll(".bar")
                    .data(data)
                    .enter()
                    .append("g")

    //append rects
    bars.append("rect")
            .attr("class", "bar")
            .attr("y", function (d) {
                return y(d.name);
            })
            .attr("height", y.rangeBand())
            .on("mouseover", function(d){
                // console.log(d)
            })
            .attr("x", 0)
            .attr("width", function (d) {
                return x(d.value);
            });

    //add a value label to the right of each bar
    bars.append("text")
            .attr("class", "label")
            //y position of the label is halfway down the bar
            .attr("y", function (d) {
                return y(d.name) + y.rangeBand() / 2 + 4;
            })
            //x position is 3 pixels to the right of the bar
            .attr("x", function (d) {
                return x(d.value) + 3;
            })
            .text(function (d) {
                return d.value;
            });

};


// ----------------------------------------------------------------
//               Color Map with D3js
// ----------------------------------------------------------------

function drawChorMap(input_asin){

    // Loading data
    let dataObj = Object(JSON.parse(map_data_dict[input_asin]));

    // Drawing the map
    var basic_choropleth = new Datamap({
        element: document.getElementById("review_map"),
        projection: 'mercator',
        geographyConfig:{
            highlightBorderColor: '#bada55',
            popupTemplate: function(geo, data){
                // console.log(data)
                let str = `
                    <div class="hoverinfo">
                    <strong class="text-primary">`+ geo.properties.name +`</strong><br>
                    <span><strong>No.Review: </strong>`+ data.count +`</span>
                    </div>
                `;
                return str;
            },
            highlightBorderWidth: 2
        },
        fills: {
            '2': '#f4bb58',
            '3': '#c51350',
            '4': '#f74c4c', 
            '5': '#f41a1a',
            defaultFill: "#ABDDA4",
            authorHasTraveledTo: "#fa0fa0"
        },
        data: dataObj
      });
      
    
    
}

//    // update the tmp_lis
//    cSelect = 1;    // 
//    if(ele[2] < 5)
//        cSelect = 2 // f4bb58
//    else if(ele[2] < 10)
//        cSelect = 3 // dd4b7c
//    else if(ele[2] < 15)
//        cSelect = 4 // f74c4c
//    else
//        cSelect = 5 // f41a1a

