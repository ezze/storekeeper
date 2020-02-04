import { observable } from 'mobx';

import BasicStore from './BasicStore';

import {
  EVENT_LEVEL_CHANGE,
  EVENT_LEVEL_RESET,
  EVENT_MOVE_START,
  EVENT_MOVE_END
} from '../constants/event';

class GeneralStore extends BasicStore {
  @observable language;
  @observable levelNumber = 0;
  @observable movesCount = 0;
  @observable pushesCount = 0;
  @observable boxesCount = 0;
  @observable retractedBoxesCount = 0;

  constructor(options = {}) {
    super({
      ...options,
      key: 'general',
      include: ['language']
    });
  }

  init(options = {}) {
    const { eventBus } = options;
    if (!eventBus) {
      throw new TypeError('Event bus is not specified.');
    }
    this.eventBus = eventBus;

    this.onLevelChange = this.onLevelChange.bind(this);
    this.onLevelReset = this.onLevelReset.bind(this);
    this.onMoveStart = this.onMoveStart.bind(this);
    this.onMoveEnd = this.onMoveEnd.bind(this);

    this.eventBus.on(EVENT_LEVEL_CHANGE, this.onLevelChange);
    this.eventBus.on(EVENT_LEVEL_RESET, this.onLevelReset);
    this.eventBus.on(EVENT_MOVE_START, this.onMoveStart);
    this.eventBus.on(EVENT_MOVE_END, this.onMoveEnd);
  }

  destroy() {
    this.eventBus.off(EVENT_LEVEL_CHANGE, this.onLevelChange);
    return super.destroy();
  }

  updateLevelProperties(properties = {}) {
    const {
      levelNumber,
      movesCount,
      pushesCount,
      boxesCount,
      retractedBoxesCount
    } = properties;

    if (typeof levelNumber === 'number') {
      this.levelNumber = levelNumber;
    }

    if (typeof movesCount === 'number') {
      this.movesCount = movesCount;
    }

    if (typeof pushesCount === 'number') {
      this.pushesCount = pushesCount;
    }

    if (typeof boxesCount === 'number') {
      this.boxesCount = boxesCount;
    }

    if (typeof retractedBoxesCount === 'number') {
      this.retractedBoxesCount = retractedBoxesCount;
    }
  }

  onLevelChange(params) {
    this.updateLevelProperties(params);
  }

  onLevelReset(params) {
    this.updateLevelProperties(params);
  }

  onMoveStart(params) {
    this.updateLevelProperties(params);
  }

  onMoveEnd(params) {
    this.updateLevelProperties(params);
  }
}

export default GeneralStore;
