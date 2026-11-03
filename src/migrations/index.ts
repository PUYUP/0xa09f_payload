import * as migration_20261103_092633 from './20261103_092633';
import * as migration_20261103_150756_add_post_language from './20261103_150756_add_post_language';

export const migrations = [
  {
    up: migration_20261103_092633.up,
    down: migration_20261103_092633.down,
    name: '20261103_092633',
  },
  {
    up: migration_20261103_150756_add_post_language.up,
    down: migration_20261103_150756_add_post_language.down,
    name: '20261103_150756_add_post_language'
  },
];
