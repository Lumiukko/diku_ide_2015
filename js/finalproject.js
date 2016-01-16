$(document).ready(function() {
    var remove_warmup = true;

    var f_round = 3;
    var f_player = "NBK-";
    
    // 36404

    var svg = d3.select("#visbox");
    
    var lineFunction = d3.svg.line()
                         .x(function(d) { return Math.round(d.x).toFixed(2); })
                         .y(function(d) { return Math.round(d.y).toFixed(2); })
                         .interpolate("cardinal");
    
    // Layers: Change order to bring layers to front or back.
    svg.append("g").attr("id", "lyr_footsteps");
    svg.append("g").attr("id", "lyr_player_paths");
    svg.append("g").attr("id", "lyr_shots_fired");
    svg.append("g").attr("id", "lyr_player_death");
    
    var rounds;
    load_meta_data();
    
    
    function load_meta_data() {
        d3.json("data/csgo/ESLOneCologne2015-fnatic-vs-envyus-dust2_meta.json", function(error, data) {
            if (!error) {
                rounds = {};
                data.forEach(function(entry) {
                    
                    if (!(entry.round in rounds)) {
                        rounds[entry.round] = {};
                    }

                    
                    if (entry.event == "game.round_start") {
                        rounds[entry.round]["start"] = entry.tick;
                    }
                    else if (entry.event == "game.round_end") {
                        rounds[entry.round]["end"] = entry.tick;
                    }
                    else if (entry.event == "game.round_announce_match_start") {
                        rounds[entry.round].warmup = true;
                    }
                });

                
                load_player_deaths();
                load_weapon_fire();
                load_player_footstep();
            }
            else {
                console.log("Error: " + error);
            }
        });
    }

    
    function load_player_deaths() {
        d3.json("data/csgo/ESLOneCologne2015-fnatic-vs-envyus-dust2_player_death.json", function(error, data) {
            if (!error) {
                add_player_deaths(data);
                add_weapon_death_statistics(data);
            }
            else {
                console.log("Error: " + error);
            }
        });
    }
    
    function load_weapon_fire() {        
        d3.json("data/csgo/ESLOneCologne2015-fnatic-vs-envyus-dust2_weapon_fire.json", function(error, data) {
            if (!error) {
                //add_shots_fired(data);
                add_weapon_fired_statistics(data);
            }
            else {
                console.log("Error: " + error);
            }
        });
    }
    
    function load_player_footstep() {    
        d3.json("data/csgo/ESLOneCologne2015-fnatic-vs-envyus-dust2_player_footstep.json", function(error, data) {
            if (!error) {
                var player_paths = get_player_paths(data);
                
                // Remove warmup round if set in the remove_warmup variable.
                if (remove_warmup) {
                    for (var r in rounds) {
                        if (rounds.hasOwnProperty(r)) {
                            if (rounds[r].warmup) {
                                for (var p in player_paths) {
                                    if (player_paths.hasOwnProperty(p)) {
                                        delete player_paths[p][r];
                                    }
                                }
                            }
                        }
                    }
                }
                
                add_player_paths(player_paths);
                add_footsteps(data);
            }
            else {
                console.log("Error: " + error);
            }
        });
    }
    
    
    function add_player_paths(player_paths) {
        paths = [];
        for (var p in player_paths) {
            if (player_paths.hasOwnProperty(p)) {
                for (var r in player_paths[p]) {
                    if (player_paths[p].hasOwnProperty(r)) {
                        if (player_paths[p][r].length > 0) {
                            paths.push(player_paths[p][r]);
                        }
                    }
                }
            }
        }
    
        var player_footpaths = svg.select("#lyr_player_paths").selectAll("path.player_path").data(paths);
        
        player_footpaths.enter()
                        .append("path")
                        .attr("class", "player_path")
                        .style("stroke", function(d, i) {
                            if (d[0].side == "TERRORIST") {
                                return "red";
                            }
                            else if (d[0].side == "CT") {
                                return "blue";
                            }
                        })
                        .attr("d", function(d, i) {
                            if (d[0].round != f_round || d[0].player != f_player) return [];
                             var translated = d.map(translate_path_point);
                             return lineFunction(translated);
                        })
                        .on("mouseover", function(d, i) {
                            important_info = {
                                "side": d[0].side,
                                "player": d[0].player,
                                "round" : d[0].round
                            }
                            tooltip_show(stringify_pretty_print(important_info));
                        })
                        .on("mouseout", function(d, i) {
                            tooltip_hide();
                        });
    }
    
    
    
    function add_player_deaths(data) {
        var player_deaths = svg.select("#lyr_player_death")
                               .selectAll("circle.player_death").data(data);
        
        player_deaths.enter()
                     .append("circle")
                     .attr("class", "player_death")
                     .attr("r", function(d, i) {
                        if (d.round == f_round && d.player == f_player) {
                            return 8;
                        }
                        else {
                            return 0;
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
                            return "#990000";
                        }
                        else if (d.side == "CT") {
                            return "#000066";
                        }
                        else {
                            return "black";
                        }
                     })
                     .on("mouseover", function(d, i) {
                        tooltip_show(stringify_pretty_print(d));
                     })
                     .on("mouseout", function(d, i) {
                        tooltip_hide();
                     });
    };
    
    
    function add_footsteps(data) {
        var player_foot_steps = svg.select("#lyr_footsteps")
                                   .selectAll("circle.footsteps").data(data);
        
        player_foot_steps.enter()
                     .append("circle")
                     .attr("class", "footsteps")
                     .attr("r", function (d, i) {
                        if (d.round == f_round && d.player == f_player) {
                            return 4;
                        }
                        else if (d.round == f_round && d.player != f_player) {
                            return 0;
                        }
                        else {
                            return 0;
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
                     .on("mouseover", function(d, i) {
                       tooltip_show(stringify_pretty_print(d));
                     })
                     .on("mouseout", function(d, i) {
                       tooltip_hide();
                     });
    };  
    
    
    function add_shots_fired(data) {
        var shots_fired = svg.select("#lyr_shots_fired")
                             .selectAll("circle.shot_fired").data(data);
        
        shots_fired.enter()
                   .append("circle")
                   .attr("class", "shot_fired")
                   .attr("r", function(d, i) {
                      if (d.weapon != "knife") {
                          return 2;
                      }
                      else {
                          return 0;
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
                          return "yellow";
                      }
                      else if (d.side == "CT") {
                          return "lime";
                      }
                      else {
                          return "black";
                      }
                   })
                   .on("mouseover", function(d, i) {
                      tooltip_show(stringify_pretty_print(d));
                   })
                   .on("mouseout", function(d, i) {
                      tooltip_hide();
                   });
    };

    
    function get_player_paths(data) {
        /**
            player_paths is an object with player names as keys
            each player key contains a list, where each entry
            corresponds to one round. each round is a list of steps
            that particular player made.
        */
        var player_paths = {};
        
        data.forEach(function (entry) {
            // check for round end and create new path
            var round_current = get_round_from_tick(entry.tick);
            if (round_current == undefined) {
                round_current = 1;
            }
            
            if (!(entry.uid in player_paths)) {
                player_paths[entry.uid] = {};
                for (var r in rounds) {
                    if (rounds.hasOwnProperty(r)) {
                        player_paths[entry.uid][r] = []
                    }
                }
            }
           
            player_paths[entry.uid][round_current].push({
                "tick": entry.tick,
                "pos": entry.position,
                "player": entry.player,
                "side": entry.side,
                "round": round_current
            });
        });
        
        return player_paths;
    }
    
    
    function get_round_from_tick(tick) {
        for (var r in rounds) {
            if (rounds.hasOwnProperty(r)) {
                if (tick >= rounds[r].start && tick <= rounds[r].end) {
                    return r;
                }
            }
        }
        return undefined;
    }
    
    
    function translate_x(x) {
        return        (1024 * (x + 2480) / 4580);
    }
    
    
    function translate_y(y) {
        return 1024 - (1024 * (y + 1130) / 4500);
    }
    
    function translate_z(z) {
        return z;
    }
    
    function translate_path_point(point) {
        var new_coord = {
            "x": translate_x(point.pos.x),
            "y": translate_y(point.pos.y),
            "z": translate_z(point.pos.z),
            "t": translate_z(point.tick)
        };
        return new_coord;
    }
    
    
    function tooltip_show(html) {
        offset_x = 12;
        offset_y = -22;
        pos = d3.mouse(document.body);
        d3.select("#tooltip")
          .html(html)
          .style("left", pos[0] + offset_x)
          .style("top", pos[1] + offset_y)
          .classed({"hidden": false});
        
    }
    
    
    function tooltip_hide() {
        d3.select("#tooltip").classed({"hidden": true});
    }
   
   
    function stringify_pretty_print(obj) {
        // This function creates a JSON string out of an object, parsses it, and
        // stringifies it again to introduce a nice indentions, aka pretty print.
        return "<pre>" + JSON.stringify(JSON.parse(JSON.stringify(obj)),null,2) + "</pre>";
    }
    
    
    /**
            ================  Weapon Visualization ================================
    */
    
    /**
        
    */
    function add_weapon_death_statistics(data){
        var sides = sort_by_side(data)
        
        var ct_data = sides[0];
        var t_data = sides[1];
        
        var ct_weapon = add_weapon_category(ct_data, "killed_by")
        var t_weapon = add_weapon_category(t_data, "killed_by")

        draw_weapon_bar_chart(ct_weapon, "Counter Terrorists were killed by:", 4, "lightblue");
        draw_weapon_bar_chart(t_weapon, "Terrorists were killed by:", 4, "pink");
                
    }
    /**
        
    */
    function add_weapon_fired_statistics(data){
        var sides = sort_by_side(data)
        
        var ct_data = sides[0];
        var t_data = sides[1];
        
        var ct_weapon = add_weapon_category(ct_data, "weapon")
        var t_weapon = add_weapon_category(t_data, "weapon")

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
			.style("display", "inline-block")
			.style("width", "300px")
            .text(title);
                        
        var show_chart_btn = d3.select("#weapon_visbox")
                                .append("button")
                                .attr("class", "show_chart_btn")
                                .text("Show chart")
								.on("click", function(){
									if (d3.select(this).text() === "Hide chart") {
										d3.select(this).text("Show chart");
										weapon_chart.style("display", "none")
									} else {
										d3.select(this).text("Hide chart");
										weapon_chart.style("display", "block")
									}
								});
        
        var weapon_chart = d3.select("#weapon_visbox")
                            .append("svg")
							.style("display", "none")
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
    function add_weapon_category(data, object_name){
        var categories = [];
        data.forEach(function(entry) {
                categories.push(entry[object_name]);
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
    
});