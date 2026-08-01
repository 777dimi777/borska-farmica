import helmet from 'helmet';
describe('HTTP security dependencies', () => {
  it('provides Helmet middleware', () =>
    expect(typeof helmet()).toBe('function'));
});
