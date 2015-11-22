$(document).ready(function() {
    $("body").append('<img id="mysteryImage" src="img/science.gif" />');
    $("#mysteryImage").css('position', 'fixed');
    $("#mysteryImage").css('right', '4pt');
    $("#mysteryImage").css('top', '6pt');


    // Inspired by: http://www.jankoatwarpspeed.com/automatically-generate-table-of-contents-using-jquery/

    $("body").append('<div id="toc"></div>');
    $("#toc").append('<span>Table of Contents</span>');
    $("#toc").append('<ul>');
    $("h2, h3").each(function(i) {
        var current = $(this);
        current.attr("id", "title" + i);
        $("#toc").append("<li><a id='link" + i + "' href='#title" +
            i + "' title='" + current.attr("tagName") + "'>" + 
            current.html() + "</a></li>");
    });
    $("#toc").append('</ul>');
});