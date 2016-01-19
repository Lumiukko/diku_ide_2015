var update_page;

$(document).ready(function() {
    /**
    ======================== MULTIPLE VIEW =================================================
    The following code handles the changes between the views.
    ========================================================================================
    */
    var page = 0;
    var players = ['JW', 'pronax', 'KRIMZ', 'olofmeister', 'flusha',
                   'Happy', 'NBK-', 'KennyS', 'kioShiMa', 'apEX'];
    var content = [{
        "headline": "Starting the Grand Final",
        "discovery": "The two best Counter Strike: Global Offensive teams in the world batteling it out on de_dust2 in front of more than 1.2 million viewers. The ESL One Cologne Grand Final 2015 had the potential to be a gigantic camp-fest - but instead of relying on the old and battle-proven tactics, which got Fnatic and EnVyUS to the place where they are now, they showed the cards they got hidden up their sleeves the whole time:<br />Already in the first pistol round KRIMZ and JW on the CT side showed great aggression up to Top Mid.",
        "filter": {
            "render_foot_steps": true,
            "render_foot_paths": true,
            "render_weapon_fire": false,
            "render_player_deaths": true,
            "render_weapon_areas": false,
            "weapon_area_resolution": 16,
            "weapon_area_show_empty_bins": true,
            "players": ["JW", "KRIMZ"],
            "rounds": [1],
            "sides": [],
            "background": 0            
        }
    },
    {
        "headline": "Knife of Confusion",
        "discovery": "And the first highlight of the game happened in the first round, too: After killing apEX with a pistol through a smoke grenade at B tunnels, flusha finished his magazine. NBK- suffers the same fate, but draws his knife faster and gets the kill. EnVyUS takes the first round.",
        "filter": {
            "render_foot_steps": true,
            "render_foot_paths": true,
            "render_weapon_fire": false,
            "render_player_deaths": true,
            "render_weapon_areas": true,
            "weapon_area_resolution": 16,
            "weapon_area_show_empty_bins": true,
            "players": ["apEX", "flusha", "NBK-"],
            "rounds": [1],
            "sides": [],
            "background": 0            
        }
    },
    {
        "headline": "This is a headline4",
        "discovery": "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
        "players": ["apEX"],
        "rounds": [1,2,3,4,5,6,7,8,9,10],
        "sides": ["TERRORIST", "CT"]
    },
    {
        "headline": "This is a headline5",
        "discovery": "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc.",
        "players": ["apEX"],
        "rounds": [17,18],
        "sides": ["TERRORIST", "CT"]
    }];
    
    $("#nav_btn_next").click(function () {
        page += 1;
        update_page(true);
    });

    $("#nav_btn_prev").click(function () {
        page -= 1;
        update_page(true);
    });
    
    $("#btn_tech").click(function () {
        $("#tech_stuff").slideToggle('slow', function() {
            document.getElementById('tech_stuff').scrollIntoView({behavior: "smooth"}); 
        });
        return false;
    });
    
    // updating the headline, the text and the filter of the visualization
    update_page = function(scroll) {
        toggle_button_visibility(page);
        if (scroll) {
            document.getElementById('headline').scrollIntoView({behavior: "smooth"});
        }
        $('article h3').fadeOut('fast', function() {
            $(this).html(content[page].headline).fadeIn('fast');
        });
        $('article p').fadeOut('fast', function() {
            $(this).html(content[page].discovery).fadeIn('fast', function() {
                var words = content[page].discovery.split(' ');
                for (var i in words) {
                    if (players.indexOf(words[i]) >= 0) {
                        words[i] = "<span class='show player" + words[i] + "'>" + words[i] + "</span>";
                    }
                }
                $(this).html(words.join(' ')).fadeIn('slow');
                $(".show").click(function() {
                    var target = 'svg .' + $(this).attr('class').split(' ')[1];
                    if ($(target).length > 0) {
                        $(target).attr("class", function(attr_value) {
                            return $(this).attr("class") + ' hover';  
                        }); 
                    }
                    document.getElementById('visbox').scrollIntoView({behavior: 'smooth'});
                    return false;
                });

                $(".show").on('mouseover', function() {
                    var target = 'svg .' + $(this).attr('class').split(' ')[1];
                    if ($(target).length > 0) {
                        $(target).attr("class", function(attr_value) {
                            return $(this).attr("class") + ' hover';  
                        }); 
                    }
                });
                
                $(".show").on('mouseout', function() {
                    $('.hover').attr("class", function(attr_value) {
                        return $(this).attr("class").split(' ').slice(0, -1).join(' ');
                    });
                });
    
            });
        });
        if (content[page]['filter']) {
            redraw(content[page]['filter']);
        }
    }

    function toggle_button_visibility(page){
        var first = 0;
        var last = content.length-1;
        // disable pointer events to not allow click on fading-out arrows
        if (page === first) {
            $("#nav_btn_prev").css('pointerEvents', 'none');
            $("#nav_btn_prev").hide(800);
        } else if(page === last) {
            $("#nav_btn_next").css('pointerEvents', 'none');
            $("#nav_btn_next").hide(800);
            
        } else {
            $("#nav_btn_prev").css('pointerEvents', 'auto');
            $("#nav_btn_next").css('pointerEvents', 'auto');
            $("#nav_btn_prev").show(800);
            $("#nav_btn_next").show(800);
        }
    }
});