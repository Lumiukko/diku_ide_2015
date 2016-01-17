var fs = require('fs');
var jsgo = require('jsgo');

// Config
var demo_name = 'ESLOneCologne2015-fnatic-vs-envyus-dust2';
var footstep_tick_sample = 64;
var events = {
    'game.weapon_fire': [],
    'game.player_death': [],
    'game.player_footstep': [],
    'game.meta': []
}

var event_subscriptions = {};

process.argv.forEach(function (val, index, array) {
    if (index > 1) {
        if (val == 'all') {
            event_subscriptions = events;
            return;
        }
        if (val in events) {
            event_subscriptions[val] = [];
        } else {
            console.log('Unknown event argument: ' + val);
        }
    }
});

console.log('Parsing events ' + Object.keys(event_subscriptions).join(', ') + '.');

fs.readFile('demos/' + demo_name + '.dem', function(err, data) {
    var last_pos_tick = 0;
    demo = new jsgo.Demo();
    if ('game.weapon_fire' in event_subscriptions) {
        demo.on('game.weapon_fire', function(event) {
            var player = event.player;
            var team = player.getTeam(this);
            event_subscriptions['game.weapon_fire'].push({
                'guid': player.getGuid(),
                'tick': demo.getTick(),
                'round': demo.getRound(),
                'player': player.getName(),
                'team': team.getClanName(),
                'side': team.getSide(),
                'position': compress_position(player.getPosition()),
                'eye_angle': player.getEyeAngle(),
                'weapon': event.weapon
            });
        });
    }
    if ('game.player_death' in event_subscriptions) {
        demo.on('game.player_death', function(event) {
            var player = event.player;
            var team = player.getTeam(this);
            event_subscriptions['game.player_death'].push({
                'guid': player.getGuid(),
                'tick': demo.getTick(),
                'round': demo.getRound(),
                'player': player.getName(),
                'team': team.getClanName(),
                'side': team.getSide(),
                'position': compress_position(player.getPosition()),
                'last_place_name': player.getLastPlaceName(),
                'eye_angle': player.getEyeAngle(),
                'killed_by': event.weapon
            });
        });
    } 
    if ('game.player_footstep' in event_subscriptions) {
        var alive_players = {};
        demo.on('game.round_start', function(event) {
            for (var player in alive_players) {
                if (alive_players.hasOwnProperty(player)) {
                    alive_players[player] = true;
                }
            }
            if (this.getRound() !== 1) return;
            teams = this.getTeams();
            // only add players from the real opposing teams
            for (var i in teams) {
                if (typeof teams[i].getClanName === 'function' && teams[i].getClanName()) {
                    var team_players = teams[i].getPlayers(this);
                    for (var x in team_players) {
                        alive_players[team_players[x].getGuid()] = true;
                    }
                } 
            }
        });
        demo.on('game.player_death', function(event) {
            alive_players[event.player.getGuid()] = false;
        });
        demo.on('entity_updated', function(event) {
            if (last_pos_tick + footstep_tick_sample > this.getTick()) {
                return;
            }
            last_pos_tick = this.getTick();
            var players = this.getPlayers();
            for (var i in players) {
                var player = players[i];
                // don't add non-real players
                if (!player || !player.getHealth || !player.getActiveWeapon()) {
                    continue;
                }
                if (!alive_players[player.getGuid()]) {
                    // player already died  
                    continue;
                }
                var team = player.getTeam(this);
                var weapon = player.getActiveWeapon().classInfo.name;
                event_subscriptions['game.player_footstep'].push({
                    'guid': player.getGuid(),
                    'tick': this.getTick(),
                    'round': this.getRound(),
                    'player': player.getName(),
                    'team': team.getClanName(),
                    'player_health': player.getHealth(),
                    'side': team.getSide(),
                    'position': compress_position(player.getPosition()),
                    'last_place_name': player.getLastPlaceName(),
                    'eye_angle': player.getEyeAngle(),
                    'weapon': weapon.replace(/^(CWeapon|C)/, '').toLowerCase(),
                });   
            }
        });
    }
    
    if ('game.meta' in event_subscriptions) {
        demo.on('game.round_start', function(event) {
            event_subscriptions['game.meta'].push({
                'event': 'game.round_start',
                'tick': demo.getTick(),
                'round': demo.getRound(),
            });
        });
        demo.on('game.round_end', function(event) {
            var teams = demo.getTeams();
            var score = {};
            for (var i in teams) {
                if (typeof teams[i].getClanName === 'function' && teams[i].getClanName()) {
                    score[teams[i].getClanName()] = teams[i].getScore();
                } 
            }
            event_subscriptions['game.meta'].push({
                'event': 'game.round_end',
                'tick': demo.getTick(),
                'round': demo.getRound(),
                'score': score,
            });
        });
        demo.on('game.round_announce_match_start', function(event) {
            event_subscriptions['game.meta'].push({
                'event': 'game.round_announce_match_start',
                'tick': demo.getTick(),
                'round': demo.getRound(),
            });
        });
        demo.on('game.round_mvp', function(event) {
            if (event.player) {
                event_subscriptions['game.meta'].push({
                    'event': 'game.mvp',
                    'tick': demo.getTick(),
                    'round': demo.getRound(),
                    'player': event.player.getName(),
                    'uid': event.player.getUserId(),
                });
            }
        });
    }
    
    demo.parse(data);
    
    Object.keys(event_subscriptions).forEach(function (val, index, array) {
        var filename = 'data/' + demo_name + '_' + val.split(".")[1] + '.json';
        fs.writeFile(
            filename,
            JSON.stringify(event_subscriptions[val]),
            'ascii',
            function(err) {
                if(err) {
                    console.log(err);
                    return;
                }
                console.log('Saved ' + val + ' events.');
            }
        );
    });
    console.log('Finished');
});

function compress_position(pos) {
    pos.x = Math.round(pos.x * 100) / 100;
    pos.y = Math.round(pos.y * 100) / 100;
    pos.z = Math.round(pos.z * 100) / 100;
    return pos;
}