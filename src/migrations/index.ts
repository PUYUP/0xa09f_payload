import * as migration_20261104_011710_initial from './20261104_011710_initial';

export const migrations = [
  {
    up: migration_20261104_011710_initial.up,
    down: migration_20261104_011710_initial.down,
    name: '20261104_011710_initial'
  },
];
