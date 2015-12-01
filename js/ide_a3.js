$(document).ready(function() { 
    auto_toc();
   


    function auto_toc() {
        // Auto ToC
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
    }

});