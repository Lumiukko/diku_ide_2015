$(document).ready(function() {
    /**
        Sets semi-global variables and starts the initialization process.
    */
    var w = 670;
    var h = 600;
    var r = 3;
    
    var crimedata;
    var all_categories = [];
    
    var month_name = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December']
    
    
    var cctooltip = d3.select("body")
                      .append("div")
                      .attr("class", "hidden")
                      .attr("id", "cctooltip");
    
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
    
    
    /**
        Loads the sf_crime.geojson file, which contains the crimes and
        their corresponding information, including geolocations.
        It also calls further initialization functions. 
    */
    function load_crime_data() {
        d3.json("data/sf_crime.geojson", function(error, data) {
            if (!error) {
                crimedata = data;
                draw_filters(crimedata.features);
                draw_timeline(crimedata.features);
                init_daynight_filter();
                draw_map(crimedata);
                draw_histogram(crimedata.features);
            } else {
                console.log("Error" + error);
            }
        });
    };
    
    
    /**
        Shows the tooltip at the position near the caller element.
        @param {element} caller The "this" of the parent.
        @param {json} data The data used in the tooltip.
        @param {number} index The index of the data provided.
    */
    function show_tooltip(coords, data, index) {
        console.log("WARNING; TOOLTIP IS BROKEN!");
        cctooltip.classed({"hidden": false})
                 .style("left", coords[0] + 12)
                 .style("top", coords[1] + 20)
                 .html("Number of Crimes: " + data.crimes.length);
    };
    
    
    /**
        Hides the tooltip, regardless of data and position.
    */
    function hide_tooltip() {
        cctooltip.classed({"hidden": true});
    };
    
    
    /**
        Draws the checkboxes for the different filters based on the provided data.
        @param {json} data The data containing all the crimes.
    */
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
        
    };
    
    
    /**
        Converts a string into title case (every first character of a word capitalized).
        @param {string} str The string to be converted to title case.
        @return {string} The string converted into title case.
    */
    function toTitleCase(str){
        return str.replace(/\w\S*/g, function(txt){return txt.charAt(0) + txt.substr(1).toLowerCase();});
    }
    
    
    /**
        Takes longitude and latitude coordinates, applys the projection function
        and rounds the resulting coordinates to 2 digits after the comma.
        @param {array} coordinates 2-dimensional array containing longitude and latitude coordinates.
        @param {number} digits The number of digits to which the result is rounded.
        @return {array} The coordinates for the SVG element rounded to the given amount of digits.
    */
    function get_rounded_projection(coordinates, digits) {
        var ccx = Math.round(projection(coordinates)[0]).toFixed(digits);
        var ccy = Math.round(projection(coordinates)[1]).toFixed(digits);
        return [ccx, ccy];
    };
    
    
    /**
        Redraws all dynamic elements on the map (the SVG).
    */
    function update_map() {        
        // APPLY FILTERS
        resulting_data = filter_by_daterange(crimedata.features);
        resulting_data = filter_by_daynight(resulting_data);
        final_data = filter_by_category(resulting_data)
        
        var corners = {};
        var idx = 0;
        $(final_data).each(function(i, d) {
            if (typeof d.geometry != 'undefined'){
                var cc = get_rounded_projection(d.geometry.coordinates, 0);
                if (typeof corners[cc] == "undefined") {
                    corners[cc] = {
                        "id": idx++,
                        "crimes": [],
                        "drawn": false
                    };
                };
                corners[cc].crimes.push(d);
            };
        });
        
        
        var corner_data = [];
        $.each(corners, function(key, value) {
            value["cc"] = key;
            corner_data[value.id] = value;
        });

        
        // DATA JOIN
        crime_circle =  svg.selectAll("circle.crime")
                           .data(corner_data);
        
        // ENTER CRIME CORNER MARKERS
        crime_circle.enter()
                    .append("circle")
                    .attr("class", "crime");
                            
        // ENTER + UPDATE
        crime_circle.attr("r", function(d, i) {                
                        var cornercrimes = d.crimes.length;
                        if (cornercrimes > 0) {
                            return 0.7 + (cornercrimes < 5 ? cornercrimes : Math.log(cornercrimes-3)+3.6);
                        };
                        return 0;
                    })
                    .attr("cx", function(d, i) {
                         return get_rounded_projection(d.crimes[0].geometry.coordinates, 2)[0];
                    })
                    .attr("cy", function(d, i) {
                         return get_rounded_projection(d.crimes[0].geometry.coordinates, 2)[1];
                    })
                    .on("mousemove", function(d, i) {
                        // For some reason this does not get the correct absolute mouse position.
                        show_tooltip(d3.mouse(this), d, i);
                    })
                    .on("mouseout", function(d, i) {
                        hide_tooltip();
                    });
                    
        // EXIT
        crime_circle.exit().remove();
    };
    
    
    /**
        Draws all static elements on the map (the SVG).
        @param {json} crime_data The JSON object containing all the crime data.
    */
    function draw_map(crime_data) {
    
        var lineFunction = d3.svg.line()
                             .x(function(d) { return Math.round(d[0]).toFixed(2); })
                             .y(function(d) { return Math.round(d[1]).toFixed(2); })
                             .interpolate("linear");
                             

        
        // Draw PD Districts
        var district_color = {
            0: "#6a6c44", 1: "#484c00", 2: "#12006f", 3: "#6e3f75", 4: "#006237",
            5: "#6d0074", 6: "#006369", 7: "#111111", 8: "#444444", 9: "#74001e"
        }
        d3.json("data/sfpd_districts.geojson", function(error, topology) {
            if (!error) {
                var districts = topology.features;
                
                svg.selectAll("polygon.district")
                   .data(districts)
                   .enter()
                   .append("polygon")
                   .attr("class", "district")
                   .attr("points", function(d, i) {
                        var projected = [];
                        $.each(d.geometry.coordinates[0], (function(k, v) {
                            projected.push(v.map(projection));
                        }));
                        return projected;
                   })
                   .attr("fill", function(d, i) {
                        return district_color[i];
                   });

            }
            else {
                console.log("Error loading districts: " + error);
            }
            console.log("FINISHED DISTRICTS");
        });
        
        
        
        
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
    
    
    /**
        Draws the histogram of crimes occurring in time periods.
        @param {json} crime_data The JSON object containing all the crime data.
    */
    function draw_histogram(crime_data) {
        var margin_top = 40;
        var margin_left = 30;
        var hist_height = 50;
        var hist_width = w-margin_left;
        // the following code is based on 
        // http://bl.ocks.org/sbrudz/ed6454e3d25640d19a41
        var parseDate = d3.time.format("%Y-%m-%d %H:%M:%S").parse;
        var formatDate = d3.time.format("%m/%y");        
        var x = d3.time.scale().range([0, hist_width]);
        var y = d3.scale.linear().range([hist_height, 0]);
        
        var xAxis = d3.svg.axis().scale(x).orient("bottom").tickFormat(formatDate);
        var yAxis = d3.svg.axis().scale(y).orient("left").ticks(3);
        
        var histogram = d3.select("#histogram")
                          .append("svg")
                          .attr("width", hist_width+margin_left)
                          .attr("height", hist_height+margin_top)
                          .attr("transform", "translate("+margin_left+","+margin_top/2+")");
        crime_data.forEach(function(d) {
            d.created_date = parseDate(d.properties.Dates);
        });
        // Determine the first and list dates in the data set
        var monthExtent = d3.extent(crime_data, function(d) { return d.created_date; });
        
        // Create one bin per month, use an offset to include the first and last months
        var monthBins = d3.time.months(d3.time.month.offset(monthExtent[0],-1),
                                       d3.time.month.offset(monthExtent[1],1));
        
        
        // Use the histogram layout to create a function that will bin the data
        var binByMonth = d3.layout.histogram()
                           .value(function(d) { return d.created_date; })
                           .bins(monthBins);
        // Bin the data by month
        var histData = binByMonth(crime_data);
        
        // Scale the range of the data by setting the domain
        x.domain(d3.extent(monthBins));
        y.domain([0, d3.max(histData, function(d) { return d.y; })]);

        histogram.selectAll(".bar")
                 .data(histData)
                 .enter().append("rect")
                 .attr("class", "bar")
                 .attr("x", function(d) { return x(d.x); })
                 .attr("width", function(d) { return x(new Date(d.x.getTime() + d.dx))-x(d.x)-1; })
                 .attr("y", function(d) { return y(d.y); })
                 .attr("height", function(d) { return hist_height - y(d.y); })
                 .on('mouseover', function(d) {
                    tooltip = d3.select("#tt_histogram");
                    var date = parseCrimeDate(d[0].properties.Dates);
                    var mouse_pos = d3.mouse(document.body);
                    var content = '<p>'+month_name[date.getMonth()]+
                                  ' '+date.getFullYear()+'<p>'+
                                  '<p>'+d.length +' incidents on record</p>';
                    tooltip.html(content)
                           .style("opacity", "0")
                           .style("display", "inline")
                           .style("z-index", "1000")
                           .style("left", mouse_pos[0]+"px")
                           .style("top", mouse_pos[1]+"px")
                           .transition()
                           .style("opacity", 0.8);
                 })
                 .on("mouseout", function() {
                     d3.select("#tt_histogram").style("display", "none");
                 });

          // Add the X Axis
          histogram.append("g")
                   .attr("class", "x axis")
                   .attr("transform", "translate(0," + hist_height + ")")
                   .call(xAxis);

          // Add the Y Axis and label
          histogram.append("g")
                   .attr("class", "histogram_yaxis")
                   .call(yAxis)
                   .append("text")
                   .attr("class", "histogram_label")
                   .attr("y", -15)
                   .attr("dy", "0.5em")
                   .text("Crimes per month");
    }
    
    
    /**
        Draws the timeline to select the time period of crimes to be displayed.
        @param {json} crime_data The JSON object containing all the crime data.
    */
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
    
    
    /**
        Filters crimes by time periods and the time period set in the data range slider.
        @param {json} crime_data The JSON object containing all the crime data.
        @return {json} Returns the filtered crime data as JSON object.
    */
    function filter_by_daterange(crime_data) {
        range = $("#timerange").dateRangeSlider("values");
        range.max.setDate(range.max.getDate() + 1);
        return crime_data.filter(function (d) {
            date = parseCrimeDate(d.properties.Dates);
            return date >=  range.min && date <= range.max;
        });
    }
    
    
    /**
        Filters crimes by day or night time as set by the radio buttons.
        @param {json} crime_data The JSON object containing all the crime data.
        @return {json} Returns the filtered crime data as JSON object.
    */
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
    
    
    /**
        Filters crimes by hours as set by start and end hours.
        @param {json} crime_data The JSON object containing all the crime data.
        @param {number} start_hour The starting hour for the filter.
        @param {number} end_hour The end hour for the filter.
        @return {json} Returns the filtered crime data as JSON object.
    */
    function filter_by_daytime(crime_data, start_hour, end_hour) {
        return crime_data.filter(function (d) {
            date = parseCrimeDate(d.properties.Dates);
            if (start_hour > end_hour) {
                return !(date.getHours() > end_hour && date.getHours() <= start_hour);
            } 
            return date.getHours() > start_hour && date.getHours() <= end_hour;
        });
    }
     
     
    
    /**
        Parses the date as taken from the crime data and returns a Date object.
        @param {string} date_string The date of a crime as string.
        @return {Date} The corresponding date object.
    */
    function parseCrimeDate(date_string) {
        var date_format = /(\d{4})-(\d{2})-(\d{2})\s(\d{2}):(\d{2}):(\d{2})/
        var date_fields = date_format.exec(date_string); 
        return new Date(date_fields[1], date_fields[2]-1, date_fields[3],
                        date_fields[4], date_fields[5], date_fields[6]);       
    }
    
    
    /**
        Initialization of the day/night filter, also calls map update.
    */
    function init_daynight_filter() {
        $("input[name=daytime]:radio").on('change', update_map);
    }

    
    /**
        Filters crimes by category as set by the category checkboxes.
        @param {json} crime_data The JSON object containing all the crime data.
        @return {json} Returns the filtered crime data as JSON object.
    */
    function filter_by_category(crime_data){
        var selected = [];
        $(document).ready(function() {
          $("input:checkbox[type=checkbox]:checked").each(function() {
               selected.push($(this).val());
          });
        });
        var result = [{}];
        if (selected.length == 37){
            return crime_data
        } else {
            selected.forEach(function(elem){
                cat_data = [{}];
                cat_data = crime_data.filter(function(d){
                    return d.properties.Category == elem
                })
                result = result.concat(cat_data);
            });    
            return result;
        }
    }

});
