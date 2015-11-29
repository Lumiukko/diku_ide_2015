$(document).ready(function() { 
    auto_toc();
   
    var months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

    var color = d3.scale.linear()
                  .domain([-10, 5, 30, 900])
                  .range(["blue", "lightblue", "red", "yellow"]);

    var csv = assv2csv("data/ankara_central.txt");
    var city = "Ankara, Turkey";
    //var csv = assv2csv("data/copenhagen.txt");
    //var city = "Copenhagen, Denmark";


    data = d3.csv.parse(csv);
    //show_data(data);
    
    $(months).each(function(i, m) {
        show_svg(data, m, "#d3js_vis1_1");
    });
    
    show_heatmap_table(data, "#d3js_vis1_2");
    
    

    
    
    function show_svg(input, month="JAN", selector="#d3js_vis1") {
        var max_abs_value = 40;
        var h = 300;
        var w = 800 - 20;  // 20 to leave some space right of the diagram

        var label_width = 50;
        var label_height = 50;
        var zero_line = 10*h/max_abs_value;
        var bar_w = (w - label_width - input.length) / (input.length);
        var yticks = [-10, -5, 0, 5, 10, 15, 20, 25];
        
        // Title
        d3.select(selector).append("h4").html("Barchart SVG of the Temperatures for " + month + " in °C in " + city)

        // SVG setup
        var svg = d3.select(selector)
                    .append("svg")
                    .attr("width", w+20)
                    .attr("height", h);


        // Barchart
        svg.selectAll("rect.bar")
           .data(input)
           .enter()
           .append("rect")
           .attr("x", function(d, i) {
               return i*(bar_w + 1) + label_width;
           })
           .attr("y", function(d) {
               if (d[month] < 0) {
                   return h - label_height - zero_line;
               }
               else {
                   return h - label_height - (d[month]*(h-label_height)/max_abs_value) - zero_line
               }
           })
           .attr("width", bar_w)
           .attr("height", function(d, i) {
               return Math.abs(d[month]*(h-label_height)/max_abs_value);
           })
           .attr("fill", function(d) {
               return color(d[month]);
           });

        // Frame around the plot itself
        svg.append("rect")
           .attr("x", label_width)
           .attr("y", 0)
           .attr("width", w - label_width)
           .attr("height", h - label_height)
           .style("stroke", "black")
           .style("fill", "none");
     
        // Vertical markers for the labels (First and Second last year)
        svg.selectAll("line.vertical")
           .data(input)
           .enter()
           .append("line")
           .attr("x1", function(d, i) {
                if (i == 0 || i == input.length-2 || (i % Math.floor(input.length / w * 100) == 0 && i < input.length - Math.floor(input.length / w * 100 / 2)+1)) {
                    return i*(bar_w+1) + label_width + bar_w/2;
                }
                else return -100;
           })
           .attr("x2", function(d, i) {
                if (i == 0 || i == input.length-2 || (i % Math.floor(input.length / w * 100) == 0 && i < input.length - Math.floor(input.length / w * 100 / 2)+1)) {
                    return i*(bar_w+1) + label_width + bar_w/2;
                }
                else return -100;
           })
           .attr("y1", 1)
           .attr("y2", h-label_height)
           .style("stroke", "gray")
           .style("stroke-dasharray", (1, 1));

        // Horizontal markers on the y-axis (Temperatures)
        svg.selectAll("line.horizontal")
           .data(yticks)
           .enter()
           .append("line")
           .attr("x1", label_width + 1)
           .attr("x2", w)
           .attr("y1", function(d, i) {
                if (d != 0) return h - label_height - zero_line - (d*(h-label_height)/max_abs_value);
           })
           .attr("y2", function(d, i) {
                if (d != 0) return h - label_height - zero_line - (d*(h-label_height)/max_abs_value);
           })
           .style("stroke", "gray")
           .style("stroke-dasharray", (1, 1));

        


        // Labels on the y-axis
        svg.selectAll("text.ylabel")
           .data(yticks)
           .enter()
           .append("text")
           .text(function(d, i) {
                return d;
           })
           .attr("x", label_width - 5)
           .attr("y", function(d, i) {
                return h - label_height - zero_line - (d*(h-label_height)/max_abs_value) + h/30/2;
           })
           .attr("text-anchor", "end")
           .attr("font-size", h/30 + "pt");

    
        // Labels on the x-axis (Years)
        svg.selectAll("text.xlabel")
           .data(input)
           .enter()
           .append("text")
           .text(function(d, i) {
                if (i == 0 || i == input.length-2 || (i % Math.floor(input.length / w * 100) == 0 && i < input.length - Math.floor(input.length / w * 100 / 2))) {
                    return d.YEAR;
                }
           })
           .attr("x", function(d, i) {
                if (i == 0 || i == input.length-2 || (i % Math.floor(input.length / w * 100) == 0 && i < input.length - Math.floor(input.length / w * 100 / 2))) {
                    return i*(bar_w+1) + label_width + bar_w/2;
                }
           })
           .attr("y", h - label_height + w/80 + 4)
           .attr("text-anchor", "middle")
           .attr("font-size", w/80 + "pt");
        


        // Baseline
        svg.append("line")
           .attr("x1", label_width)
           .attr("y1", h-label_height-zero_line)
           .attr("x2", w)
           .attr("y2", h-label_height-zero_line)
           .style("stroke", "black");
    };







    function show_heatmap_table(input, selector="#d3js_vis1") {
        d3.select(selector)
          .html("<h4>Heatmap Table: Temperature in °C in " + city + "</h4>")
          .append("table")
          .style("border", "1px solid black")
          .style("text-align", "right")
          .selectAll("tr")
          .data(input)
          .enter()
          .append("tr")
          .html(function(d, i) {
                ret = "";
                ret += "<td>" + d.YEAR + "</td>";
                ret += "<td style=\"background-color: " + color(d.JAN) + "\">" + d.JAN + "</td>";
                ret += "<td style=\"background-color: " + color(d.FEB) + "\">" + d.FEB + "</td>";
                ret += "<td style=\"background-color: " + color(d.MAR) + "\">" + d.MAR + "</td>";
                ret += "<td style=\"background-color: " + color(d.APR) + "\">" + d.APR + "</td>";
                ret += "<td style=\"background-color: " + color(d.MAY) + "\">" + d.MAY + "</td>";
                ret += "<td style=\"background-color: " + color(d.JUN) + "\">" + d.JUN + "</td>";
                ret += "<td style=\"background-color: " + color(d.JUL) + "\">" + d.JUL + "</td>";
                ret += "<td style=\"background-color: " + color(d.AUG) + "\">" + d.AUG + "</td>";
                ret += "<td style=\"background-color: " + color(d.SEP) + "\">" + d.SEP + "</td>";
                ret += "<td style=\"background-color: " + color(d.OCT) + "\">" + d.OCT + "</td>";
                ret += "<td style=\"background-color: " + color(d.NOV) + "\">" + d.NOV + "</td>";
                ret += "<td style=\"background-color: " + color(d.DEC) + "\">" + d.DEC + "</td>";
                return ret;
          });
        
        // Add the header row.
        d3.select(selector + " table")
          .insert("tr", ":first-child")
          .html(function(d, i) {
                return "<tr><th>YEAR</th><th>JAN</th><th>FEB</th><th>MAR</th><th>APR</th><th>MAY</th><th>JUN</th><th>JUL</th><th>AUG</th><th>SEP</th><th>OCT</th><th>NOV</th><th>DEC</th></tr>";
           });

    }

    function show_data(input, selector="#d3js_vis1") {
        d3.select(selector)
          .append("table")
          .style("border", "1px solid black")
          .style("text-align", "right")
          .selectAll("tr")
          .data(input)
          .enter()
          .append("tr")
          .html(function(d, i) {
                return "<td>" + d.YEAR + "</td><td>" + d.JAN + "</td><td>" + d.FEB + "</td><td>" + d.MAR + "</td><td>" + d.APR + "</td><td>" + d.MAY + "</td><td>" + d.JUN + "</td><td>" + d.JUL + "</td><td>" + d.AUG + "</td><td>" + d.SEP + "</td><td>" + d.OCT + "</td><td>" + d.NOV + "</td><td>" + d.DEC + "</td>";
          });

        
    }

    function assv2csv(filepath) {
        // Converts arbitrary space separated values into comma separated values.
        var csv = "";
        $.get(filepath, function(data) {
            data = data.split("\n");
            $(data).each(function(i, d) {
                dv = d.split(" ");
                if (dv.length > 1) {
                    $(dv).each(function(j, value) {
                        if (value != "") {
                            csv += value + ",";
                        }
                    });
                    csv += "\n";
                }
            });
        }, "text");
        alert("This is a distraction box.\nIts sole purpose is to distract you, so this asynchronous piece of s...\n...oftware has time to process everything in the background until it is actually ready.");
        return csv;
    }

    function auto_toc() {
        // Auto ToC
        // Inspired by: http://www.jankoatwarpspeed.com/automatically-generate-table-of-contents-using-jquery/

        $("body").append('<div id="toc"></div>');
        $("#toc").append('<span>Table of Contents</span>');
        $("#toc").append('<ul>');
        $("h2, h3").each(function(i) {
            var current = $(this);
            current.attr("id", "title" + i);
            $("#toc").append("<li><a id='link" + i + "' href='#title" +
                i + "' title='" + current.attr("tagName") + "'>" + 
                current.html() + "</a></li>");
        });
        $("#toc").append('</ul>');
    }

});