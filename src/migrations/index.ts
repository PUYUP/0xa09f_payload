import * as migration_20261104_011710_initial from './20261104_011710_initial';
import * as migration_20261104_043706_add_review_body_and_source from './20261104_043706_add_review_body_and_source';

export const migrations = [
  {
    up: migration_20261104_011710_initial.up,
    down: migration_20261104_011710_initial.down,
    name: '20261104_011710_initial',
  },
  {
    up: migration_20261104_043706_add_review_body_and_source.up,
    down: migration_20261104_043706_add_review_body_and_source.down,
    name: '20261104_043706_add_review_body_and_source'
  },
];
