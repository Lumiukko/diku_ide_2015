$(document).ready(function() {

    // Default filter:
    // WARNING: should match filter in finalproject.js!
    var ui_filter = {
        "render_foot_steps": false,
        "render_foot_paths": true,
        "render_weapon_fire": true,
        "render_player_deaths": true,
        "render_weapon_areas": false,
        "weapon_area_resolution": 32,
        "weapon_area_show_empty_bins": false,
        "players": [
            "apEX",
            "Happy",
            "kennyS",
            "kioShiMa",
            "NBK-",
            "flusha",
            "JW",
            "KRIMZ",
            "olofmeister",
            "pronax"
        ],
        "rounds": [-1, 1],  // the -1 prevents all rounds from being shown if no round is selected
        "sides": [],
        "background": 0
    };


    // Add players...

    var players_t1 = [
        "apEX",
        "Happy",
        "kennyS",
        "kioShiMa",
        "NBK-"
    ];
    
    var players_t2 = [
        "flusha",
        "JW",
        "KRIMZ",
        "olofmeister",
        "pronax"
    ];
    
    
    $("#tb_display_players").append("<div id=\"tb_display_players_t1\"></div>");
    $("#tb_display_players_t1").append("<span>EnVyUS</span>");
    players_t1.forEach(function(p) {
        $("#tb_display_players_t1").append("<input type=\"checkbox\" id=\"tb_p_" + p + "\" name=\"tb_p_" + p + "\" value=\"tb_p_" + p + "\" /><label for =\"tb_p_" + p + "\">" + p + "</label>");
    });
    
    $("#tb_display_players").append("<div id=\"tb_display_players_t2\"></div>");
    $("#tb_display_players_t2").append("<span>Fnatic</span>");
    players_t2.forEach(function(p) {
        $("#tb_display_players_t2").append("<input type=\"checkbox\" id=\"tb_p_" + p + "\" name=\"tb_p_" + p + "\" value=\"tb_p_" + p + "\" /><label for =\"tb_p_" + p + "\">" + p + "</label>");
    });
    
    
    // Add rounds...
    
    $("#tb_display_rounds").append("<div id=\"tb_display_rounds_selectors\"></div>");
   
    rs = "h1"
    $("#tb_display_rounds_selectors").append("<input type=\"checkbox\" id=\"tb_r_" + rs + "\" name=\"tb_r_" + rs + "\" value=\"tb_r_" + rs + "\" /><label for =\"tb_r_" + rs + "\">1st&nbsp;Half</label>");
    
    rs = "h2"
    $("#tb_display_rounds_selectors").append("<input type=\"checkbox\" id=\"tb_r_" + rs + "\" name=\"tb_r_" + rs + "\" value=\"tb_r_" + rs + "\" /><label for =\"tb_r_" + rs + "\">2nd&nbsp;Half</label>");
    
    rs = "ot"
    $("#tb_display_rounds_selectors").append("<input type=\"checkbox\" id=\"tb_r_" + rs + "\" name=\"tb_r_" + rs + "\" value=\"tb_r_" + rs + "\" /><label for =\"tb_r_" + rs + "\">Overtime</label>");
    
    
    $("#tb_display_rounds").append("<div id=\"tb_display_rounds_h1\"></div>");
    for (var r=1; r<=15; r++) {
        rs = zero_pad(r, 2);
        $("#tb_display_rounds_h1").append("<input type=\"checkbox\" id=\"tb_r_" + rs + "\" name=\"tb_r_" + rs + "\" value=\"tb_r_" + rs + "\" /><label for =\"tb_r_" + rs + "\">" + rs + "</label>");
    };
    
    
    $("#tb_display_rounds").append("<div id=\"tb_display_rounds_h2\"></div>");
    for (var r=16; r<=30; r++) {
        rs = zero_pad(r, 2);
        $("#tb_display_rounds_h2").append("<input type=\"checkbox\" id=\"tb_r_" + rs + "\" name=\"tb_r_" + rs + "\" value=\"tb_r_" + rs + "\" /><label for =\"tb_r_" + rs + "\">" + rs + "</label>");
    };
    
    
    $("#tb_display_rounds").append("<div id=\"tb_display_rounds_ot\"></div>");
    for (var r=31; r<=34; r++) {
        rs = zero_pad(r, 2);
        $("#tb_display_rounds_ot").append("<input type=\"checkbox\" id=\"tb_r_" + rs + "\" name=\"tb_r_" + rs + "\" value=\"tb_r_" + rs + "\" /><label for =\"tb_r_" + rs + "\">" + rs + "</label>");
    };
    
    
    
    
    // Add weapon histogram resolutions...
    
    for (var i=1; i<=5; i++) {
        reso = i*16;
        $("#tb_wbin_resolutions form").append("<input type=\"radio\" id=\"tb_wbin_r_" + reso + "\" name=\"tb_wbin_resolution\" value=\"tb_wbin_r_" + reso + "\" /><label for =\"tb_wbin_r_" + reso + "\">" + reso + "</label>");
    }
    
    
    
    // Set up default settings.
    // WARNING: This should match the default filter!
    $("#toolbox input").removeAttr("checked");
    $("#tb_pp_enabled").prop("checked", true);
    $("#tb_pd_enabled").prop("checked", true);
    $("#tb_wu_enabled").prop("checked", true);
    $("#tb_sides_b").prop("checked", true);
    $("#tb_r_01").prop("checked", true);
    $("#tb_display_players input").prop("checked", true);
    $("#tb_wbin_r_32").prop("checked", true);
    
    

    
    
    
    // Create jquery-ui buttons and button sets
    
    $("#tb_display_rounds_selectors").buttonset();
    $("#tb_display_rounds_h1").buttonset();
    $("#tb_display_rounds_h2").buttonset();
    $("#tb_display_rounds_ot").buttonset();
    
    $("#tb_wbin_resolutions").buttonset();
    
    $("#tb_display_sides").buttonsetv();
    
    $("#tb_display_players_t1").buttonsetv();
    $("#tb_display_players_t2").buttonsetv();
    
    $("#tb_pp_enabled").button();
    $("#tb_pwd_enabled").button();
    $("#tb_pd_enabled").button();
    $("#tb_wu_enabled").button();
    $("#tb_wbin_enabled").button();
    $("#tb_wbin_showempty").button();
    
    
    
    
    // Add ALL THE EVENTS!!!
    
    $("#tb_pd_enabled").on("click", function() {
        ui_filter.render_player_deaths = $("#tb_pd_enabled").prop("checked");
        redraw(ui_filter);
    });
    
    $("#tb_pp_enabled").on("click", function() {
        ui_filter.render_foot_paths = $("#tb_pp_enabled").prop("checked");
        redraw(ui_filter);
    });
    
    $("#tb_wu_enabled").on("click", function() {
        ui_filter.render_weapon_fire = $("#tb_wu_enabled").prop("checked");
        redraw(ui_filter);
    });
    
    $("#tb_pwd_enabled").on("click", function() {
        ui_filter.render_foot_steps = $("#tb_pwd_enabled").prop("checked");
        redraw(ui_filter);
    });

    $("#tb_wbin_enabled").on("click", function() {
        ui_filter.render_weapon_areas = $("#tb_wbin_enabled").prop("checked");
        redraw(ui_filter);
    });
    
    $("#tb_wbin_showempty").on("click", function() {
        ui_filter.weapon_area_show_empty_bins = $("#tb_wbin_showempty").prop("checked");
        redraw(ui_filter);
    });
    
    $("#tb_display_sides input").on("click", function() {
        if ($("#tb_sides_ct").prop("checked") == true)
            ui_filter.sides = ["CT"];
        else if ($("#tb_sides_t").prop("checked") == true)
            ui_filter.sides = ["TERRORIST"];
        else
            ui_filter.sides = [];
        redraw(ui_filter);
    });
    
    $("#tb_display_players input").on("click", function() {
        var pname = this.value.substring(5);
        var ppos = $.inArray(pname, ui_filter.players);
        if (ppos == -1)
            ui_filter.players.push(pname);
        else
            ui_filter.players.splice(ppos, 1);
        redraw(ui_filter);
    });
    
    $("#tb_display_rounds input").on("click", function() {
        var rnum = parseInt(this.value.substring(5));
        var rpos = $.inArray(rnum, ui_filter.rounds);
        if (rpos == -1)
            ui_filter.rounds.push(rnum);
        else
            ui_filter.rounds.splice(rpos, 1);

        redraw(ui_filter);
    });
    
    $("#tb_wbin_resolutions input").on("click", function() {
        var res = parseInt(this.value.substring(10));
        ui_filter.weapon_area_resolution = res;
        redraw(ui_filter);
    });
    
    $("#tb_r_h1").on("click", function() {
        if ($("#tb_r_h1").prop("checked")) {
            for (var i=1; i<=15; i++) {
                rpos = $.inArray(i, ui_filter.rounds);
                if (rpos < 0) ui_filter.rounds.push(i);
                $("#tb_r_" + zero_pad(i, 2)).prop("checked", true);
                $("#tb_r_" + zero_pad(i, 2)).button("refresh");
            }
        }
        else {
            for (var i=1; i<=15; i++) {
                rpos = $.inArray(i, ui_filter.rounds);
                if (rpos != -1) ui_filter.rounds.splice(rpos, 1);
                $("#tb_r_" + zero_pad(i, 2)).prop("checked", false);
                $("#tb_r_" + zero_pad(i, 2)).button("refresh");
            }
        }
        redraw(ui_filter);
    });
    
    $("#tb_r_h2").on("click", function() {
        if ($("#tb_r_h2").prop("checked")) {
            for (var i=16; i<=30; i++) {
                rpos = $.inArray(i, ui_filter.rounds);
                if (rpos < 0) ui_filter.rounds.push(i);
                $("#tb_r_" + zero_pad(i, 2)).prop("checked", true);
                $("#tb_r_" + zero_pad(i, 2)).button("refresh");
            }
        }
        else {
            for (var i=16; i<=30; i++) {
                rpos = $.inArray(i, ui_filter.rounds);
                if (rpos != -1) ui_filter.rounds.splice(rpos, 1);
                $("#tb_r_" + zero_pad(i, 2)).prop("checked", false);
                $("#tb_r_" + zero_pad(i, 2)).button("refresh");
            }
        }
        redraw(ui_filter);
    });
    
    
    $("#tb_r_ot").on("click", function() {
        if ($("#tb_r_ot").prop("checked")) {
            for (var i=31; i<=34; i++) {
                rpos = $.inArray(i, ui_filter.rounds);
                if (rpos < 0) ui_filter.rounds.push(i);
                $("#tb_r_" + zero_pad(i, 2)).prop("checked", true);
                $("#tb_r_" + zero_pad(i, 2)).button("refresh");
            }
        }
        else {
            for (var i=31; i<=34; i++) {
                rpos = $.inArray(i, ui_filter.rounds);
                if (rpos != -1) ui_filter.rounds.splice(rpos, 1);
                $("#tb_r_" + zero_pad(i, 2)).prop("checked", false);
                $("#tb_r_" + zero_pad(i, 2)).button("refresh");
            }
        }
        redraw(ui_filter);
    });
    
    
    
    // Information dialogs
    
    // --> Weapon Histogram
    dc = "";
    dc += "<div id=\"dialog_info_whisto\" title=\"Weapon Histogram\">";
    dc += "    <p>This option divides the map into equally sized square areas and accumulates the weapon category depending on the weapon carried by a player within each of the squares. A sample is collected each second (or 64 ticks) of the match. The squares are color-coded by the most dominant weapon category.</p>"
    dc += "    <p>The weapon categories are grouped into: ";
    dc += "        <div class=\"wbin_color\" style=\"background-color: blue;\"></div> Pistols,";
    dc += "        <div class=\"wbin_color\" style=\"background-color: white;\"></div> Knives,";
    dc += "        <div class=\"wbin_color\" style=\"background-color: red;\"></div> Rifles,";
    dc += "        <div class=\"wbin_color\" style=\"background-color: yellow;\"></div> Precision Rifles,";
    dc += "        <div class=\"wbin_color\" style=\"background-color: fuchsia;\"></div> Submachine Gun,";
    dc += "        <div class=\"wbin_color\" style=\"background-color: orange;\"></div> Machine Gun,";
    dc += "        <div class=\"wbin_color\" style=\"background-color: green;\"></div> Throwables,";
    dc += "        and the <div class=\"wbin_color\" style=\"background-color: #ff99cc;\"></div> Bomb.";
    dc += "    </p>";
    dc += "    <p>The squares can be decreased in size by choosing a larger resolution. Furthermore, one can select whether or not to show squares that do not contain any samples. If empty bins are shown, they will be displayed in black.</p>";
    dc += "    <p>Please note that the histogram is not normalized. This means that we only count the total number of samples per weapon type and chose the biggest sample and do not divide by the total amount of all samples.</p>";
    dc += "</div>";
    $("body").prepend(dc);
    
    $("#dialog_info_whisto").dialog({"modal": true, "autoOpen": false});
    $("#info_whisto").on("click", function() {
        $("#dialog_info_whisto").dialog('widget').attr('id', 'dialog_info_whisto_div');
        $("#dialog_info_whisto").dialog("open");
        $("#dialog_info_whisto_div").css("width", (window.innerWidth*0.6));
        $("#dialog_info_whisto_div").css("top", ($(document).scrollTop() + window.innerHeight/2) + "px");
        $("#dialog_info_whisto_div").css("left", "200px");
    });
    
    
    
    
    
    // --> Display
    dc = "";
    dc += "<div id=\"dialog_info_display\" title=\"Display\">";
    dc += "    <p>This option chooses what will be shown in the visualization. One can select specific rounds, players, or the side. Note that, if no players are chosen, all players are displayed.</p>";
    dc += "</div>";
    $("body").prepend(dc);
    
    $("#dialog_info_display").dialog({"modal": true, "autoOpen": false});
    $("#info_display").on("click", function() {
        $("#dialog_info_display").dialog('widget').attr('id', 'dialog_info_display_div');
        $("#dialog_info_display").dialog("open");
        $("#dialog_info_display_div").css("width", (window.innerWidth*0.6));
        $("#dialog_info_display_div").css("top", ($(document).scrollTop() + window.innerHeight/2) + "px");
        $("#dialog_info_display_div").css("left", "200px");
    });
    
    
     
     
     // -> Player Path
    dc = "";
    dc += "<div id=\"dialog_info_ppath\" title=\"Player Path\">";
    dc += "    <p>This option allows to display the trails of players movements. The trails are displayed as lines and effectively connect the same points as the ones used in the view direction. Specifically these points are samples from the demo recording taken with a frequency of one per second.</p>";
    dc += "</div>";
    $("body").prepend(dc);
    
    $("#dialog_info_ppath").dialog({"modal": true, "autoOpen": false});
    $("#info_ppath").on("click", function() {
        $("#dialog_info_ppath").dialog('widget').attr('id', 'dialog_info_ppath_div');
        $("#dialog_info_ppath").dialog("open");
        $("#dialog_info_ppath_div").css("width", (window.innerWidth*0.6));
        $("#dialog_info_ppath_div").css("top", ($(document).scrollTop() + window.innerHeight/2) + "px");
        $("#dialog_info_ppath_div").css("left", "200px");
    });
    
    
    // -> Player View Direction
    dc = "";
    dc += "<div id=\"dialog_info_viewdir\" title=\"Player View Direction\">";
    dc += "    <p>This option allows to display view direction of the players. The view direction is indicated by an acute-angled triangle or arrow, pointing in the direction of the players view. The exact angle can be seen in tooltip by hovering over the arrow with the mouse.</p>";
    dc += "</div>";
    $("body").prepend(dc);
    
    $("#dialog_info_viewdir").dialog({"modal": true, "autoOpen": false});
    $("#info_viewdir").on("click", function() {
        $("#dialog_info_viewdir").dialog('widget').attr('id', 'dialog_info_viewdir_div');
        $("#dialog_info_viewdir").dialog("open");
        $("#dialog_info_viewdir_div").css("width", (window.innerWidth*0.6));
        $("#dialog_info_viewdir_div").css("top", ($(document).scrollTop() + window.innerHeight/2) + "px");
        $("#dialog_info_viewdir_div").css("left", "200px");
    });
   
    
    
    // -> Player Death
    dc = "";
    dc += "<div id=\"dialog_info_pdeath\" title=\"Player Death\">";
    dc += "    <p>This option allows to display the places players have died. The place is indicated by a medium sized circle in dark-red or dark-blue for terrorist and counter-terrorist players respectively.The tooltip gives additional information about current weapon selected, the weapon that killed the player, and more.</p>";
    dc += "</div>";
    $("body").prepend(dc);
    
    $("#dialog_info_pdeath").dialog({"modal": true, "autoOpen": false});
    $("#info_pdeath").on("click", function() {
        $("#dialog_info_pdeath").dialog('widget').attr('id', 'dialog_info_pdeath_div');
        $("#dialog_info_pdeath").dialog("open");
        $("#dialog_info_pdeath_div").css("width", (window.innerWidth*0.6));
        $("#dialog_info_pdeath_div").css("top", ($(document).scrollTop() + window.innerHeight/2) + "px");
        $("#dialog_info_pdeath_div").css("left", "200px");
    });
    
    // -> Weapon use
    dc = "";
    dc += "<div id=\"dialog_info_wfire\" title=\"Weapon Use\">";
    dc += "    <p>This option allows to display the places a player has used his weapon. This is indicated by a small sized circle in orange or aqua color for terrorist and counter-terrorist players respectively. Weapon usage can be any of the weapons, including knives. The tooltip gives additional information on the weapon used, the player, and more. The direction in which the weapon has been used is consistent with the direction of the view angle.</p>";
    dc += "</div>";
    $("body").prepend(dc);
    
    $("#dialog_info_wfire").dialog({"modal": true, "autoOpen": false});
    $("#info_wfire").on("click", function() {
        $("#dialog_info_wfire").dialog('widget').attr('id', 'dialog_info_wfire_dir');
        $("#dialog_info_wfire").dialog("open");
        $("#dialog_info_wfire_dir").css("width", (window.innerWidth*0.6));
        $("#dialog_info_wfire_dir").css("top", ($(document).scrollTop() + window.innerHeight/2) + "px");
        $("#dialog_info_wfire_dir").css("left", "200px");
    });
    


    // Utility functions
    
    function zero_pad(str, len) {
        str = str.toString();
        return str.length < len ? zero_pad("0" + str, len) : str;
    }

});

/**
    Plugin to add vertical button sets to jquery-ui.
        Source: https://gist.github.com/edersohe/760885
*/
(function( $ ){
    //plugin buttonset vertical
    $.fn.buttonsetv = function() {
        $(':radio, :checkbox', this).wrap('<div style="margin: 1px"/>');
        $(this).buttonset();
        $('label:first', this).removeClass('ui-corner-left').addClass('ui-corner-top');
        $('label:last', this).removeClass('ui-corner-right').addClass('ui-corner-bottom');
        mw = 0; // max witdh
        $('label', this).each(function(index){
            w = $(this).width();
            if (w > mw) mw = w;
        })
        $('label', this).each(function(index){
            $(this).width(mw);
        })
    };
})( jQuery );