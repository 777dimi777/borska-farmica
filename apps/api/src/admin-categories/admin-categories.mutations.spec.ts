import { categorySlug } from './category-slug';
describe('categorySlug', () => {
  it('transliterates Serbian letters and normalizes hyphens', () =>
    expect(categorySlug(' Čačak, Đubrivo -- Šljive Žute ')).toBe(
      'cacak-djubrivo-sljive-zute',
    ));
  it('can detect an empty generated slug', () =>
    expect(categorySlug('---')).toBe(''));
});
