var update_page;

$(document).ready(function() {
    /**
    ======================== MULTIPLE VIEW =================================================
    The following code handles the changes between the views.
    ========================================================================================
    */
    var page = 0;
    var players = ['JW', 'pronax', 'KRIMZ', 'olofmeister', 'flusha',
                   'Happy', 'NBK-', 'kennyS', 'kioShiMa', 'apEX'];
    var teams = ['Fnatic', 'EnVyUS'];
    var sides = {
        'CT': ['CT', 'CTs', 'Counter-Terrorist', 'Counter-Terrorists'],
        'TERRORIST': ['Terrorist', 'Terrorists', 'Ts', 'T']
    }
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
        "headline": "Which weapons where? Active weapons in the pistol rounds",
        "discovery": "The first round and the first round after the switching of the sides, round 16, are always special: The players can only afford pistols and grenades. Still, those rounds often decide the setting for the next two or three rounds - or even the whole match.<br />Looking at the weapons the players have drawn at different locations, we can see that most players throw their grenades from safe positions, like B Tunnels, from T Spawn behind some boxes or the cover at bombside A. As a CT kennyS decides to throw grenades outside of the cover at A - and promptly dies when he is surprised by the rushing Terrorists.<br /><b>TL;DR:</b> Nade in your hand, can't make a stand.",
        "filter": {
            "render_foot_steps": false,
            "render_foot_paths": false,
            "render_weapon_fire": false,
            "render_player_deaths": true,
            "render_weapon_areas": true,
            "weapon_area_resolution": 32,
            "weapon_area_show_empty_bins": false,
            "players": ['flusha', 'NBK-', 'kennyS'],
            "rounds": [1, 16],
            "sides": [],
            "background": 0            
        }
    },
    {
        "headline": "Round 2 and 3: Aggression leads to success",
        "discovery": "In round 2 JW and flusha do everything they can to take the momentum from EnVyUs and even succeed in killing all enemy players, just to be unable to defuse the bomb in time. In round 3 they again show great presence especially in Mid - which is definitely not the standard play book for the defending CTs. But their aggression is rewarded in the end and Fnatic can take round 3 from EnVyUs - even though they were on a force round.",
         "filter": {
            "render_foot_steps": true,
            "render_foot_paths": true,
            "render_weapon_fire": true,
            "render_player_deaths": true,
            "render_weapon_areas": false,
            "weapon_area_resolution": 16,
            "weapon_area_show_empty_bins": true,
            "players": ["JW", "flusha"],
            "rounds": [2, 3],
            "sides": [],
            "background": 0            
        }
    },
    {
        "headline": "The comeback was not real",
        "discovery": "But Team EnVyUS adapted to that aggressive style of play and awaited the offensive CTs. JW, pronax, KRIMZ and olofmeister were stopped dead in their tracks. Fnatic had to dramatically change their game, when in round 9 the score was 1:7...",
        "filter": {
            "render_foot_steps": false,
            "render_foot_paths": true,
            "render_weapon_fire": true,
            "render_player_deaths": true,
            "render_weapon_areas": false,
            "weapon_area_resolution": 16,
            "weapon_area_show_empty_bins": true,
            "players": ["JW", "pronax", "KRIMZ", "olofmeister"],
            "rounds": [4,5,6,7,8,9],
            "sides": [],
            "background": 0            
        }
    },
	{
	"headline": "Fnatic - Ground covered as Counter-Terrorists",
	"discovery": "Fnatic, which includes JW, pronax, KRIMZ, olofmeister and flusha seem to be defensive and they are not covering a lot of ground. This style of defeding is known to be as the standard, when playing as Counter-Terrorists.",
	"filter": {
		"render_foot_steps": false,
		"render_foot_paths": true,
		"render_weapon_fire": false,
		"render_player_deaths": false,
		"render_weapon_areas": false,
		"weapon_area_resolution": 16,
		"weapon_area_show_empty_bins": false,
		"players": ['JW', 'pronax', 'KRIMZ', 'olofmeister', 'flusha'],
		"rounds": [],
		"sides": ["CT"],
		"background": 0            
		}
	},
	{
	"headline": "EnVyUS - Ground covered  as Counter-Terrorists",
	"discovery": "On the other hand, EnVyUS, including Happy, NBK-, kennyS, kioShiMa and apEX are a lot more aggresive and they are trying to cover more space, in comparizon with the second team.",
	"filter": {
		"render_foot_steps": false,
		"render_foot_paths": true,
		"render_weapon_fire": false,
		"render_player_deaths": false,
		"render_weapon_areas": false,
		"weapon_area_resolution": 16,
		"weapon_area_show_empty_bins": false,
		"players": ['Happy', 'NBK-', 'kennyS', 'kioShiMa', 'apEX'],
		"rounds": [],
		"sides": ["CT"],
		"background": 0            
		}
    },
	{
	"headline": "EnVyUS - Number of deaths",
	"discovery": "EnVyUS were killed  overall a total number of 112. When they played as Terrorists, the team members died 50 times, while as CTs they had a number of 62 deaths. Therefore, if we compare the higher number of deaths as Counter-Terrorists to the ground covered, we have seen in the previous articles, the more aggressive tactics they used, actually brought them more deaths.",
	"filter": {
		"render_foot_steps": false,
		"render_foot_paths": false,
		"render_weapon_fire": false,
		"render_player_deaths": true,
		"render_weapon_areas": false,
		"weapon_area_resolution": 16,
		"weapon_area_show_empty_bins": false,
		"players": ['Happy', 'NBK-', 'kennyS', 'kioShiMa', 'apEX'],
		"rounds": [],
		"sides": [],
		"background": 0            
		}
	},
	{
	"headline": "Fnatic - Number of deaths",
	"discovery": "Fnatic were killed  overall a total number of 115. When they played as Terrorists, the members of the team died 58 times, while as CTs they had a number of 57 deaths. Compared to the other team, Fnatic had a more balanced number of deaths in both positions. Furthermore, even though Fnatic had a higher number of deaths overall, they managed to win the game.",
	"filter": {
		"render_foot_steps": false,
		"render_foot_paths": false,
		"render_weapon_fire": false,
		"render_player_deaths": true,
		"render_weapon_areas": false,
		"weapon_area_resolution": 16,
		"weapon_area_show_empty_bins": false,
		"players": ['JW', 'pronax', 'KRIMZ', 'olofmeister', 'flusha'],
		"rounds": [],
		"sides": [],
		"background": 0            
		}
	}
	];
    
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
        var text = auto_render_highlights(content[page].discovery);
        $('article p').fadeOut('fast', function() {
            $(this).html(text).fadeIn('fast', function() {
                auto_highlights_update_events();
            });
        });
        if (content[page]['filter']) {
            redraw(content[page]['filter']);
        }
    }
    
    
    /* parsing text and adding classes to words that should highlight elements
    *  in the visualization.
    */
    function auto_render_highlights(text) {
        var words = text.split(' ');
        for (var i in words) {
            word = words[i].replace(/\.|,|;|<.$|^.>|:/, "");
            if (players.indexOf(word) >= 0) {
                // player name recognized
                words[i] = "<span class='show player" + word + "'>" + words[i] + "</span>";
            } else if (teams.indexOf(word) >= 0) {
                // team name recognized
                words[i] = "<span class='show team" + word + "'>" + words[i] + "</span>";
            } else {
                for (var side in sides) {
                   if (sides[side].indexOf(word) >= 0) {
                       words[i] = "<span class='show side" + side + "'>" + words[i] + "</span>";
                   }
                }
            }
        }
        return words.join(' ');
    }
    
    function auto_highlights_update_events() {
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
        $(".show").addClass('active');
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