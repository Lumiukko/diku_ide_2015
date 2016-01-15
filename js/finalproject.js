$(document).ready(function() {

    var svg = d3.select("#visbox");
    
    // Layers: Change order to bring layers to front or back.
    svg.append("g").attr("id", "lyr_shots_fired");
    svg.append("g").attr("id", "lyr_player_death");
    svg.append("g").attr("id", "lyr_footsteps");

    d3.json("data/csgo/ESLOneCologne2015-fnatic-vs-envyus-dust2_player_death.json", function(error, data) {
        if (!error) {
            //add_player_deaths(data);
        }
        else {
            console.log("Error: " + error);
        }
    });
    
    d3.json("data/csgo/ESLOneCologne2015-fnatic-vs-envyus-dust2_weapon_fired.json", function(error, data) {
        if (!error) {
            //add_shots_fired(data);
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