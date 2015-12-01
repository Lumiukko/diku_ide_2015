$(document).ready(function() {
    hands = undefined;
    pcs = undefined;

    load_hands();
    load_hand_pcs();

    draw_stuff();

    function plot_scatter() {
        if (pcs === undefined) return;
        
        var h = 300;
        var w = 300;        
        
        var x_values = [];
        pcs.forEach(function (d){ x_values.push(d[0]); });
        var y_values = [];
        pcs.forEach(function (d){ y_values.push(d[1]); });
        
        var max_x = d3.max(x_values);
        var min_x = d3.min(x_values);
        var max_y = d3.max(y_values);
        var min_y = d3.min(y_values);
        
        var svg = d3.select("#scattervis")
                    .attr("width", w+20)
                    .attr("height", h+20)
                    .style("border", "1px solid black");
        
        svg.selectAll("circle.scatterpoint")
           .data(pcs)
           .enter()
           .append("circle")
           .attr("cx", function(d, i) {
               var x=(d[0] - min_x) * (w - 0) / (max_x - min_x) + 0; console.log(x);return x;
           })
           .attr("cy", function(d, i) {
               var y=(d[1] - min_y) * (h - 0) / (max_y - min_y) + 0; console.log(y);return y;
           })
           .attr("r", 3);
    }

    function draw_stuff() {
        if (hands != undefined) {
            console.log(hands)
        }
    }

    function load_hands() {       
        $.get("data/hands.csv", function (fcontent) {
            data = d3.csv.parseRows(fcontent);
            hdata = [];
            $(data).each(function(i, d) {
                d = d.map(parseFloat);
                xs = d.slice(0, 56);
                ys = d.slice(56, 112);
                hdata.push([xs, ys]);
            });
            hands = hdata;
            // @Bogdan: You can call callback functions here and use the global variable "hands[index]".
            draw_stuff(); // EXAMPLE
        }, "text");
    };

    function load_hand_pcs() {
        $.get("data/hands_pca.csv", function (fcontent) {
            data = d3.csv.parseRows(fcontent);
            pcsdata = []
            $(data).each(function(i, d) {
                pcsdata.push([parseFloat(d[0]), parseFloat(d[1])]);
            });
            pcs = pcsdata;
            plot_scatter();
        }, "text");
    }

    

});