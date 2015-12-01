$(document).ready(function() {
    hands = undefined;
    pcs = undefined;

    load_hands();
    load_hand_pcs();

    draw_stuff();
    plot_stuff();

    function draw_stuff() {
        if (hands != undefined) {
            console.log(hands[0])
        }
    }

    function plot_stuff() {
        if (pcs != undefined) {
            console.log(pcs[0])
        }
    }

    function load_hands() {       
        $.get("data/hands.csv", function (fcontent) {
            data = d3.csv.parseRows(fcontent);
            hdata = [];
            $(data).each(function(i, d) {
                d = d.map(parseFloat);
                xs = d.slice(0, 56);
                ys = d.slice(56, 112);
                hdata.push([xs, ys]);
            });
            hands = hdata;
            // @Bogdan: You can call callback functions here and use the global variable "hands[index]".
            draw_stuff(); // EXAMPLE
        }, "text");
    };

    function load_hand_pcs() {
        $.get("data/hands_pca.csv", function (fcontent) {
            data = d3.csv.parseRows(fcontent);
            pcsdata = []
            $(data).each(function(i, d) {
                pcsdata.push([parseFloat(d[0]), parseFloat(d[1])]);
            });
            pcs = pcsdata;
            // @Hauke: You can call callback functions here and use the global variable "pcs[index]".
            plot_stuff(); // EXAMPLE
        }, "text");
    }

    

});