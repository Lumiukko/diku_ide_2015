$(document).ready(function() { 
    auto_toc();
   
    var csv = assv2csv("data/ankara_central.txt");
    data = d3.csv.parse(csv);
    //$("#d3js_vis1").append(JSON.stringify(data));
    show_data(data);




    function show_data(input) {
        d3.select("#d3js_vis1")
          .append("table")
          .style("border", "1px solid black")
          .selectAll("tr")
          .data(input)
          .enter()
          .append("tr")
          .html(function(d, i) {
                return "<td>" + d.YEAR + "</td><td>" + d.JAN + "</td><td>" + d.FEB + "</td>";
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
                            csv = csv + value + ",";
                        }
                    });
                    csv = csv + "\n";
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