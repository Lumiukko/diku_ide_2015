$(document).ready(function() {

    var ssv = d3.dsv(" ", "text/plain");
    ssv("data/ankara_central.txt", function(data) {
        input = data.map(function (d) {
            return { Year: d["YEAR"], Jan: d["JAN"], Feb: d["FEB"] };
        });
        add_data(input);
    });

    function add_data(input) {
        d3.select("#d3js_vis1")
          .append("table")
          .style("border", "1px solid black")
          .selectAll("tr")
          .data(input)
          .enter()
          .append("tr")
          .html(function(d, i) {
                return "<td>" + d.Year + "</td><td>" + d.Jan + "</td><td>" + d.Feb + "</td>";
          });
    }
    
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
});