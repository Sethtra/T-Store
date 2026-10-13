import { useMemo } from "react";
import { useCategories, useProducts, type Category, type Product } from "./useProducts";

export interface CatalogCategory {
  category: Category;
  products: Product[];
  /** Category banner if set, otherwise the first product image in it */
  image?: string;
}

/**
 * One request for up to 50 products, grouped by their (leaf) category.
 * Feeds the homepage category circles and the deal rows without extra calls.
 */
export const useCatalogIndex = () => {
  const { data: categories, isLoading: catsLoading } = useCategories();
  const { data: productsData, isLoading: productsLoading } = useProducts({ limit: 50 });

  const groups = useMemo<CatalogCategory[]>(() => {
    if (!categories || !productsData) return [];
    const byCategory = new Map<number, Product[]>();
    for (const p of productsData.data) {
      if (p.category_id == null) continue;
      const list = byCategory.get(p.category_id) ?? [];
      list.push(p);
      byCategory.set(p.category_id, list);
    }

    const leaves: Category[] = [];
    for (const cat of categories) {
      if (cat.children?.length) leaves.push(...cat.children);
      else leaves.push(cat);
    }

    return leaves
      .map((category) => {
        const products = byCategory.get(category.id) ?? [];
        return { category, products, image: category.banner_image || products[0]?.images?.[0] };
      })
      .filter((g) => g.products.length > 0)
      .sort((a, b) => b.products.length - a.products.length);
  }, [categories, productsData]);

  return { groups, isLoading: catsLoading || productsLoading };
};
