import { registerDependency } from '@rolster/invertly';

export interface CatalogNavigationState {
  keyword: string;
  page: number;
  scrollTop: number;
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class CatalogNavigationStore {
  private navigation?: CatalogNavigationState;

  private catalogPath = '';

  private currentPath = '';

  private previousPath = '';

  public track(path: string): void {
    if (path !== this.currentPath) {
      this.previousPath = this.currentPath;
      this.currentPath = path;
    }
  }

  public remember(path: string, navigation: CatalogNavigationState): void {
    this.catalogPath = path;
    this.navigation = { ...navigation };
  }

  public restorable(path: string): Undefined<CatalogNavigationState> {
    return this.catalogPath === path && this.comesFromDetail(path)
      ? this.navigation
      : undefined;
  }

  public reset(): void {
    this.navigation = undefined;
    this.catalogPath = '';
    this.currentPath = '';
    this.previousPath = '';
  }

  private comesFromDetail(path: string): boolean {
    if (!this.previousPath.startsWith(`${path}/`)) {
      return false;
    }

    const [segment] = this.previousPath.slice(path.length + 1).split('/');

    return UUID_PATTERN.test(segment);
  }
}

registerDependency(CatalogNavigationStore, { singleton: true });
