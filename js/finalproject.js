$(document).ready(function() {
/**
    ========== INITIALIZATION & GLOBAL VARS ================================================
    This part contains all global variables after the document has been loaded and
    calls the initial functions.
    ========================================================================================
*/
    // Data files.
    file_meta = "data/csgo/ESLOneCologne2015-fnatic-vs-envyus-dust2_meta.json";
    file_player_deaths = "data/csgo/ESLOneCologne2015-fnatic-vs-envyus-dust2_player_death.json";
    file_player_weaponfire = "data/csgo/ESLOneCologne2015-fnatic-vs-envyus-dust2_weapon_fire.json";
    file_player_footsteps = "data/csgo/ESLOneCologne2015-fnatic-vs-envyus-dust2_player_footstep.json";
    
    // Filter (currently player and rounds).
    //     An empty array means that no filer is applied for the category, everything is shown.
    /**
        TODO: Introduce weapon filter that shows ALL data points if specified weapon is used/selected.
              Be careful when applying the filter to the path, since we only take the first element of the
              path for the filtering. This should be re-written to fit our plans before attempting to filter
              it by weapon.
    */
    var filter = {
        "players": ["JW", "apEX"],
        "rounds": ["2", "3"]
    };
    
    var f_round = 31;
    var f_player = "JW";
 
    // Flag whether or not to remove the warmup rounds. (TODO: is this working globally?)
    var remove_warmup = true;
    
    // D3 initial variables
    var svg = d3.select("#visbox");
    
    var lineFunction = d3.svg.line()
                         .x(function(d) { return to_fixed_2(d.x) })
                         .y(function(d) { return to_fixed_2(d.y) })
                         .interpolate("cardinal");
    
    // SVG Layers: Change order to bring layers to front or back.
    svg.append("g").attr("id", "lyr_player_paths");
    svg.append("g").attr("id", "lyr_footsteps");
    svg.append("g").attr("id", "lyr_shots_fired");
    svg.append("g").attr("id", "lyr_player_death");
    
    // Global Variables
    var rounds;
    
    // Start the loading process...
    load_meta_data();
    

/**
    ========== LOADING DATA ================================================================
    These functions are loading the data and calls preprocessing or displaying functions.
    ========================================================================================
*/

    /**
        Loads the meta data of a CS:GO match from the file and calls other dependant
        loading functions. The meta data contains round information.
    */
    function load_meta_data() {
        d3.json(file_meta, function(error, data) {
            if (!error) {
                rounds = {};
                prev_round = -1;
                
                data.forEach(function(entry, i) {
                    if (!(entry.round in rounds)) {
                        rounds[entry.round] = {};
                    }

                    if (entry.event == "game.round_start") {
                        rounds[entry.round]["start"] = entry.tick;
                        if (prev_round != -1) {
                            rounds[prev_round]["end"] = entry.tick;
                        }
                    }
                    else if (entry.event == "game.round_end") {
                        if (i == data.length-1) {
                            rounds[entry.round]["end"] = entry.tick;
                        }
                    }
                    else if (entry.event == "game.round_announce_match_start") {
                        rounds[entry.round].warmup = true;
                    }
                    
                    prev_round = entry.round;
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

    
    /**
        Loads the player deaths of a CS:GO match from the file and calls dependant
        displaying functions.
    */
    function load_player_deaths() {
        d3.json(file_player_deaths, function(error, data) {
            if (!error) {
                add_player_deaths(data);
                add_weapon_death_statistics(data);
            }
            else {
                console.log("Error: " + error);
            }
        });
    }
    
    
    /**
        Loads the player weapon fire events of a CS:GO match from the file and calls
        dependant displaying functions.
    */
    function load_weapon_fire() {        
        d3.json(file_player_weaponfire, function(error, data) {
            if (!error) {
                //add_shots_fired(data);
                add_weapon_fired_statistics(data);
            }
            else {
                console.log("Error: " + error);
            }
        });
    }
    
    
    /**
        Loads the player positions/footsteps of a CS:GO match from the file and calls
        dependant displaying functions. It also removes the warmup round if the flag is set.
    */
    function load_player_footstep() {    
        d3.json(file_player_footsteps, function(error, data) {
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
    
    
/**
    ========== DISPLAY / VISUALIZATION FUNCTONS ============================================
    These functions are function that render data to the SVG element.
    ========================================================================================
*/
    
    /**
        Displays all player paths in the visualization.
        @param {json} data Player footstep data.
    */
    function add_player_paths(player_paths) {
        // Collecting all the paths from all players and rounds in one array.
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
    
        var player_footpaths = svg.select("#lyr_player_paths")
                                  .selectAll("path.player_path")
                                  .data(paths.filter(function (d, i) {
                                     return apply_filter(d[0]);
                                  }));
        
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
    
    
    /**
        Displays all player deaths in the visualization.
        @param {json} data Player death data.
    */
    function add_player_deaths(data) {
        var player_deaths = svg.select("#lyr_player_death")
                               .selectAll("circle.player_death")
                               .data(data.filter(function (d, i) {
                                  d.round = get_round_from_tick(d.tick);
                                  return apply_filter(d);
                               }));
        
        player_deaths.enter()
                     .append("circle")
                     .attr("class", "player_death")
                     .attr("r",  8)
                     .attr("cx", function(d, i) {
                        posx = translate_x(d.position.x);
                        return posx;
                     })
                     .attr("cy", function(d, i) {
                        posy = translate_y(d.position.y);
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
    
    
    /**
        Displays all player positions in the visualization.
        @param {json} data Player footstep data.
    */
    function add_footsteps(data) {
        var player_foot_steps = svg.select("#lyr_footsteps")
                                   .selectAll("circle.footsteps")
                                   .data(data.filter(function (d, i) {
                                      d.round = get_round_from_tick(d.tick);
                                      return apply_filter(d);
                                   }));
        
        player_foot_steps.enter()
                     .append("circle")
                     .attr("class", "footsteps")
                     .attr("r", 4)
                     .attr("cx", function(d, i) {
                        posx = translate_x(d.position.x);
                        return posx;
                     })
                     .attr("cy", function(d, i) {
                        posy = translate_y(d.position.y);
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
    
    
    /**
        Displays all attacks (melee and ranged) visualization.
        @param {json} data Player weapon fired data.
    */
    function add_shots_fired(data) {
        var shots_fired = svg.select("#lyr_shots_fired")
                             .selectAll("circle.shot_fired")
                             .data(data.filter(function (d, i) {
                                d.round = get_round_from_tick(d.tick);
                                return apply_filter(d);
                             }));
        
        shots_fired.enter()
                   .append("circle")
                   .attr("class", "shot_fired")
                   .attr("r", 2)
                   .attr("cx", function(d, i) {
                      posx = translate_x(d.position.x);
                      return posx;
                   })
                   .attr("cy", function(d, i) {
                      posy = translate_y(d.position.y);
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

/**
    ========== UTILITY FUNCTONS ============================================================
    These functions are utility functions.
    ========================================================================================
*/
    
    /**
        Applies the filter as defined in the global variable to a datapoint, i.e.
        returns true if the datapoint is included and false if it is not.
        @param {object} datapoint The datapoint as provided by the dataset, containing at least the attributes to be filtered.
        @return {boolean} Returns true if the data is contained or false if it is filtered out.
    */
    function apply_filter(datapoint) {
        return    ($.inArray(datapoint.round, filter.rounds)   > -1 || filter.rounds.length  == 0)
               && ($.inArray(datapoint.player, filter.players) > -1 || filter.players.length == 0);
    }
    
    
    /**
        Uses the player footstep data and returns an object containing:
        Each player ID as an attribute, where the value contains:
        Each round number as an attribute, where the value contains:
        Array of all positions that player has been in that round.
        @param {json} data The player footsteps data.
        @return {object} The data pre-processed as described.
    */
    function get_player_paths(data) {
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
    
    
    
    /**
        Uses the rounds global variable to determine the corresponding
        round of a given tick.
        @param {int} tick The tick we wish to know the round of.
        @return {int} The round that contains the given tick.
    */
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
    
    
    /**
        Translates the x coordinate from the CS:GO map to the 
        visualization coordinate system.
        @param {float} x The x vector.
        @return {float} The translated x vector.
    */
    function translate_x(x) {
        return        (1024 * (x + 2480) / 4580);
    }
    
    
    /**
        Translates the y coordinate from the CS:GO map to the 
        visualization coordinate system.
        @param {float} y The y vector.
        @return {float} The translated y vector.
    */
    function translate_y(y) {
        return 1024 - (1024 * (y + 1130) / 4500);
    }
    
    
    /**
        Translates the z coordinate from the CS:GO map to the 
        visualization coordinate system.
        @param {float} z The z vector.
        @return {float} The translated z vector.
    */
    function translate_z(z) {
        return z;
    }
    
    
    /**
        Translates a point object containing 3D coordinates and
        the corresponding tick from the CS:GO map coordinate system
        into the coordinate system of the visualization.
        @param {point object} point Point object with x, y, z, and t attributes.
        @return {point object} Point object with x, y, z, and t attributes with translated x, y, and z coordinates.
    */
    function translate_path_point(point) {
        var new_coord = {
            "x": translate_x(point.pos.x),
            "y": translate_y(point.pos.y),
            "z": translate_z(point.pos.z),
            "t": translate_z(point.tick)
        };
        return new_coord;
    }
    
    
    /**
        Shows the tooltip at the current mouse position, which
        displays the HTML code provided.
        @param {html} html The HTML to display in the tooltip.
    */
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
    
    
    /**
        Hides the tooltip.
    */
    function tooltip_hide() {
        d3.select("#tooltip").classed({"hidden": true});
    }
    
    
    /**
        Rounds a floating point number to 2 decimal points.
        This function is a lot faster than toFixed().
        @param {float} number The float to be rounded.
        @return {float} The given number rounded to 2 decimal points.
    */
    function to_fixed_2(number) {
        return Math.round(number * 100) / 100;
    }
    
   
    /**
        Creates a JSON string out of an object, parses it, and stringifies it again
        in order to introduce a nice indentions, aka pretty print.
        @param {object} obj Object to be printed.
        @return {string} Pretty formatted string.
    */
    function stringify_pretty_print(obj) {
        return "<pre>" + JSON.stringify(JSON.parse(JSON.stringify(obj)),null,2) + "</pre>";
    }
    
    
/**
    ========== STATIC WEAPON VISUALIZATION =================================================
    The following code creates and renders the static visualizations.
    ========================================================================================
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
            .style("margin", "auto")
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