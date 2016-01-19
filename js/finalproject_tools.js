$(document).ready(function() {

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
    $("#tb_wbin_showempty").button();
    
    $("#tb_wbin_enabled").button();
    
    
    
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