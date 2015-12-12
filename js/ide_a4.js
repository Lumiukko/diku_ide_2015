$(document).ready(function() {
    var w = 670;
    var h = 600;
    var r = 3;
    
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
		
		all_categories = unique_cat.slice();
		
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
						update_map();
					} else {
						d3.select(this).attr("checked", 'checked')
						update_map();
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
	 function remove_category(categories, cat_name){
		var i = categories.indexOf(cat_name);
			if(i != -1) {
				categories.splice(i, 1);
			}
		return categories;
	 }
	
	function toTitleCase(str){
		return str.replace(/\w\S*/g, function(txt){return txt.charAt(0) + txt.substr(1).toLowerCase();});
	}
    
    function load_crime_data() {
        d3.json("data/sf_crime.geojson", function(error, data) {
            if (!error) {
                crimedata = data;
				draw_filters(crimedata.features);
                draw_timeline(crimedata.features);
                init_daynight_filter();
                draw_map(crimedata);
            } else {
                console.log("Error" + error);
            }
        });
    };
    

    function update_map() {        
        // apply filters
        resulting_data = filter_by_daterange(crimedata.features);
        resulting_data = filter_by_daynight(resulting_data);
		final_data = filter_by_category(resulting_data)
        
        var crime_corners = {};
        
        data =  d3.select("#visbox svg")
                  .selectAll("circle.crime")
                  .data(final_data);
                  
        data.enter()
            .append("circle")
            .attr("class", "crime")
            .attr("r", function(d, i) {
                var ccx = Math.round(projection(d.geometry.coordinates)[0]);
                var ccy = Math.round(projection(d.geometry.coordinates)[1]);
                if (typeof crime_corners[ccx + "," + ccy] == "undefined") {
                    crime_corners[ccx + "," + ccy] = [];
                }
                crime_corners[ccx + "," + ccy].push(d);
                
                var cornercrimes = crime_corners[ccx + "," + ccy].length;
                return 0.7 + (cornercrimes < 5 ? cornercrimes : Math.log(cornercrimes-3)+5);
            })
            .attr("cx", function(d, i) {
                 return Math.round(projection(d.geometry.coordinates)[0]).toFixed(2);
            })
            .attr("cy", function(d, i) {
                 return Math.round(projection(d.geometry.coordinates)[1]).toFixed(2);
            })
            .on("mouseover", function(d, i) {
                var ccx = Math.round(projection(d.geometry.coordinates)[0]);
                var ccy = Math.round(projection(d.geometry.coordinates)[1]);
                //console.log(crime_corners[ccx + "," + ccy].length)
                //console.log(d.geometry.coordinates);
                //console.log(JSON.stringify(crime_corners[ccx + "," + ccy]))
                d3.selectAll("circle.crime")
                  .sort(function (a, b) {  // Reordering to bring the selected point to the top.
                      if (a != d) return -1;
                      else return 1;
                  })
                 //console.log("Point " + i + ": " + d.properties.Descript);
            });
            
        data.enter()
            .append("text")
            .text(function(d, i) {
                var ccx = Math.round(projection(d.geometry.coordinates)[0]);
                var ccy = Math.round(projection(d.geometry.coordinates)[1]);
                var cornercrimes = crime_corners[ccx + "," + ccy].length;
                if (cornercrimes == 1) {
                    return "";
                }
                return cornercrimes
            })
            .attr("class" , "crime label")
            .attr("x", function(d, i) {
                 return Math.round(projection(d.geometry.coordinates)[0]).toFixed(2);
            })
            .attr("y", function(d, i) {
                 return Math.round(projection(d.geometry.coordinates)[1]).toFixed(2);
            })
            .attr("dy", 1.5)
            .attr("text-anchor", "middle")
             
             
        data.exit().remove();
    };
    
    
    function draw_map(crime_data) {
    
        var lineFunction = d3.svg.line()
                             .x(function(d) { return Math.round(d[0]).toFixed(2); })
                             .y(function(d) { return Math.round(d[1]).toFixed(2); })
                             .interpolate("linear");
    
        
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
            arrows: false,
            valueLabels: "change"
        });
        $("#timerange").bind("valuesChanged", function(e, data){
            update_map();
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
    
    function filter_by_daynight(crime_data) {
        var timerange = $("input[type=radio][name=daytime]:checked").val();
        
        if (timerange == "all") {
            return crime_data;
        }
        else if (timerange == "day") {
            return filter_by_daytime(crime_data, 6, 22);
        }
        return filter_by_daytime(crime_data, 22, 6);
    }
    
    function filter_by_daytime(crime_data, start_hour, end_hour) {
        return crime_data.filter(function (d) {
            date = parseCrimeDate(d.properties.Dates);
            if (start_hour > end_hour) {
                return !(date.getHours() > end_hour && date.getHours() <= start_hour);
            } 
            return date.getHours() > start_hour && date.getHours() <= end_hour;
        });
    }
                                 
    function parseCrimeDate(date_string) {
        var date_format = /(\d{4})-(\d{2})-(\d{2})\s(\d{2}):(\d{2}):(\d{2})/
        var date_fields = date_format.exec(date_string); 
        return new Date(date_fields[1], date_fields[2]-1, date_fields[3],
                        date_fields[4], date_fields[5], date_fields[6]);       
    }
    
    function init_daynight_filter() {
        $("input[name=daytime]:radio").on('change', update_map);
    }

	
	function filter_by_category(crime_data){
		var selected = [];
		$(document).ready(function() {
		  $("input:checkbox[type=checkbox]:checked").each(function() {
			   selected.push($(this).val());
		  });
		});
		
		var temp = [{}]; 
		var result = [{}]; 
		selected.forEach(function(elem){
			cat_data = [{}]
			cat_data = crime_data.filter(function(d){
				return d.properties.Category === elem
			})
			$(document).ready(function(){
			  $.extend(result,temp, cat_data);
			});
			temp = result.slice();
		})
		return result;
	}

});
