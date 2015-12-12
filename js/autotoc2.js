$(document).ready(function() { 
    // Auto ToC
    // Inspired by: http://www.jankoatwarpspeed.com/automatically-generate-table-of-contents-using-jquery/

    $("body").append('<div id="toc"></div>');
    $("#toc").append('<span>Table of Contents <small>(toggle)</small></span>');
    $("#toc").append('<ul>');
    $("h2, h3").each(function(i) {
        var current = $(this);
        current.attr("id", "title" + i);
        $("#toc").append("<li><a id='link" + i + "' href='#title" +
            i + "' title='" + current.attr("tagName") + "'>" + 
            current.html() + "</a></li>");
    });
    $("#toc").append('</ul>');
    
    $("#toc span small").click(function() {
        $("#toc ul, li").toggleClass("hidden");
    });
    
});