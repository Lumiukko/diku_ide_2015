$(document).ready(function() {

    var svg = d3.select("#visbox");
    
    // Layers: Change order to bring layers to front or back.
    svg.append("g").attr("id", "lyr_shots_fired");
    svg.append("g").attr("id", "lyr_player_death");
    svg.append("g").attr("id", "lyr_footsteps");

    d3.json("data/csgo/ESLOneCologne2015-fnatic-vs-envyus-dust2_player_death.json", function(error, data) {
        if (!error) {
            //add_player_deaths(data);
			add_weapon_statistics(data)
        }
        else {
            console.log("Error: " + error);
        }
    });
    
    d3.json("data/csgo/ESLOneCologne2015-fnatic-vs-envyus-dust2_weapon_fired.json", function(error, data) {
        if (!error) {
            //add_shots_fired(data);
			add_weapon_fired_statistics(data)
        }
        else {
            console.log("Error: " + error);
        }
    });
    
    d3.json("data/csgo/ESLOneCologne2015-fnatic-vs-envyus-dust2_player_footstep.json", function(error, data) {
        if (!error) {
            add_footsteps(data);
        }
        else {
            console.log("Error: " + error);
        }
    });
	
		
	/**
		
	*/
	function add_weapon_statistics(data){
		var sides = sort_by_side(data)
		
		var ct_data = sides[0];
		var t_data = sides[1];
		
		var ct_weapon = add_weapon_category(ct_data)
		var t_weapon = add_weapon_category(t_data)

		draw_weapon_bar_chart(ct_weapon, "Counter Terrorists were killed by:", 4, "lightblue");
		draw_weapon_bar_chart(t_weapon, "Terrorists were killed by:", 4, "pink");
				
	}
	/**
		
	*/
	function add_weapon_fired_statistics(data){
		var sides = sort_by_side(data)
		
		var ct_data = sides[0];
		var t_data = sides[1];
		
		var ct_weapon = add_weapon_category(ct_data)
		var t_weapon = add_weapon_category(t_data)

		draw_weapon_bar_chart(ct_weapon, "Counter Terrorists are firing using:", 0.3, "lightblue");
		draw_weapon_bar_chart(t_weapon, "Terrorists are firing using:", 0.3, "pink");
				
	}
	
	/**
		Bar chart of the total number of weapon usage by side
	*/
	function draw_weapon_bar_chart(weapon_data, title, factor, colour){
		var chart_height = weapon_data[0].amount*factor + 25;
		var chart_width = 1024;
		var bar_width = 52.5;
		
		d3.select("#weapon_visbox")
						.append("h4")
						.text(title);
		
		var weapon_chart = d3.select("#weapon_visbox")
							.append("svg")
							.attr("class", "visbox")
							.attr("height", chart_height+"px")
							.attr("width", chart_width+"px");
		
		weapon_chart.selectAll(".bar")
				.data(weapon_data, function(d, i) {return d, i})
				.enter().append("rect")
				.attr("class", "bar")
				.attr("name", function(d) { return (d.name); })
				.attr("x", function(d, i) {return (i * (bar_width+1)); })
				.attr("y", function(d) {return chart_height - (d.amount) * factor ;})
                .attr("width", bar_width+"px")
                .attr("amount", function(d) { return (d.amount); })
                .attr("height", function(d) { return (d.amount) * factor; })
                .attr("stroke", "#000")
				.attr("fill", colour)
				
				//Tooltip
				.on('mouseover', function(d) {
                    tooltip = d3.select("#tooltip_weapon");
                    var mouse_pos = d3.mouse(document.body);
                    tooltip.html("Weapon: " + d.name)
						.style("opacity", "0")
						.style("display", "inline")
						.style("z-index", "1000")
						.style("left", mouse_pos[0]+"px")
						.style("top", mouse_pos[1]+"px")
						.attr("x", mouse_pos)
						.attr("y", mouse_pos)
						.transition()
						.style("opacity", 0.8);
                 })
                 .on("mouseout", function() {
                     d3.select("#tooltip_weapon").style("display", "none");
                 })
				 

				
		weapon_chart.selectAll("text")
				.data(weapon_data)
				.enter()
				.append("text")
				.text(function(d) {return d.amount;})
				.attr("text-anchor", "middle")
				.attr("x", function(d, i) {return i * (bar_width + 1) + (chart_width / 19 ) / 2;})
				.attr("y", function(d) {return chart_height - (d.amount * factor) - 10;})
				.attr("font-family", "sans-serif")
				.attr("font-size", "11px")
				.attr("fill", "white")
				
				//Tooltip
				.on('mouseover', function(d) {
                    tooltip = d3.select("#tooltip_weapon");
                    var mouse_pos = d3.mouse(document.body);
                    tooltip.html("Weapon: " + d.name)
						.style("opacity", "0")
						.style("display", "inline")
						.style("z-index", "1000")
						.style("left", mouse_pos[0]+"px")
						.style("top", mouse_pos[1]+"px")
						.attr("x", mouse_pos)
						.attr("y", mouse_pos)
						.transition()
						.style("opacity", 0.8);
                 })
                 .on("mouseout", function() {
                     d3.select("#tooltip_weapon").style("display", "none");
                 })
	}
	
	
	/**
		Sorts data by side
	*/
	function sort_by_side(data){
		var ct = [];
		var t = [];
        data.forEach(function(entry) {
			if(entry.side == "CT") ct.push(entry)
            else t.push(entry);
        });
		return [ct, t];
	}
	/**
		Sorts the weapons by usage
	*/
	function add_weapon_category(data){
		var categories = [];
        data.forEach(function(entry) {
                categories.push(entry.weapon);
        });
		
		var unique_weapons = {}; 
		categories.forEach(function(i) { unique_weapons[i] = (unique_weapons[i] || 0 ) + 1;  });

		var sortable = [];
		for (var n in unique_weapons)
			  sortable.push([n, unique_weapons[n]])
		sortable.sort(function(a, b) {return b[1] - a[1]})
		
		var sorted_weapons = [];
		sortable.forEach(function(entry) {
			sorted_weapons.push({name:entry[0],amount:entry[1]});

        });

		return sorted_weapons;
	}
    
    
    function add_player_deaths(data) {
        var player_deaths = svg.select("#lyr_player_death")
                               .selectAll("circle.player_death").data(data);
        
        player_deaths.enter()
                     .append("circle")
                     .attr("class", "player_death")
                     .attr("r", 16)
                     .attr("cx", function(d, i) {
                        posx = translate_x(d.position.x);
                        //console.log("posx: " + posx);
                        return posx;
                     })
                     .attr("cy", function(d, i) {
                        posy = translate_y(d.position.y);
                        //console.log("posy: " + posy);
                        return posy;
                     })
                     .attr("fill", function(d, i) {
                        if (d.side == "TERRORIST") {
                            return "fuchsia";
                        }
                        else if (d.side == "CT") {
                            return "lightblue";
                        }
                        else {
                            return "yellow";
                        }
                     })
                     .on("mouseover",function(d, i) {
                        console.log(d);
                     });
    };
    
    
    function add_footsteps(data) {
        var player_deaths = svg.select("#lyr_footsteps")
                               .selectAll("circle.footsteps").data(data);
        
        player_deaths.enter()
                     .append("circle")
                     .attr("class", "footsteps")
                     .attr("r", 2)
                     .attr("cx", function(d, i) {
                        posx = translate_x(d.position.x);
                        //console.log("posx: " + posx);
                        return posx;
                     })
                     .attr("cy", function(d, i) {
                        posy = translate_y(d.position.y);
                        //console.log("posy: " + posy);
                        return posy;
                     })
                     .attr("fill", function(d, i) {
                        if (d.side == "TERRORIST") {
                            return "red";
                        }
                        else if (d.side == "CT") {
                            return "blue";
                        }
                        else {
                            return "yellow";
                        }
                     })
                     .on("mouseover",function(d, i) {
                        console.log(d);
                     });
    };  
    
    
    function add_shots_fired(data) {
        var player_deaths = svg.select("#lyr_shots_fired")
                               .selectAll("circle.shot_fired").data(data);
        
        player_deaths.enter()
                     .append("circle")
                     .attr("class", "shot_fired")
                     .attr("r", function(d, i) {
                        if (d.weapon != "knife") {
                            return 3;
                        }
                        else {
                            return 3;
                        }
                     })
                     .attr("cx", function(d, i) {
                        posx = translate_x(d.position.x);
                        //console.log("posx: " + posx);
                        return posx;
                     })
                     .attr("cy", function(d, i) {
                        posy = translate_y(d.position.y);
                        //console.log("posy: " + posy);
                        return posy;
                     })
                     .attr("fill", function(d, i) {
                        if (d.side == "TERRORIST") {
                            return "red";
                        }
                        else if (d.side == "CT") {
                            return "blue";
                        }
                        else {
                            return "yellow";
                        }
                     })
                     .on("mouseover",function(d, i) {
                        console.log(d);
                     });
    };

    
    function translate_x(x) {
        return        (1024 * (x + 2480) / 4580);
    }
    
    
    function translate_y(y) {
        return 1024 - (1024 * (y + 1130) / 4500);
        //  + 1170
    }
   
    
});