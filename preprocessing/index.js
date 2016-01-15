var fs = require('fs');
var jsgo = require('jsgo');

var demo_name = 'ESLOneCologne2015-fnatic-vs-envyus-dust2';

event_subscriptions = []
process.argv.forEach(function (val, index, array) {
    if (index > 1) {
        event_subscriptions.push(val);
    }
});

fs.readFile('demos/' + demo_name + '.dem', function(err, data) {
    output = {};
    
    demo = new jsgo.Demo();
    if ('weapon_fire' in event_subscriptions) {
        output['weapon_fire'] = [];
        demo.on('game.weapon_fire', function(event) {
            var player = event.player;
            var team = player.getTeam(this);
            output['weapon_fire'].push({
                'tick': demo.getTick(),
                'player': player.getName(),
                'team': team.getClanName(),
                'side': team.getSide(),
                'position': player.getPosition(),
                'eye_angle': player.getEyeAngle(),
                'weapon': event.weapon
            });
        });
    } else if ('player_death' in event_subscriptions) {
        output['player_death'] = [];
        demo.on('game.player_death', function(event) {
            var player = event.player;
            var team = player.getTeam(this);
            output['player_death'].push({
                'tick': demo.getTick(),
                'player': player.getName(),
                'team': team.getClanName(),
                'side': team.getSide(),
                'position': player.getPosition(),
                'eye_angle': player.getEyeAngle(),
                'weapon': event.weapon
            });
        });
    } else if ('player_footstep') {
        output['player_footstep'] = [];
        demo.on('game.player_footstep', function(event) {
            var player = event.player;
            var team = player.getTeam(this);
            output['player_footstep'].push({
                'tick': demo.getTick(),
                'player': player.getName(),
                'team': team.getClanName(),
                'side': team.getSide(),
                'position': player.getPosition()
            });
        });
    }
    
    demo.parse(data);
    
    event_subscriptions.forEach(function (val, index, array) {
        fs.writeFile(
            'data/' + demo_name + '_' + val + '.json',
            JSON.stringify(output[val]),
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