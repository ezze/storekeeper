const levels = [{
    name: 'Original',
    levelSets: [{
        name: 'Original',
        url: 'levels/original.json'
    }]
}];

const sasquatchLevelSets = {
    name: 'Sasquatch',
    levelSets: []
};

for (let i = 1; i <= 12; i += 1) {
    sasquatchLevelSets.levelSets.push({
        name: 'Sasquatch ' + i,
        url: 'levels/sasquatch-' + (i < 10 ? '0' : '') + i + '.sok'
    });
}
levels.push(sasquatchLevelSets);

levels.push({
    name: 'Haikemono',
    levelSets: [{
        name: 'Haikemono',
        url: 'levels/haikemono.sok'
    }]
});

export default {
    levels: levels
};
