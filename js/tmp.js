$(document).ready(function(){
  
    //  Display func
    function displayGraph(strHtml){
        $('#display').html(strHtml)
    }

    //  Color Palette
    function getColor(){
        let palette = ['#6b5b95','#feb236','#d64161','#b5e7a0','#eca1a6','#e3eaa7','#b9936c','#82b74b','#c94c4c','#92a8d1','#4040a1','#618685','#f4e1d2'];

        return palette[Math.floor(Math.random() * palette.length)];
    }

    //  --- Basic func

    displayViz = function(data_path){
        // draw a frame to contain Viz
        displayGraph('<div class="col-md-10" id="s1"><svg></svg></div>')

        // build SVG
        var svgCanvas = d3.select("svg")
                .attr("width", 1100)
                .attr("height", 540)
                .attr("class", "svgCanvas");

        //  read data
        d3.json(data_path, function(data){
            
            //  Behaviour "drag"
            let drag = d3.drag()
                            .on("drag", function(d, i){ // d: data, i: index
                                d.x += d3.event.dx
                                d.y += d3.event.dy
                                
                                d3.select(this).attr("cx", d.x).attr("cy", d.y);
                                links.each(function(l, li){
                                    // console.log(l.node01+" -- "+li)
                                    if(l.node01 == d.id){
                                        d3.select(this).attr("x1", d.x).attr("y1", d.y);
                                    } else if(l.node02 == d.id){
                                        d3.select(this).attr("x2", d.x).attr("y2", d.y);
                                    }
                                });
                            });
                            

            //  Draw edges
            let links = svgCanvas.selectAll("link")
                            .data(data.links)
                            .enter()
                            .append("line")
                            .attr("class", "link")
                            .attr("x1", function(l){
                                //  find the corresponding node
                                let sourceNode = data.nodes.filter(function(val, idx){
                                    // console.log(val.id + " -- " + idx + " -- " + l.node01); // site06 -- 9 -- site01
                                    return val.id == l.node01
                                })[0];
                                d3.select(this).attr("y1", sourceNode.y);
                                return sourceNode.x
                            })
                            .attr("x2", function(l){
                                var targetNode = data.nodes.filter(function(val, idx){
                                    return val.id == l.node02
                                })[0];
                                d3.select(this).attr("y2", targetNode.y)
                                return targetNode.x
                            })
                            .attr("fill", "none")
                            .attr("stroke", "gray")
                            .attr("opacity", 0.8)
                            .attr("stroke-width", function(l){
                                return l.amount / 80
                            })
            //  Draw nodes
            let nodes = svgCanvas.selectAll("node")
                            .data(data.nodes).enter() // create place holders if the data is new
                            .append("circle")
                            .attr("class", "node")
                            .attr("cx", function(d){
                                return d.x
                            })
                            .attr("cy", function(d){
                                return d.y
                            })
                            .attr("r", function(d){
                                let linksSource = data.links.filter(function(val, idx){
                                    //console.log(val.node01)
                                    return val.node01 == d.id || val.node02 == d.id
                                });
                                let sum = 0
                                for(ix = 0; ix < linksSource.length; ix++){
                                    sum += linksSource[ix].amount
                                }
                                // console.log(sum)
                                return sum / 50;
                            })
                            .attr("fill", getColor())
                            .attr("stroke", "gray")
                            .attr("stroke-width", 3)
                            //  add behaviors
                            .call(drag)
                            //  animation
                            .on("mouseover", function(thisElement, index){
                                // grey all nodes / circles
                                svgCanvas.selectAll("circle").style("opacity", 0.3);

                                d3.select(this).style("opacity", 1); // highlight the consor element

                                //  grey the links
                                links.style('opacity', function(l){
                                    if(thisElement.id == l.node01 || thisElement.id == l.node02)
                                        return 1;
                                    else
                                        return 0.2;
                                });
                            })
                            .on("mouseout", function(thisEle, index){
                                svgCanvas.selectAll("circle").style("opacity", 1);
                                links.style('opacity', 0.8);
                            })
                            //  tooltip
                            .append("title")
                            .text(function(d){
                                let tmp = null;
                                let ta = 0;
                                tmp = data.links.filter(function(val, idx){
                                    return val.node01 == d.id || val.node02 == d.id
                                });
                                for(i=0; i<tmp.length; i++){
                                    ta += tmp[i].amount
                                };
                                let cl = 0;
                                tmp = data.links.filter(function(val, idx){
                                    return val.node01 == d.id || val.node02 == d.id
                                });
                                cl = tmp.length;
                                let s = "Total Amount: "+ta+" - " + "No.Connected Locations: "+cl;
                                return s;
                            });
            
            //  Tooltip Animation
            // svgCanvas.selectAll("text")
            //                 .data(data.nodes).enter()
            //                 .append("text")
            //                 .attr("x", function(thisEle, index){
            //                     return 150 + index * 150;
            //                 })
            //                 .attr("y", 300 - 35)
            //                 .attr("text-anchor", "middle")
            //                 .text(function(thisEle, index){
            //                     console.log(thisEle["title"])
            //                     return thisEle["id"]
            //                 });

            //  style / attr : style-temporary change, attr-permanent
        });
        
    }

    //  --- Advanced func

    advViz = function(){

    }

// ------------------------------------------------------------- //

    //  Dataset path
    var data_path = 'data.json';

    //  Default setting
    $('#switcherStatus').text('data.json');
    displayViz(data_path)

    //  Refresh viz
    $('#refresh').on('click', function(){
        $('#display').html(``);
        displayViz(data_path);
    });

    //  Switch dataset
    $('#switcher').on('click', function(){
        //  Empty display section
        $('#display').html(``)

        if($(this).is(':checked')){
            // Advanced Network graph
            $('#switcherStatus').text('data-02.json');
            data_path = 'data-02.json';
            displayViz(data_path)
        }else{
            // Basic Network graph
            $('#switcherStatus').text('data.json');
            data_path = 'data.json';
            displayViz(data_path)
        }
    })
})