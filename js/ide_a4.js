$(document).ready(function() {
    var w = 600;
    var h = 400;
             
    var projection = d3.geo.orthographic()
        .scale(400000) // Default is 200000, 155000 contains all data points, zoomed in on north east is 400000
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
    
    load_crime_data();
    
    function load_crime_data() {
        d3.json("data/sf_crime.geojson", function(error, data) {
            if (!error) {
                draw_map(data);
                draw_timeline(data);
            } else {
                console.log("Error" + error);
            }
        });
    }
    
    
    function update_map() {
        console.log("NOT YET IMPLEMENTED");
    };
    
    
    function draw_map(crime_data) {

        d3.json("data/sfstreets.json", function(error, topology) {
            if (!error) {
                
            }
            else {
                console.log(error);
            }
        });
        
        //var world = topojson.object(topology, topology.objects.sfcontours); // This is a topojson
        var world = crime_data.features;  // This is a normal GeoJSON object

        svg.selectAll("circle")
           .data(world)
           .enter()
           .append("circle")
           .attr("r", function(d, i) {
                if (d.properties.Descript.toLowerCase().indexOf("domestic violence") >= 0) {
                    return 5;
                }
                else {
                    return 2;
                }
           })
           .attr("cx", function(d, i) {
                return projection(d.geometry.coordinates)[0];
           })
           .attr("cy", function(d, i) {
                return projection(d.geometry.coordinates)[1];
           })
           .attr("opacity", 1.0)
           .attr("fill", function(d, i) {
                if (d.properties.Descript.toLowerCase().indexOf("domestic violence") >= 0) {
                    return "yellow";
                }
                else {
                    return "blue";
                }
           })
           .on("mouseover", function(d, i) {
                console.log("Point " + i + ": " + d.properties.Descript);
           });

        console.log("FINISHED");
    };
    
    function draw_timeline(crime_data) {
        var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
        $("#timerange").dateRangeSlider({
            bounds: {
                min: new Date(2012, 0, 1),
                max: new Date(2012, 11, 31, 12, 59, 59)
            },
            defaultValues: {
                min: new Date(2012, 1, 10),
                max: new Date(2012, 4, 22)
            },
            scales: [{
                first: function(value){ return value; },
                end: function(value) {return value; },
                next: function(value){
                    var next = new Date(value);
                    return new Date(next.setMonth(value.getMonth() + 1));
                },
                label: function(value){
                    return months[value.getMonth()];
                }
            }],
            arrows: false
        });    
    }
});

