var hand_hover;
var h = 300;
var w = 300;    
var margin = 20;
var circle_radius = 5;
$(document).ready(function() {
    hands = [];
    pcs = undefined;

    load_hands();
    load_hand_pcs();
	

    function plot_scatter(draw_axis) {        
        
        var y_axis_pc = parseInt(d3.select("#y_axis_dim").node().value, 10);
        var x_axis_pc = parseInt(d3.select("#x_axis_dim").node().value, 10);
        
        var values_flat_abs = [];
        pcs.forEach(function (d){ values_flat_abs.push(Math.abs(d[x_axis_pc])); });
        pcs.forEach(function (d){ values_flat_abs.push(Math.abs(d[y_axis_pc])); });
        var x_values = [];
        pcs.forEach(function (d){ x_values.push(d[x_axis_pc]); });
        var y_values = [];
        pcs.forEach(function (d){ y_values.push(d[y_axis_pc]); });
        
        var max_x = d3.max(x_values);
        var min_x = d3.min(x_values);
        var max_y = d3.max(y_values);
        var min_y = d3.min(y_values);
		
		var max_abs = d3.max(values_flat_abs);
        
        var svg = d3.select("#scattervis")
                    .attr("width", w+margin)
                    .attr("height", h+margin)
                    .style("border", "1px solid black")
					.style("background-color", "white")
					.call(d3.behavior.zoom().scaleExtent([1, 4]).on("zoom", function () {
						svg.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")")
					  }));

		if (draw_axis) {
            // y-axis
            svg.append("line")
               .attr("x1", (w+margin/2)/2)
               .attr("x2", (w+margin/2)/2)
               .attr("y1", h+margin/2)
               .attr("y2", 0+margin/2)
               .style("stroke", "black")
               .attr('marker-end', "url(#arrow_head)");
            // x-axis
            svg.append("line")
               .attr("x1", 0+margin/2)
               .attr("x2", w+margin/2)
               .attr("y1", (h+margin/2)/2)
               .attr("y2", (h+margin/2)/2)
               .style("stroke", "black")
               .attr('marker-end', "url(#arrow_head)");
        }
        // label
        svg.selectAll("text").remove();
        svg.append("text")
           .attr("class", "axislabel")
           .attr("x", ((w+margin)/2)+5)
           .attr("y", (0+margin/2)+5)
           .style("font-size", 10)
           .text("PC "+(y_axis_pc+1));
        svg.append("text")
           .attr("class", "axislabel")
           .attr("x", (w+margin/2))
           .attr("y", (h+margin)/2+15)
           .style("font-size", 10)
           .text("PC "+(x_axis_pc+1))
           .attr("text-anchor", "end");

        function transscale(x) {
            return (x*h)/(max_abs*2) + (h/2);   
        }
		
		
		var points = svg.selectAll("circle").data(pcs);
		
		points.enter()
              .append("circle")
              .attr("id", function(d, i) {
                return "p" + i;
              })
              .attr("stroke", "black")
              .attr("r", 0)
              .attr("cx", function(d, i) {
                return transscale(d[x_axis_pc]) - circle_radius + margin/2;
              })
              .attr("cy", function(d, i) {
                return h + margin/2 - transscale(d[y_axis_pc]) - circle_radius;
              })
              .attr("fill-opacity", "0.6");
        
        points.transition()
              .attr("cx", function(d, i) {
                return transscale(d[x_axis_pc]) - circle_radius + margin/2;
              })
              .attr("cy", function(d, i) {
                return h + margin/2 - transscale(d[y_axis_pc]) - circle_radius;
              })
              .attr("r", circle_radius);
        
        points.on("mouseover",function(d, i) {
                hand_hover(i);
              })
              .on("mouseout", function() {
                d3.select("#tooltip_scattervis").style("display", "none");
              });
        points.exit().remove();
		//clustering
        // deep copy pcs, because k_means sometimes messes with it
        var pcs_copy = jQuery.extend(true, [], pcs);
		var clusters = k_means(pcs_copy)
		cluster_one = []
		cluster_two = []
		cluster_three = []
		clusters[0].forEach(function(entry) {
				cluster_one.push(entry);
		});
		clusters[1].forEach(function(entry) {
				cluster_two.push(entry);
		});
		clusters[2].forEach(function(entry) {
				cluster_three.push(entry);
		});

		draw_clusters(cluster_one, "green", points)
		draw_clusters(cluster_two, "red", points)
		draw_clusters(cluster_three, "blue", points)
		
	    draw_hand(0);
        hand_hover(0);
    }
	
	function draw_clusters(cluster, colour, points){
	   cluster.forEach(function(entry){
			d3.select(points[0][entry]).attr("fill",colour);
	   })		
	};
	

    hand_hover = function(i) {
        var y_axis_pc = parseInt(d3.select("#y_axis_dim").node().value, 10);
        var x_axis_pc = parseInt(d3.select("#x_axis_dim").node().value, 10);
        d = pcs[i];
        // draw respective hand
        update_hand(i);
        // highlight PCA point
        d3.selectAll("circle")
          .sort(function (a, b) {  // Reordering to bring the selected point to the top.
              if (a != d) return -1;
              else return 1;
          })
          .classed({"highlighted": false});
        d3.select("#p" + i).classed({"highlighted": true});


        // show tooltip
        mouse_pos = d3.mouse(document.body);
        d3.select("#tooltip_scattervis p")
          .html("Hand Index: "+i+"<br />("+d[x_axis_pc]+", "+d[y_axis_pc]+")");
        d3.select("#tooltip_scattervis")
          .style("opacity", "0")
          .style("display", "inline")
		  .style("z-index", "1000")
          .style("left", mouse_pos[0]+"px")
          .style("top", mouse_pos[1]+"px")
          .transition()
          .style("opacity", 0.8);
    };


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
            plot_scatter(true);
        }, "text");
    }
    
    // render PCA dimension selection fields
    function render_dim_selection(axis) {
        axis_default_pc = {
          'x_axis': 0,  
          'y_axis': 1,  
        };
        d3.select("#"+axis+"_dim")
          .selectAll("option")
          .data(pcs)
          .enter()
          .append("option")
          .attr("value", function(d, i){
              return i;
          })
          .text(function(d, i){
              return 'PC '+(i+1);
          });
        d3.select("#"+axis+"_dim")
          .attr("disabled", null)
          .property("value", axis_default_pc[axis])
          .on("change", plot_scatter);
    }
	
	function draw_hand(index){
		var width = 320
		var height = 320	
	
		var svg = d3.select("#handvis")
			.attr("width", width)
			.attr("height", height)
			.style("border", "1px solid black")
			.style("background-color", "white");
	
		var lineGraph = svg.append("path")
		  .attr("stroke", "#FEB186")
		  .attr("stroke-width", 1)
		  .attr("fill", "#FFCC99")
		  .attr("opacity", "0.6");

        update_hand(index);
	};
	
    function update_hand(index) {    
        var lineFunction = d3.svg.line()
		  .x(function(d) { return d[0]; })
		  .y(function(d) { return d[1]; })
		  .interpolate("cardinal");

        d3.select("svg path")
          .attr("transform", "translate(-50,-10)")
          .transition()
          .attr("d", lineFunction(hands[index]))
          .duration(500);
    };
	
	function k_means(data){
		var km = new kMeans({
			K: 3
		});

		km.cluster(data);
		while (km.step()) {
			km.findClosestCentroids();
			km.moveCentroids();

			if(km.hasConverged()) break;
		}
		return km.clusters
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