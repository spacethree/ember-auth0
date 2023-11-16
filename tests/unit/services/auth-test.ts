import { module, skip } from 'qunit';
import { setupTest } from 'dummy/tests/helpers';

module('Unit | Service | auth', function (hooks) {
  setupTest(hooks);

  // TODO: Replace this with your real tests.
  skip('it exists', function (assert) {
    const service = this.owner.lookup('service:auth');
    assert.ok(service);
  });
});
