import { invertly } from '@rolster/invertly';
import { CatalogNavigationStore } from './CatalogNavigationStore';

const UUID = '3f2504e0-4f89-11d3-9a0c-0305e82c3301';

const navigation = { keyword: 'rolster', page: 3, scrollTop: 480 };

describe('CatalogNavigationStore', () => {
  it('should be registered as a singleton in invertly', () => {
    expect(invertly(CatalogNavigationStore)).toBe(
      invertly(CatalogNavigationStore)
    );
    expect(invertly(CatalogNavigationStore)).toBeInstanceOf(
      CatalogNavigationStore
    );
  });

  it('should restore the navigation when coming back from a detail route', () => {
    const store = new CatalogNavigationStore();

    store.track('/products');
    store.remember('/products', navigation);
    store.track(`/products/${UUID}`);
    store.track('/products');

    expect(store.restorable('/products')).toEqual(navigation);
  });

  it('should keep a copy of the remembered navigation', () => {
    const store = new CatalogNavigationStore();
    const state = { ...navigation };

    store.track('/products');
    store.remember('/products', state);
    store.track(`/products/${UUID}`);
    store.track('/products');

    state.page = 99;

    expect(store.restorable('/products')?.page).toBe(3);
  });

  it('should not restore when the previous route is not a detail', () => {
    const store = new CatalogNavigationStore();

    store.track('/products');
    store.remember('/products', navigation);
    store.track('/products/register');
    store.track('/products');

    expect(store.restorable('/products')).toBeUndefined();
  });

  it('should not restore when coming from an unrelated route', () => {
    const store = new CatalogNavigationStore();

    store.track('/products');
    store.remember('/products', navigation);
    store.track(`/customers/${UUID}`);
    store.track('/products');

    expect(store.restorable('/products')).toBeUndefined();
  });

  it('should not restore a path different from the remembered one', () => {
    const store = new CatalogNavigationStore();

    store.track('/products');
    store.remember('/products', navigation);
    store.track(`/products/${UUID}`);
    store.track('/customers');

    expect(store.restorable('/customers')).toBeUndefined();
  });

  it('should ignore repeated tracks of the same path', () => {
    const store = new CatalogNavigationStore();

    store.track('/products');
    store.remember('/products', navigation);
    store.track(`/products/${UUID}`);
    store.track('/products');
    store.track('/products');

    expect(store.restorable('/products')).toEqual(navigation);
  });

  it('should forget everything on reset', () => {
    const store = new CatalogNavigationStore();

    store.track('/products');
    store.remember('/products', navigation);
    store.track(`/products/${UUID}`);
    store.track('/products');
    store.reset();

    expect(store.restorable('/products')).toBeUndefined();
  });
});
