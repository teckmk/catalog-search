export interface Product {
  id: string;
  name: string;
  categories: string[];
  aisleNumber: number;
}

export interface CatalogItem {
  aisleNumber: number;
  categories: string[];
  products: Product[];
}

export type Catalog = CatalogItem[];