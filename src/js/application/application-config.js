'use strict';

var levels = [{
    name: 'Classic',
    levelSets: [{
        name: 'Classic',
        url: 'assets/levels/classic.json'
    }]
}];

var sasquatchLevelSets = {
    name: 'Sasquatch',
    levelSets: []
};
for (var i = 1; i <= 12; i += 1) {
    sasquatchLevelSets.levelSets.push({
        name: 'Sasquatch ' + i,
        url: 'assets/levels/sasquatch-' + (i < 10 ? '0' : '') + i + '.sok'
    });
}
levels.push(sasquatchLevelSets);

levels.push({
    name: 'Haikemono',
    levelSets: [{
        name: 'Haikemono',
        url: 'assets/levels/haikemono.sok'
    }]
});

export default {
    levels: levels
};