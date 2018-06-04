
$(document).ready(function(){

    // --- DEFAULT VARIABLES --- //
    var network_loc = '#network_graph';
    var album_loc = '#network_detail';
    var WIDTH = $(network_loc).width();
    var HEIGHT = 700;
    var dataPath = './data/New_Network_Graph.json';
    var N = 100; // total number of nodes
    var nodeArray = null;
    var linkArray = null;


    //  Color Palette
    function getColor(){
        let palette = ['#6b5b95','#feb236','#d64161','#b5e7a0','#eca1a6','#e3eaa7','#b9936c','#82b74b','#c94c4c','#92a8d1','#4040a1','#618685','#f4e1d2'];

        return palette[Math.floor(Math.random() * palette.length)];
    }

    

    // highlight node when hover event triggered
    function highlightGraphNode(nodeIdx, on){

        // locate the SVG nodes : circle & label group
        circle = d3.select('#c' + nodeIdx);
        label = d3.select('#l' + nodeIdx);

        // activate / deactivate the node itself
        circle.classed('main', on);
        label.classed('on', on);
        label.selectAll('text').classed('main', on);

        // activate all siblings
        Object(linkArray).forEach(function(d){
            // d.source.asin
            if(nodeArray[nodeIdx].asin == d.source.asin){
                d3.select('#c'+d.target.index).classed('sibling', on);
                
                d3.select('#l'+d.target.index)
                        .classed("on", on)
                        .selectAll("text.nlabel")
                            .classed('sibling', on);

//       // set the value for the current active movie
//       activeMovie = on ? node.index : undefined;

            } else if(nodeArray[nodeIdx].asin == d.target.asin){
                d3.select('#c'+d.source.index).classed('sibling', on);

                d3.select('#l'+d.source.index)
                        .classed("on", on)
                        .selectAll("text.nlabel")
                            .classed('sibling', on);

            }
        });
    }

    // calculate size of node
    function getNodeSize(node, nodeIdx){

        let children = linkArray.filter(function(val, idx){
            // console.log("val: ",val.source)
            // console.log("node: ",node.asin)
            return val.source == node.asin || val.target == node.asin;
        })

        return 10 + (children.length * 1.5);
    }

    // display album detail panel
    function showAlbumPanel(node, idx){
        let str = `
                <div class="img-responsive">
                <img src="`+ node.imUrl +`" 
                                alt="" class="img-thumbnail img-center">
                </div>
                <table class="table table-hover">
                    <tr>
                        <th>ASIN</th><td>`+ node.asin +`</td>
                    </tr>
                    <tr>
                        <th>Title</th><td>`+ node.title +`</td>
                    </tr>
                    <tr>
                        <th>Price</th><td>`+ node.price +`</td>
                    </tr>
                    <tr>
                        <th>Sales Rank</th><td>`+ node.salesRank +`</td>
                    </tr>
                    <tr>
                        <th>Weight</th><td>`+ node.weight +`</td>
                    </tr>
                    <tr>
                        <th></th>
                        <td><a href="https://www.amazon.com/dp/`+ node.asin +`" class="btn btn-success btn-lg active" 
                                role="button" aria-pressed="true" target="__blank">Link to Amazon</a>
                        </td>
                    </tr>
                </table>
        `;
        displayGraph(album_loc, str)
    }

    // Display Viz
    function displayGraph(key, html){
        $(key).html(html);
    }
    
    // *************************************************************************
    // --------------------------- DRAW NETWORK GRAPH ------------------------ //
    // *************************************************************************

    function drawGraph(){
        displayGraph(network_loc, '<svg id="network"></sgv>')

        // svg resolution
        var svgCanvas = d3.select("svg#network") // select tag = "svg" with id = "network"
                        .attr("width", WIDTH)
                        .attr("height", HEIGHT)
                        .attr("class", "svgCanvas");

        var force = d3.layout.force()
            .gravity(.05)
            .distance(80)  // distance between 2 nodes linked by an edge
            .charge(-60)    // distance between nodes
            .size([WIDTH, HEIGHT]);

        // read data file
        d3.json(dataPath, function(error, data){
            if(error) throw error;

            // ------------------- Global Variable -------------- //
            nodeArray = data.nodes;
            linkArray = data.links;

            // -------------------- drawing --------------------- //
            //  draw edges : init function
            let links = svgCanvas.selectAll(".link")
                .data(linkArray).enter()
                .append("line")
                    .attr("class", "link")
                    .attr("stroke-width", function(l){
                        return l.weight + 4;
                    });

            //  Draw nodes : init function
            let nodes = svgCanvas.selectAll(".node")
                .data(nodeArray).enter() // create place holders if the data is new
                .append("circle")
                    .attr("class", "circle")
                    .attr("id", function(val, idx){
                        return "c"+idx;
                    })
                    .attr("r", function(val, idx){ return getNodeSize(val, idx); })
                    .attr("stroke", "#f00")
                    .call(force.drag);
            
            let labels = svgCanvas
                    .append("svg:g")
                        .attr("class", 'grp gLabel')
                        .selectAll("g.label")
                        .data(nodeArray, function(d){ return d.title.substring(0, 10); })
                        .enter()
                    .append("svg:g")
                        .attr('id', function(d, idx){ return "l" + idx;})
                        .attr("class", "label");
                    


            // *************************************************************************
            //          Simulation
            // *************************************************************************

            // convert raw data "source, target" replaced by Node index ---------
            linkArray.forEach(function(d, idx) {
                if (typeof d.source != "number"){
                    let sourceNode = nodeArray.filter(function(val, idx){
                        return val.asin == d.source
                    })[0];
                    linkArray[idx].source = nodeArray.indexOf(sourceNode);
                    // console.log(d.source,'---',tmp)
                }
                if (typeof d.target != "number"){
                    let targetNode = nodeArray.filter(function(val, idx){
                        return val.asin == d.target
                    })[0];
                    linkArray[idx].target = nodeArray.indexOf(targetNode);
                    // console.log(d.source,'---',tmp)
                }
            });

            // converge function : simulation
            force
                .nodes(nodeArray)
                .links(linkArray)
                .start();

            //  LOCATION of Nodes, Edges, Labels (*********)
            force.on("tick", function() {
                links.attr("x1", function(val, idx) {
                    // console.log(val,"--",idx);
                    //  links filtered by node asin
                    // console.log(nodes[0])
                    
                    // let sourceNode = nodes[idx]
                    // console.log(sourceNode)
                    
                    return val.source.x;
                })
                    .attr("y1", function(d) { return d.source.y; })
                    .attr("x2", function(d) { return d.target.x; })
                    .attr("y2", function(d) { return d.target.y; });
            
                nodes.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

                labels.attr("transform", function(d) { return "translate(" + (d.x + 30) + "," + (d.y + 30) + ")"; });

            });


            // *************************************************************************
            // ------------  Annimation ----------- //
            // *************************************************************************
            
            // highlight node : hover event
            nodes
                .on("click", function(val, idx){
                    // console.log("click","--",val,"--",idx)
                    showAlbumPanel(val, idx);
                })
                .on("mouseover", function(val, idx){
                    highlightGraphNode(idx, true);
                })
                .on("mouseout", function(val, idx){
                    highlightGraphNode(idx, false);
                })


            // lebel decoration
            labels
                .append("svg:text")
                    .attr("pointer-events", "none")
                    .attr("id", function(d){ return "lf" + d.index; })
                    .attr("class", "nlabel")
                    .text(function(d) { return d.title; })





                    //  add behaviors
                    // .call(drag)
                    //  animation
                    // .on("mouseover", function(thisElement, index){
                    //     // grey all nodes / circles
                    //     svgCanvas.selectAll("circle").style("opacity", 0.3);

                    //     d3.select(this).style("opacity", 1); // highlight the consor element

                    //     //  grey the links
                    //     links.style('opacity', function(l){
                    //         if(thisElement.id == l.node01 || thisElement.id == l.node02)
                    //             return 1;
                    //         else
                    //             return 0.2;
                    //     });
                    // })
                    // .on("mouseout", function(thisEle, index){
                    //     svgCanvas.selectAll("circle").style("opacity", 1);
                    //     links.style('opacity', 0.8);
                    // })
                //  tooltip
                // .append("title")
                //     .text(function(d){
                //         let tmp = null;
                //         let ta = 0;
                //         tmp = data.links.filter(function(val, idx){
                //             return val.node01 == d.id || val.node02 == d.id
                //         });
                //         for(i=0; i<tmp.length; i++){
                //             ta += tmp[i].amount
                //         };
                //         let cl = 0;
                //         tmp = data.links.filter(function(val, idx){
                //             return val.node01 == d.id || val.node02 == d.id
                //         });
                //         cl = tmp.length;
                //         let s = "Total Amount: "+ta+" - " + "No.Connected Locations: "+cl;
                //         return s;
                //     });
        });
    }


    // --- MAIN FUNCTION --- //
    if($(network_loc).length !=0 && $(network_loc).width() != null){
        drawGraph()
        // displayGraph()
    }else{
        console.log("Couldn't find: ", network_loc)
    }

});