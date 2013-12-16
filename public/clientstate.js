require('stately.js')

var clientState = Stately.machine({
    'CONNECTED': {
        'creategame': 'WAITING',
        'joingame': 'INGAME'
    },
    'WAITING': {
        'playerjoined': 'INGAME'
    },
    'INGAME': {
        'yourturn': 'WAITMOVE',
        'gameended': 'ENDGAME'
    },
    'ENDGAME': {
        'playerquit': 'CONNECTED'
    },
    'WAITMOVE': {
        'play': 'INGAME'
    }
});