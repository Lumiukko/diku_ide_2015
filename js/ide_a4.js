$(document).ready(function() {
    var w = 710;
    var h = 400;
             
    var projection = d3.geo.orthographic()
        .scale(155000) // Default is 200000, 155000 contains all data points, zoomed in on north east is 400000
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
        .style("border", "1px solid black")
        .call(d3.behavior.zoom()
                .scaleExtent([1, 4])
                .on("zoom", function () {
                    svg.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")")
                }));
		
	var filters = d3.selectAll(".checkbox")
		.on("click", function() {
			if (d3.select(this).attr("checked") == "checked") {
				d3.select(this).attr("checked", 'unchecked')
				crime_category = this.value;
				console.log(crime_category);
				update_map()
			} else {
				d3.select(this).attr("checked", 'checked')
				crime_category = this.value;
				console.log(crime_category);
				update_map()
			}
		});
	
    
    load_crime_data();
    
    function load_crime_data() {
        d3.json("data/sf_crime.geojson", function(error, data) {
            if (!error) {
                draw_map(data);
                // TODO change ordering once draw_map expects data.features
                data = data.features;
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
    
        var lineFunction = d3.svg.line()
                             .x(function(d) { return d[0]; })
                             .y(function(d) { return d[1]; })
                             .interpolate("cardinal");
    
        
        // Draw Coastal Lines
        d3.json("data/sf_coast.geojson", function(error, topology) {
            if (!error) {
                var coast = topology.features;
                
                svg.selectAll("path.coast")
                   .data(coast)
                   .enter()
                   .append("path")
                   .attr("class", "coast")
                   .attr("d", function(d, i) {
                        var projected = d.coordinates.map(projection);
                        return lineFunction(projected);
                   });

            }
            else {
                console.log("Error loading coast: " + error);
            }
            console.log("FINISHED COAST");
        });
        
        
        // Draw Streets
        d3.json("data/sf_streets.geojson", function(error, topology) {
            if (!error) {
                var streets = topology.features;
                
                svg.selectAll("path.street")
                   .data(streets)
                   .enter()
                   .append("path")
                   .attr("class", "street")
                   .attr("d", function(d, i) {
                        var projected = d.coordinates.map(projection);
                        return lineFunction(projected);
                   });

            }
            else {
                console.log("Error loading streets: " + error);
            }
            console.log("FINISHED STREETS");
        });
        
       

        //var world = topojson.object(topology, topology.objects.sfcontours); // This is a topojson
        var world = crime_data.features;  // This is a normal GeoJSON object

        svg.selectAll("circle.crime")
           .data(world)
           .enter()
           .append("circle")
           .attr("class", "crime")
           .attr("r", 2)
           .attr("cx", function(d, i) {
                return projection(d.geometry.coordinates)[0];
           })
           .attr("cy", function(d, i) {
                return projection(d.geometry.coordinates)[1];
           })
           .on("mouseover", function(d, i) {
                console.log("Point " + i + ": " + d.properties.Descript);
           });

        console.log("FINISHED CRIME OCCURENCES");
        
    };
    
    function draw_timeline(crime_data) {
        
        min_date_string = d3.min(crime_data, function(d) { return d.properties.Dates });
        max_date_string = d3.max(crime_data, function(d) { return d.properties.Dates });
        
        var min_date = parseCrimeDate(min_date_string);
        var max_date = parseCrimeDate(max_date_string);
        
        
        
        var default_range_start = new Date(min_date.getFullYear() + 1, 0, 1);
        var default_range_end = new Date(default_range_start).setYear(min_date.getYear() + 2);
        
        $("#timerange").dateRangeSlider({
            bounds: {
                min: min_date,
                max: max_date
            },
            defaultValues: {
                min: default_range_start,
                max: default_range_end
            },
            step: {days: 1},
            scales: [{
                first: function(value){ return value; },
                end: function(value) {return value; },
                next: function(value){
                    var next = new Date(value);
                    return new Date(next.setFullYear(value.getFullYear() + 1));
                },
                label: function(value){
                    return value.getFullYear();
                },
                format: function(tickContainer, tickStart, tickEnd){
                    tickContainer.addClass("timerange-month");
                }
            }],
            arrows: false
        });
        $("#timerange").bind("valuesChanged", function(e, data){
            var newdata = filter_by_daterange(crime_data);
            console.log(newdata.length);
        });
    }
    
    function filter_by_daterange(crime_data) {
        range = $("#timerange").dateRangeSlider("values");
        range.max.setDate(range.max.getDate() + 1);
        return crime_data.filter(function (d) {
            date = parseCrimeDate(d.properties.Dates);
            return date >=  range.min && date <= range.max;
        });
    }
                                 
    function parseCrimeDate(date_string) {
        var date_format = /(\d{4})-(\d{2})-(\d{2}).*/;
        var date_fields = date_format.exec(date_string); 
        return new Date(date_fields[1], date_fields[2]-1, date_fields[3]);       
    }
});

