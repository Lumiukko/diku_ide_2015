$(document).ready(function() {
    var w = 600;
    var h = 400;
             
    var projection = d3.geo.orthographic()
        .scale(12000)
        .rotate([122.43, -37.78, 0.0])
        .translate([w/2, h/2])
        .clipAngle(90)
        .precision(.1);
    
    var geopath = d3.geo.path()
        .projection(projection);
       
    var svg = d3.select("#visbox")
        .append("svg")
        .attr("width", w)
        .attr("height", h)
        .style("background-color", "lightblue")
        .style("border", "1px solid black");
       
    var g = svg.append("g");
    
    d3.json("data/us-10m.json", function(error, topology) {
        if (!error) {
            var world = topojson.object(topology, topology.objects.counties)
        
            g.append("path")
             .datum(world)
             .attr("d", geopath)
             .attr("class", "county");
             
        }
        else {
            console.log(error);
        }
    });
    
    
    
        
    

});

