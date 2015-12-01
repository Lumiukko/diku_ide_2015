$(document).ready(function() {
    hands = undefined;
    pcs = undefined;

    load_hands();
    load_hand_pcs();
	

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
            draw_hand(hands[0]);
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
	
	function draw_hand(points){
		var w = 600
		var h = 600
		
		var x = points[0].map(function(x) { return x * 150; });
		var y = points[1].map(function(y) { return y * 150; });
		var hand_points = zip([x,y])
	
		var svg = d3.select("#handvis")
			.append("svg")
			.attr("width", w)
			.attr("height", h)
			.style("border", "1px solid black");
	
		var lineFunction = d3.svg.line()
		  .x(function(d) { return d[0]; })
		  .y(function(d) { return d[1]; })
		  .interpolate("cardinal");

		var lineGraph = svg.append("path")
		  .attr("d", lineFunction(hand_points))
		  .attr("stroke", "red")
		  .attr("stroke-width", 1)
		  .attr("fill", "pink")
		  .attr("opacity", "0.6");
	
	};
	
	function zip(arrays) {
    return arrays.reduce(function (acc, arr, i) {
        while (acc.length < arr.length) {
            acc.push([]);
        }
        for (var j = 0; j < arr.length; ++j) {
            acc[j][i] = arr[j];
        }
        return acc;
    }, []);
	};
    

});