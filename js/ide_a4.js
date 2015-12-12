$(document).ready(function() {
    var w = 710;
    var h = 600;
    
    var crimedata;
             
    var projection = d3.geo.orthographic()
        .scale(260000)
        .rotate([122.43, -37.77, 0.0])
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
			
    
    load_crime_data();
	
	function draw_filters(data){
		categories = [];
		data.forEach(function(entry) {
				categories.push(entry.properties.Category);
		});
		
		var unique_cat = [];
		$.each(categories, function(i, el){
			if($.inArray(el, unique_cat) === -1) unique_cat.push(el);
		});
		
		unique_cat.sort(function(a,b){
			return a.localeCompare(b);
		});
				
		unique_cat.forEach(function(entry) {
			var filters = d3.select("#filter")
				.append("input")
				.attr("id", entry)
				.attr("class", "checkbox")
				.attr("type", "checkbox")
				.attr("value", entry)
				.attr("checked", "checked")
				.on("click", function() {
					if (d3.select(this).attr("checked") == "checked") {
						d3.select(this).attr("checked", 'unchecked')
						crime_category = this.value;
						console.log(crime_category);
						//TODO
						// update_map()
					} else {
						d3.select(this).attr("checked", 'checked')
						crime_category = this.value;
						console.log(crime_category);
						//TODO
						// update_map()
					}
				});
			var filters = d3.select("#filter")
				.append("label")
				.attr("for", entry)
				.text(toTitleCase(entry));
			var filters = d3.select("#filter")
				.append("br");
		});
		
	}
	
	function toTitleCase(str){
		return str.replace(/\w\S*/g, function(txt){return txt.charAt(0) + txt.substr(1).toLowerCase();});
	}
    
    function load_crime_data() {
        d3.json("data/sf_crime.geojson", function(error, data) {
            if (!error) {
                crimedata = data;
                draw_map(crimedata);
                draw_timeline(crimedata.features);
				draw_filters(data);
            } else {
                console.log("Error" + error);
            }
        });
    }
    
    
    function update_map(crime_data) {
        data =  d3.select("#visbox svg")
                  .selectAll("circle.crime")
                  .data(crime_data);
                  
        data.enter()
            .append("circle")
            .attr("class", "crime")
            .attr("r", 2)
            .attr("cx", function(d, i) {
                 return Math.round(projection(d.geometry.coordinates)[0]).toFixed(2);
            })
            .attr("cy", function(d, i) {
                 return Math.round(projection(d.geometry.coordinates)[1]).toFixed(2);
            })
            .on("mouseover", function(d, i) {
                 //console.log("Point " + i + ": " + d.properties.Descript);
            });
             
             
        data.exit().remove();
    };
    
    
    function draw_map(crime_data) {
    
        var lineFunction = d3.svg.line()
                             .x(function(d) { return Math.round(d[0]).toFixed(2); })
                             .y(function(d) { return Math.round(d[1]).toFixed(2); })
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
        /*
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
        */
       

        update_map(crime_data);

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
            update_map(newdata);
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

