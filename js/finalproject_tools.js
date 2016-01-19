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
    $("#tb_display_players_t1").append("<span>Team 1</span>");
    players_t1.forEach(function(p) {
        $("#tb_display_players_t1").append("<input type=\"checkbox\" id=\"tb_p_" + p + "\" name=\"tb_p_" + p + "\" value=\"tb_p_" + p + "\" /><label for =\"tb_p_" + p + "\">" + p + "</label>");
    });
    
    $("#tb_display_players").append("<div id=\"tb_display_players_t2\"></div>");
    $("#tb_display_players_t2").append("<span>Team 2</span>");
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