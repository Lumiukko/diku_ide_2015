$(document).ready(function() {
    hands = [];
	hand_index = 0;
    pcs = undefined;

    load_hands();
    load_hand_pcs();
	

    function plot_scatter() {        
        var h = 300;
        var w = 300;    
        var margin = 20;
        var values_flat_abs = [];
        pcs.forEach(function (d){ values_flat_abs.push(Math.abs(d[0])); });
        var x_values = [];
        pcs.forEach(function (d){ x_values.push(d[0]); });
        var y_values = [];
        pcs.forEach(function (d){ y_values.push(d[1]); });
        
        var max_x = d3.max(x_values);
        var min_x = d3.min(x_values);
        var max_y = d3.max(y_values);
        var min_y = d3.min(y_values);
        
        var max_abs = d3.max(values_flat_abs);
        
        var svg = d3.select("#scattervis")
                    .attr("width", w+margin)
                    .attr("height", h+margin)
                    .style("border", "1px solid black")
                    .style("background-color", "white");
        
        function transscale(x) {
            return (x*h)/(max_abs*2) + (h/2);   
        }
        
        // y-axis
        svg.append("line")
           .attr("x1", (w+margin)/2)
           .attr("x2", (w+margin)/2)
           .attr("y1", h+margin/2)
           .attr("y2", 0+margin/2)
           .style("stroke", "black")
           .attr('marker-end', "url(#arrow_head)");
        svg.append("text")
           .attr("x", ((w+margin)/2)+5)
           .attr("y", (0+margin/2)+5)
           .style("font-size", 10)
           .text("PCA2");
        // x-axis
        svg.append("line")
           .attr("x1", 0+margin/2)
           .attr("x2", w+margin/2)
           .attr("y1", (h+margin)/2)
           .attr("y2", (h+margin)/2)
           .style("stroke", "black")
           .attr('marker-end', "url(#arrow_head)");
        svg.append("text")
           .attr("x", (w+margin/2)-15)
           .attr("y", (h+margin)/2+15)
           .style("font-size", 10)
           .text("PCA1");
        
        svg.selectAll("circle.scatterpoint")
           .data(pcs)
           .enter()
           .append("circle")
           .attr("cx", function(d, i) {
               return transscale(d[0]);
           })
           .attr("cy", function(d, i) {
               return h - transscale(d[1]);
           })
           .attr("r", 5)
           .attr("stroke", "black")
           .attr("fill", "blue")
           .attr("fill-opacity", "0.5")		    
		   .on("mouseover",function(d, i) {
                // draw respective hand
                $("#handvis").empty();
                draw_hand(i);
                // highlight PCA point
                d3.selectAll("circle")
                  .sort(function (a, b) {  // Reordering to bring the selected point to the top.
                      if (a != d) return -1;
                      else return 1;
                  })
                  .attr("fill", "blue");
                $(this).attr("fill", "yellow");
                // show tooltip
                mouse_pos = d3.mouse(document.body);
                d3.select("#tooltip_scattervis p")
                  .html("Hand Index: "+i+"<br />("+d[0]+", "+d[1]+")");
                d3.select("#tooltip_scattervis")
                  .style("opacity", "0")
                  .style("display", "inline")
                  .style("left", mouse_pos[0]+"px")
                  .style("top", mouse_pos[1]+"px")
                  .transition()
                  .style("opacity", 0.8);
			}).on("mouseout", function() {
                d3.select("#tooltip_scattervis").style("display", "none");
            });
		   
	    draw_hand(0);
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

			for (var i in hdata) {
				var points = hdata[i]
				var x = points[0].map(function(x) { return x * 300; });
				var y = points[1].map(function(y) { return y * 300; });
				hands.push(zip([x,y]))
			}
        }, "text");
    };


    function load_hand_pcs() {
        $.get("data/hands_pca.csv", function (fcontent) {
            data = d3.csv.parseRows(fcontent);
            pcsdata = []
            $(data).each(function(i, d) {
                var hand_data = [];
                $(d).each(function(i, d) {
                    hand_data.push(parseFloat(d));    
                });
                pcsdata.push(hand_data);
            });
            pcs = pcsdata;
            render_dim_selection("x_axis");
            render_dim_selection("y_axis");
            plot_scatter();
        }, "text");
    }
    
    // render PCA dimension selection fields
    function render_dim_selection(axis) {
        d3.select("#"+axis+"_dim")
          .selectAll("option")
          .data(pcs)
          .enter()
          .append("option")
          .attr("value", function(d, i){
              return i;
          })
          .text(function(d, i){
              return 'PCA Dimension '+i;
          });
        d3.select("#"+axis+"_dim")
          .attr("disabled", null);
    }
	
	function draw_hand(index){
		var width = 320
		var height = 320	
	
		var svg = d3.select("#handvis")
			.attr("width", width)
			.attr("height", height)
			.style("border", "1px solid black")
			.style("background-color", "white");

		var lineFunction = d3.svg.line()
		  .x(function(d) { return d[0]; })
		  .y(function(d) { return d[1]; })
		  .interpolate("cardinal");
	

		var lineGraph = svg.append("path")
		  .attr("d", lineFunction(hands[index]))
		  .attr("stroke", "#FEB186")
		  .attr("stroke-width", 1)
		  .attr("fill", "#FFCC99")
		  .attr("transform", "translate(-50,-10)")
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