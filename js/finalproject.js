var redraw;

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
    //     Controls what is actually displayed.
    //     The default filter is only applied if no filter has been defined before.
    //     An empty array means that no filter is applied for the category, everything is shown.
    if (filter == undefined)
    var filter = {
        "render_foot_steps": false,
        "render_foot_paths": true,
        "render_weapon_fire": true,
        "render_player_deaths": true,
        "render_weapon_areas": false,
        "weapon_area_resolution": 32,
        "weapon_area_show_empty_bins": false,
        "players": [],
        "rounds": [1],
        "sides": [],
        "replay": false,
        "replay_interval": [4990, 11448],
        "tick_interval_size": 200,
        "tick_interval": [],
        "background": 0
    };
    
    // Color mapping for weapon categories:
    var weapon_category_color = {
        "pistol": "blue",
        "melee": "white",
        "rifle": "red",
        "sniper": "yellow",
        "smg": "fuchsia",
        "bomb": "#ff99cc",
        "throwable": "green",
        "mg": "orange",
        undefined: "black"
    }
  
   
    // D3 initial variables
    var svg = d3.select("#visbox");
    var background_images = [
        "./img/de_dust2_radar.png",
        "./img/dust2_overview_bomb.jpg",
        "./img/dust2_overview_css.png"
    ];
    // Add background image to SVG.
    svg.append("svg:image")
       .attr("x", 0)
       .attr("y", 0)
       .attr("width", "1024px")
       .attr("height", "1024px")
       .attr("xlink:href", background_images[filter.background])
    
    // line function used to plot player paths
    var lineFunction = d3.svg.line()
                         .x(function(d) { return to_fixed_2(d.x) })
                         .y(function(d) { return to_fixed_2(d.y) })
                         .interpolate("cardinal");
      
    
    // Global Variables
    var rounds;
    var complete_player_deaths_data;
    var complete_weapon_fire_data;
    var complete_footstep_data;
    
    // Start the loading process...
    add_layers();
    load_meta_data();
    
    
    
    /**
        Appends layers to the svg
    */
    function add_layers(){
        // SVG Layers: Change order to bring layers to front or back.
		svg.append("g").attr("id", "lyr_weapon_areas");
        svg.append("g").attr("id", "lyr_player_paths");
        svg.append("g").attr("id", "lyr_footsteps");
        svg.append("g").attr("id", "lyr_player_death");
        svg.append("g").attr("id", "lyr_shots_fired");
    }
    
    
    d3.select("#transition_test").on("click", function() {
        new_filter = clone(filter);
        new_filter.render_player_deaths = !new_filter.render_player_deaths;
        new_filter.render_weapon_areas = !new_filter.render_weapon_areas;
        redraw(new_filter);
        console.log(redraw);
    });
    
    redraw = function redraw(new_filter) {
        filter = new_filter;
        if (filter.replay) {
            if (filter.tick_interval.length < 2) {
                filter.tick_interval = [filter.replay_interval[0], filter.replay_interval[0] + filter.tick_interval_size];
            }
  
            setTimeout(function() {
                if (filter.replay) {
                    $("#replay_tick").html(JSON.stringify(filter.tick_interval));
                    draw_frame();
                    if (filter.tick_interval[1] > filter.replay_interval[1]) {
                        filter.tick_interval = [
                            Math.round(filter.replay_interval[0]),
                            Math.round(filter.replay_interval[0] + filter.tick_interval_size)
                        ];
                    }
                    else {
                        filter.tick_interval = [
                            Math.round(filter.tick_interval[0] + filter.tick_interval_size/3),
                            Math.round(filter.tick_interval[1] + filter.tick_interval_size/3)
                        ];
                    }
                }
                redraw(filter);
            }, (filter.tick_interval_size/64*1000/3));
        }
        else {
            $("#replay_tick").html("-");
            draw_frame();
        }
    }
    
    function draw_frame() {
        data_player_death = complete_player_deaths_data.filter(function (d, i) { return apply_filter(d); });
        data_footsteps = complete_footstep_data.filter(function (d, i) { return apply_filter(d); });
        data_weapon_fire = complete_weapon_fire_data.filter(function (d, i) { return apply_filter(d); });
        
        add_player_deaths((filter.render_player_deaths ? data_player_death : undefined));
        add_shots_fired((filter.render_weapon_fire ? data_weapon_fire : undefined));
        add_player_paths((filter.render_foot_paths ? data_footsteps : undefined));
        add_footsteps((filter.render_foot_steps ? data_footsteps : undefined));
        add_weapon_areas((filter.render_weapon_areas ? data_footsteps : undefined));
    }

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
                complete_player_deaths_data = [];
                data.forEach(function(entry, i) {
                    if (get_round_from_tick(entry.tick) !== undefined) {
                        entry.event_type = 'player_death';
                        complete_player_deaths_data.push(entry);
                    }
                });
                
                if (filter.render_player_deaths) {
                    data_player_death = complete_player_deaths_data.filter(function (d, i) { return apply_filter(d); });
                    add_player_deaths(data_player_death);
                }
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
                complete_weapon_fire_data = [];
                data.forEach(function(entry, i) {
                    if (get_round_from_tick(entry.tick) != undefined)
                        complete_weapon_fire_data.push(entry);
                });
                
                if (filter.render_weapon_fire) {
                    data_weapon_fire = complete_weapon_fire_data.filter(function (d, i) { return apply_filter(d); });
                    add_shots_fired(data_weapon_fire);
                }
                add_weapon_fired_statistics(data);
            }
            else {
                console.log("Error: " + error);
            }
        });
    }
    
    
    /**
        Loads the player positions/footsteps of a CS:GO match from the file and calls
        dependant displaying functions.
    */
    function load_player_footstep() {    
        d3.json(file_player_footsteps, function(error, data) {
            if (!error) {
                complete_footstep_data = [];
                data.forEach(function(entry, i) {
                    if (get_round_from_tick(entry.tick) != undefined)
                        complete_footstep_data.push(entry);
                });
                
                data_footsteps = complete_footstep_data.filter(function (d, i) { return apply_filter(d); });
                
                if (filter.render_foot_paths) {
                    add_player_paths(data_footsteps);
                }
                if (filter.render_foot_steps) {
                    add_footsteps(data_footsteps);
                }
                if (filter.render_weapon_areas) {
                    add_weapon_areas(data_footsteps);
                }
                
                if (typeof update_page === "function") {
                    update_page(false);
                }
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
        Displays the weapon areas in the visualization.
        @param {json} data The foot steps data.
    */
    function add_weapon_areas(data_filtered) {
        if (data_filtered == undefined) {
            bin_weapons = [];
        }
        else {
            // calculate the intervals!
            var bin_offsets = []
            var bin_size = 1024 / filter.weapon_area_resolution;
            for (var i=0; i<1024; i+=bin_size) {
                bin_offsets.push([i, i+bin_size]);
            }
            
            // prepare the bins!
            var bin = [];
            for (bx in bin_offsets) {
                bin.push([]);
                for (by in bin_offsets) {
                    bin[bin.length-1].push({});
                }
            }
            
            // fill the bins!
            data_filtered.forEach(function(d, i) {
                var current_weapon = d.weapon;
                var bin_x = -1;
                var bin_y = -1;
                bin_offsets.forEach(function(bin_offset, bin_number) {
                    if (translate_x(d.position.x) > bin_offset[0] && translate_x(d.position.x) <= bin_offset[1]) {
                        bin_x = bin_number;
                    }
                    if (translate_y(d.position.y) > bin_offset[0] && translate_y(d.position.y) <= bin_offset[1]) {
                        bin_y = bin_number;
                    }
                });
                
                // outcomment this for binning by weapon name,
                // note that there are no color codes for specific weapon names
                current_weapon = get_weapon_category(current_weapon);
                
                if (bin[bin_x][bin_y][current_weapon] == undefined) {
                    bin[bin_x][bin_y][current_weapon] = 0;
                }
                bin[bin_x][bin_y][current_weapon]++;
            });
            
            // sort the bin contents!
            bin_weapons = [];
            for (bx in bin_offsets) {
                for (by in bin_offsets) {
                    var current_bin = bin[bx][by];
                    
                    var weapons = Object.keys(current_bin).map(function(key) {
                        return [key, current_bin[key]];
                    });
                    weapons.sort(function(f, s) {
                        return s[1] - f[1];
                    });
                    weapons = {"x": bx, "y": by, "wbin": weapons};
                    bin_weapons.push(weapons);
                }
            }
        }
        
        
        bin_weapons_filtered = bin_weapons.filter(function (wbin) {
                                    return (wbin.wbin.length > 0);
                                });
        
        // plot the squares!
        var bin_squares = svg.select("#lyr_weapon_areas")
                             .selectAll("rect.weapon_area")
                             .data((filter.weapon_area_show_empty_bins ? bin_weapons : bin_weapons_filtered));

        bin_squares.exit().remove();
                             
        bin_squares.enter()
                   .append("rect")
                   .attr("class", function(d, i) {
                      if (d.wbin[0] != undefined) {
                          return "weapon_area nonempty";
                      }
                      return "weapon_area";
                   });
                   
        bin_squares.attr("x", function(d, i) {
                      return to_fixed_3(d.x * bin_size);
                   })
                   .attr("y", function(d, i) {
                      return to_fixed_3(d.y * bin_size);
                   })
                   .attr("width", to_fixed_3(bin_size))
                   .attr("height", to_fixed_3(bin_size))
                   .attr("fill", function(d, i) {
                      if (d.wbin[0] != undefined) {
                          return weapon_category_color[d.wbin[0][0]];
                      }
                      return "black";
                   })
                   .attr("stroke", "black")
                   .attr("stroke-width", "1pt")
                   .attr("opacity", "0.6")
                   .on("mousemove", function(d, i) {
                      if (d.wbin.length > 0) {
                          tooltip_show(d, "weapon_area");
                      }
                   })    
                   .on("mouseout", function(d, i) {
                      if (d.wbin.length > 0) {
                          tooltip_hide();
                      }
                   });   
        
    }
    
    
    /**
        Displays all player paths in the visualization.
        @param {json} data Player footstep data.
    */
    function add_player_paths(data) {
        if (data == undefined) data = [];
    
        // Collecting all the paths from all players and rounds in one array.
        player_paths = get_player_paths(data);
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
                                  .data(paths);
                                  
        player_footpaths.exit().remove();
        
        player_footpaths.enter()
                        .append("path")
                        .attr("class", "player_path");
                        
        player_footpaths.style("stroke", function(d, i) {
                            if (d[0].side == "TERRORIST") {
                                return "red";
                            }
                            else if (d[0].side == "CT") {
                                return "blue";
                            }
                        })
                        .attr("class", function(d, i) {
                            var svg_class = ["player_path"];
                            svg_class.push("side" + d[0].side);
                            svg_class.push("player" + d[0].player);
                            svg_class.push("team" + d[0].team.replace('Team ', ''));
                            svg_class.push("round" + d[0].round);
                            return svg_class.join(" ");
                        })
                        .attr("d", function(d, i) {
                            var translated = d.map(translate_path_point);
                            return lineFunction(translated);
                        })
                        .attr("fill", "none")
                        .attr("stroke-width", "2pt")
                        .attr("opacity", "0.6")
                        .on("mousemove", function(d, i) {
                            important_info = {
                                "side": d[0].side,
                                "player": d[0].player,
                                "round" : d[0].round,
                                //"last_point": d[d.length-1]
                            }
                            tooltip_show(important_info, "player_path");
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
        if (data == undefined) data = [];
    
        var player_deaths = svg.select("#lyr_player_death")
                               .selectAll("path.player_death")
                               .data(data);
			
        player_deaths.exit().remove()
        
        player_deaths.enter()
                     .append("path")
                     .attr("class", "player_death");
                     
        player_deaths.attr("d", d3.svg.symbol().type("cross"))
                     .attr("transform", function (d, i) {
                            return "rotate(" + (-d.eye_angle.yaw+90) + " " + translate_x(d.position.x) + "," + translate_y(d.position.y) + ") translate(" + translate_x(d.position.x) + "," + translate_y(d.position.y) + ") scale(1.5, 1.5)"})
                     .attr("class", function(d, i) {
                        var svg_class = ["player_death"];
                        svg_class.push("side" + d.side);
                        svg_class.push("player" + d.player);
                        svg_class.push("team" + d.team.replace('Team ', ''));
                        svg_class.push("round" + d.round);
                        return svg_class.join(" ");
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
                     .attr("stroke", "white")
                     .attr("stroke-width", "0.8pt")
                     .attr("opacity", "0.8")
                     .on("mousemove", function(d, i) {
                        tooltip_show(d, "player_death");
                     })
                     .on("mouseout", function(d, i) {
                        tooltip_hide();
                     });
		$("#no_of_deaths").text("Number of deaths displayed: " + data.length);
    };
    
    
    /**
        Displays all player positions in the visualization.
        @param {json} data Player footstep data.
    */
    function add_footsteps(data) {
        if (data == undefined) data = [];

        var player_foot_steps = svg.select("#lyr_footsteps")
                                   .selectAll("path.footsteps")
                                   .data(data);
                                   
        player_foot_steps.exit().remove();
        
        player_foot_steps.enter()
                         .append("path")
                         .attr("class", "footsteps");
                         
        player_foot_steps.attr("d", d3.svg.symbol().type("triangle-up"))
                         .attr("transform", function (d, i) {
                            return "rotate(" + (-d.eye_angle.yaw+90) + " " + translate_x(d.position.x) + "," + translate_y(d.position.y) + ") translate(" + translate_x(d.position.x) + "," + translate_y(d.position.y) + ") scale(0.7 2.0)";
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
                         .attr("stroke", "black")
                         .attr("stroke-width", "0.5pt")
                         .attr("opacity", "0.8")
                         .on("mousemove", function(d, i) {
                            d.iteration = i;
                           tooltip_show(d, "footstep");
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
        if (data == undefined) data = [];
    
        var shots_fired = svg.select("#lyr_shots_fired")
                             .selectAll("circle.shot_fired")
                             .data(data);
                             
        shots_fired.exit().remove();
        
        shots_fired.enter()
                   .append("circle")
                   .attr("class", "shot_fired")

        shots_fired.attr("r", 3.5)
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
                          return "#f2d500";
                      }
                      else if (d.side == "CT") {
                          return "#99ffe8";
                      }
                      else {
                          return "black";
                      }
                   })
                   .attr("stroke-width", "0.5pt")
                   .attr("stroke", "black")
                   .on("mousemove", function(d, i) {
                      tooltip_show(d, "shot_fired");
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
    /*
        Calculates the time position of a match that corresponds to a givent tick.
        @param {int} tick The tick we want to know the time for.
        @return {string} The time in minutes and seconds that the tick stands for.
    */
    function get_time_from_tick(tick) {
        var seconds = Math.round(tick / 64);
        var minutes = Math.round(seconds / 60);
        seconds = seconds % 60;
        return  (minutes >= 1 ? (minutes + "m ") : "") + seconds + "s";
    }


    /**
        Copies an object.
        @param {object} obj The object to be copied.
        @return {object} The copied object.
    */
    function clone(obj) {
        if (null == obj || "object" != typeof obj) return obj;
        var copy = obj.constructor();
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
        }
        return copy;
    }

    /**
        Returns the category of a given weapon by its name.
        @param {string} weapon_name The weapon name.
        @return {string} The category name.
    */
    function get_weapon_category(weapon_name) {
        gun_categories = {
            "revolver": "pistol",
            "deagle": "pistol",
            "fiveseven": "pistol",
            "glock": "pistol",
            "usp_silencer": "pistol",
            "tec9": "pistol",
            "cz75a": "pistol",
            "p250": "pistol",
            "usp": "pistol",
            "p228": "pistol",
            "elite": "pistol",
            "hkp2000": "pistol",
            "knife_butterfly": "melee",
            "knife": "melee",
            "knife_t": "melee",
            "knifegg": "melee",
            "knife_karambit": "melee",
            "knife_m9_bayonett": "melee",
            "bayonet": "melee",
            "knife_falchion": "melee",
            "knife_gut": "melee",
            "knife_flip": "melee",
            "knife_tactical": "melee",
            "taser": "melee",
            "awp": "sniper",
            "ssg08": "sniper",
            "g3sg1": "sniper",
            "scout": "sniper",
            "scar20": "sniper",
            "sg550": "sniper",
            "m4a1_silencer": "rifle",
            "ak47": "rifle",
            "m4a1": "rifle",
            "aug": "rifle",
            "sg556": "rifle",
            "famas": "rifle",
            "galil": "rifle",
            "sg552": "rifle",
            "galilar": "rifle",
            "scar17": "rifle",
            "p90": "smg",
            "ump45": "smg",
            "mp7": "smg",
            "mp5navy": "smg",
            "mp5": "smg",
            "mac10": "smg",
            "bizon": "smg",
            "mp9": "smg",
            "tmp": "smg",
            "molotov": "throwable",
            "hegrenade": "throwable",
            "smokegrenade": "throwable",
            "decoy": "throwable",
            "incgrenade": "throwable",
            "flashbang": "throwable",
            "m60": "mg",
            "m249": "mg",
            "negev": "mg",
            "c4": "bomb",
            "c4_training": "bomb"
        }
        result = gun_categories[weapon_name];
        return result;
    };
    
    
    /**
        Applies the filter as defined in the global variable to a datapoint, i.e.
        returns true if the datapoint is included and false if it is not.
        @param {object} datapoint The datapoint as provided by the dataset, containing at least the attributes to be filtered.
        @return {boolean} Returns true if the data is contained or false if it is filtered out.
    */
    function apply_filter(datapoint) {
        return    (   filter.rounds.length  == 0
                   || filter.replay
                   || $.inArray(parseInt(datapoint.round), filter.rounds)   > -1)
               && (   filter.players.length == 0
                   || $.inArray(datapoint.player, filter.players) > -1
                   || $.inArray(datapoint.guid, filter.players) > -1)
               && (   filter.sides.length   == 0
                   || $.inArray(datapoint.side, filter.sides) > -1)
               && (   !filter.hasOwnProperty('tick_interval') || filter.tick_interval.length == 0
                   || (datapoint.tick >= filter.tick_interval[0] && datapoint.tick <= filter.tick_interval[1])
                   || (datapoint.hasOwnProperty('event_type')
                        && datapoint.event_type == 'player_death'
                        && get_round_from_tick(datapoint.tick) == get_round_from_tick(filter.tick_interval[0])
                        && datapoint.tick <= filter.replay_interval[1]
                        && datapoint.tick <= filter.tick_interval[1]));
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
        
        data.forEach(function (entry, i) {
            // check for round end and create new path
            var round_current = get_round_from_tick(entry.tick);
            if (round_current != undefined) {
            //TODO: check if the undefined case can always be ignored or not

                if (!(entry.guid in player_paths)) {
                    player_paths[entry.guid] = {};
                    for (var r in rounds) {
                        if (rounds.hasOwnProperty(r)) {
                            player_paths[entry.guid][r] = []
                        }
                    }
                }
               
                player_paths[entry.guid][round_current].push({
                    "tick": entry.tick,
                    "pos": entry.position,
                    "player": entry.player,
                    "team": entry.team,
                    "side": entry.side,
                    "round": round_current,
                    "guid": entry.guid
                });
            }

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
        Builds and displays the tooltip based on the type and info provided.
        @param {json} info Object that cotains the info to be displayed.
        @param {string} type Type of the object.
    */
    function tooltip_show(info, type) {
        html = "";
        if (type == "player_path") {
            html += "<span>Player Path</span>";
            html += "<table>";
            html += "<tr><td>Round: </td><td>" + info.round + "</td></tr>";
            html += "<tr><td>Side: </td><td>" + info.side + "</td></tr>";
            html += "<tr><td>Player: </td><td>" + info.player + "</td></tr>";
            html += "</table>";
        }
        else if (type == "footstep") {
            html += "<span>Player View Direction</span>";
            html += "<table>";
            html += "<tr><td>Round: </td><td>" + info.round + "</td></tr>";
            html += "<tr><td>Side: </td><td>" + info.side + "</td></tr>";
            html += "<tr><td>Player: </td><td>" + info.player + "</td></tr>";
            html += "<tr><td>Health: </td><td>" + info.player_health + "</td></tr>";
            html += "<tr><td>Weapon: </td><td>" + info.weapon + "</td></tr>";
            html += "<tr><td>Position: </td><td>" + info.position.x + " / " + info.position.y + " / " + info.position.z + "</td></tr>";
            html += "<tr><td>View Angle: </td><td>" + to_fixed_2(info.eye_angle.yaw) + "°</td></tr>";
            html += "<tr><td>Place: </td><td>" + info.last_place_name + "</td></tr>";
            html += "<tr><td>Time: </td><td>" + get_time_from_tick(info.tick) + ", Tick: " + info.tick + "</td></tr>";
            html += "</table>";
        }
        else if (type == "player_death") {
            html += "<span>Player Death</span>";
            html += "<table>";
            html += "<tr><td>Round: </td><td>" + info.round + "</td></tr>";
            html += "<tr><td>Side: </td><td>" + info.side + "</td></tr>";
            html += "<tr><td>Player: </td><td>" + info.player + "</td></tr>";
            html += "<tr><td>Weapon: </td><td>" + info.curr_weapon + "</td></tr>";
            html += "<tr><td>Killed with: </td><td>" + info.killed_with + "</td></tr>";
            html += "<tr><td>Position: </td><td>" + info.position.x + " / " + info.position.y + " / " + info.position.z + "</td></tr>";
            html += "<tr><td>View Angle: </td><td>" + to_fixed_2(info.eye_angle.yaw) + "°</td></tr>";
            html += "<tr><td>Place: </td><td>" + info.last_place_name + "</td></tr>";
            html += "<tr><td>Time: </td><td>" + get_time_from_tick(info.tick) + ", Tick: " + info.tick + "</td></tr>";
            html += "</table>";
        }
        else if (type == "weapon_area") {
            html += "<span>Weapon Histogram Bin</span>";
            html += "<table>";
            html += "<tr><td>Bin: </td><td>" + info.x + " / " + info.y + "</td></tr>";
            html += "<tr><td>Most used weapon types: </td><td></td></tr>";
            
            if (info.wbin[0] != undefined)
                html += "<tr><td class=\"indent\">1. " + info.wbin[0][0] + "</td><td>" + info.wbin[0][1] + " samples</td></tr>";
            if (info.wbin[1] != undefined)
                html += "<tr><td class=\"indent\">2. " + info.wbin[1][0] + "</td><td>" + info.wbin[1][1] + " samples</td></tr>";
            if (info.wbin[2] != undefined)
                html += "<tr><td class=\"indent\">3. " + info.wbin[2][0] + "</td><td>" + info.wbin[2][1] + " samples</td></tr>";
            
            html += "</table>";
        }
        else if (type == "shot_fired") {
            html += "<span>Weapon Use</span>";
            html += "<table>";
            html += "<tr><td>Round: </td><td>" + info.round + "</td></tr>";
            html += "<tr><td>Side: </td><td>" + info.side + "</td></tr>";
            html += "<tr><td>Player: </td><td>" + info.player + "</td></tr>";
            html += "<tr><td>Weapon: </td><td>" + info.weapon + "</td></tr>";
            html += "<tr><td>Position: </td><td>" + info.position.x + " / " + info.position.y + " / " + info.position.z + "</td></tr>";
            html += "<tr><td>View Angle: </td><td>" + to_fixed_2(info.eye_angle.yaw) + "°</td></tr>";
            html += "<tr><td>Time: </td><td>" + get_time_from_tick(info.tick) + ", Tick: " + info.tick + "</td></tr>";
            html += "</table>";
        }
        else {
            html = stringify_pretty_print(object);
        }
        offset_x = 16;
        offset_y = 16;
        pos = d3.mouse(document.body);
        d3.select("#tooltip")
          .html(html)
          .style("left", pos[0] + offset_x + "px")
          .style("top", pos[1] + offset_y + "px")
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
        Rounds a floating point number to 3 decimal points.
        This function is a lot faster than toFixed().
        @param {float} number The float to be rounded.
        @return {float} The given number rounded to 3 decimal points.
    */
    function to_fixed_3(number) {
        return Math.round(number * 1000) / 1000;
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
        
        var ct_weapon = add_weapon_category(ct_data, "killed_with")
        var t_weapon = add_weapon_category(t_data, "killed_with")

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
            if(entry.side === "CT") ct.push(entry)
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
