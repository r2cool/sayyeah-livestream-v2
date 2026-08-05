import * as migration_20250929_111647 from './20250929_111647';
import * as migration_20260805_122858_my_livestreams_migration from './20260805_122858_my_livestreams_migration';

export const migrations = [
  {
    up: migration_20250929_111647.up,
    down: migration_20250929_111647.down,
    name: '20250929_111647',
  },
  {
    up: migration_20260805_122858_my_livestreams_migration.up,
    down: migration_20260805_122858_my_livestreams_migration.down,
    name: '20260805_122858_my_livestreams_migration'
  },
];
