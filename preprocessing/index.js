var fs = require('fs');
var jsgo = require('jsgo');

var demo_name = 'ESLOneCologne2015-fnatic-vs-envyus-dust2';

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
    
    demo = new jsgo.Demo();
    if ('game.weapon_fire' in event_subscriptions) {
        demo.on('game.weapon_fire', function(event) {
            var player = event.player;
            var team = player.getTeam(this);
            event_subscriptions['game.weapon_fire'].push({
                'uid': player.getUserId(),
                'tick': demo.getTick(),
                'round': demo.getRound(),
                'player': player.getName(),
                'team': team.getClanName(),
                'side': team.getSide(),
                'position': player.getPosition(),
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
                'uid': player.getUserId(),
                'tick': demo.getTick(),
                'round': demo.getRound(),
                'player': player.getName(),
                'team': team.getClanName(),
                'side': team.getSide(),
                'position': player.getPosition(),
                'last_place_name': player.getLastPlaceName(),
                'eye_angle': player.getEyeAngle(),
                'killed_by': event.weapon
            });
        });
    } 
    if ('game.player_footstep' in event_subscriptions) {
        demo.on('game.player_footstep', function(event) {
            var player = event.player;
            var team = player.getTeam(this);
            var weapon_name = player.getActiveWeapon().classInfo.name;
            event_subscriptions['game.player_footstep'].push({
                'uid': player.getUserId(),
                'tick': demo.getTick(),
                'round': demo.getRound(),
                'player': player.getName(),
                'team': team.getClanName(),
                'side': team.getSide(),
                'position': player.getPosition(),
                'last_place_name': player.getLastPlaceName(),
                'eye_angle': player.getEyeAngle(),
                'weapon': weapon_name.replace('CWeapon', '').toLowerCase()
            });
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