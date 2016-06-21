'use strict';

import Easel from 'easel';
    
var data = {
    images: ['img/sprites.png'],
    frames: {
        width: 32,
        height: 32,
        count: 23
    },
    animations: {
        box: [0],
        boxOnGoal: [1],
        wall: [2],
        goal: [3],
        workerLeftStand: [4],
        workerLeftWalk: [5, 12, true, 0.75],
        workerRightStand: [13],
        workerRightWalk: [14, 21, true, 0.75],
        space: [22]
    }
};

export default {
    instance: new Easel.SpriteSheet(data),
    data: data
};