$(document).ready(function() { 
    auto_toc();
   
    var color = d3.scale.linear()
                  .domain([-10, 5, 30, 900])
                  .range(["blue", "lightblue", "red", "yellow"]);

    var csv = assv2csv("data/ankara_central.txt");
    data = d3.csv.parse(csv);
    //$("#d3js_vis1").append(JSON.stringify(data));
    //show_data(data);
    show_heatmap_table(data);
    

    function show_heatmap_table(input) {
        d3.select("#d3js_vis1")
          .html("<h4>Temperateure in Dregee Celsius in Ankara, Turkey</h4>")
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
    }

    function show_data(input) {
        d3.select("#d3js_vis1")
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