import cloudbase from '@cloudbase/js-sdk';

const app = cloudbase.init({
  env: 'travel-with-you-d6f64m3i1642f307',
});

export const auth = app.auth({ persistence: 'local' });
export const db = app.database();
