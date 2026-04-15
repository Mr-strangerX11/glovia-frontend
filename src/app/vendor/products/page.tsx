'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { vendorAPI } from '@/lib/api';
import { Plus, Edit2, Trash2, Loader2, Search, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Image from 'next/image';

interface Product {
  id?: string;
  _id?: string;
  name: string;
  slug: string;
  price: number;
  stockQuantity: number;
  isActive: boolean;
  isFeatured: boolean;
  images?: { url: string }[];
}

function extractRowsAndMeta(payload: any): { rows: Product[]; totalPages: number } {
  if (Array.isArray(payload)) {
    return { rows: payload as Product[], totalPages: 0 };
  }

  const directRows = Array.isArray(payload?.data) ? payload.data : null;
  if (directRows) {
    return {
      rows: directRows as Product[],
      totalPages: Number(payload?.meta?.totalPages || 0),
    };
  }

  const nestedRows = Array.isArray(payload?.data?.data) ? payload.data.data : null;
  if (nestedRows) {
    return {
      rows: nestedRows as Product[],
      totalPages: Number(payload?.data?.meta?.totalPages || 0),
    };
  }

  return { rows: [], totalPages: 0 };
}

export default function VendorProductsPage() {
  const { user, isChecking } = useAuthGuard({ roles: ['VENDOR'] });
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const selectAllCheckboxRef = useRef<HTMLInputElement>(null);

  const getProductId = (product: Product) => product.id || product._id || '';

  const toggleProductSelection = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const toggleSelectAll = (selectAll: boolean) => {
    if (selectAll) {
      const allIds = new Set(filteredProducts.map(p => getProductId(p)).filter(Boolean));
      setSelectedProducts(allIds);
    } else {
      setSelectedProducts(new Set());
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.size === 0) {
      toast.error('Please select products to delete');
      return;
    }

    const confirmMessage = `Are you sure you want to delete ${selectedProducts.size} product(s)? This action cannot be undone.`;
    if (!confirm(confirmMessage)) return;

    setIsDeleting(true);
    try {
      const deletePromises = Array.from(selectedProducts).map(id =>
        vendorAPI.deleteProduct(id).catch(error => {
          console.error(`Failed to delete product ${id}:`, error);
          return null;
        })
      );

      const results = await Promise.all(deletePromises);
      const successCount = results.filter(r => r !== null).length;
      
      if (successCount > 0) {
        toast.success(`${successCount} product(s) deleted successfully`);
        setSelectedProducts(new Set());
        fetchProducts();
      }
      
      if (successCount < selectedProducts.size) {
        toast.error(`Failed to delete ${selectedProducts.size - successCount} product(s)`);
      }
    } catch (error) {
      console.error('Bulk delete error:', error);
      toast.error('Failed to delete products');
    } finally {
      setIsDeleting(false);
    }
  };

  const fetchAllVendorProducts = async () => {
    const pageSize = 100;
    let page = 1;
    let totalPages = 1;
    const allRows: Product[] = [];

    while (page <= totalPages) {
      const { data } = await vendorAPI.getProducts({ page, limit: pageSize });
      const { rows, totalPages: parsedTotalPages } = extractRowsAndMeta(data);

      allRows.push(...rows);

      const nextTotalPages = parsedTotalPages;
      if (nextTotalPages > 0) {
        totalPages = nextTotalPages;
      } else if (rows.length < pageSize) {
        break;
      } else {
        totalPages = page + 1;
      }

      page += 1;
      if (page > 200) {
        break;
      }
    }

    const seen = new Set<string>();
    return allRows.filter((product) => {
      const id = getProductId(product);
      if (!id || seen.has(id)) {
        return false;
      }
      seen.add(id);
      return true;
    });
  };

  useEffect(() => {
    if (user) {
      fetchProducts();
    }
  }, [user]);

  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      const filtered = products.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      const isIndeterminate = selectedProducts.size > 0 && selectedProducts.size < filtered.length;
      selectAllCheckboxRef.current.indeterminate = isIndeterminate;
    }
  }, [selectedProducts, searchQuery, products]);

  const fetchProducts = async () => {
    try {
      const products = await fetchAllVendorProducts();
      setProducts(products);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (product: Product) => {
    const id = getProductId(product);
    if (!id) {
      toast.error('Invalid product ID');
      return;
    }
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await vendorAPI.deleteProduct(id);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  if (isChecking || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Products</h1>
            <p className="text-gray-600">Manage products you supply</p>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard/vendor" className="btn-outline">
              Back to Dashboard
            </Link>
            <Link href="/vendor/products/bulk" className="btn-outline inline-flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Bulk Upload
            </Link>
            <Link href="/vendor/products/new" className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Product
            </Link>
          </div>
        </div>

        <div className="card p-6">
          <div className="mb-4 flex items-center justify-between text-sm">
            <span className="inline-flex rounded-full bg-primary-50 px-3 py-1 font-medium text-primary-700">
              Total products loaded: {products.length}
            </span>
            {searchQuery && (
              <span className="text-gray-500">Showing {filteredProducts.length} result(s)</span>
            )}
          </div>

          <div className="mb-6 flex gap-3 items-center">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pr-10 w-full"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            
            {selectedProducts.size > 0 && (
              <button
                onClick={handleBulkDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 font-medium transition-colors"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete ({selectedProducts.size})
                  </>
                )}
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">No products found</p>
              <Link href="/vendor/products/new" className="btn-primary inline-flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Your First Product
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                      <input
                        ref={selectAllCheckboxRef}
                        type="checkbox"
                        checked={selectedProducts.size > 0 && filteredProducts.length > 0 && selectedProducts.size === filteredProducts.length}
                        onChange={(e) => toggleSelectAll(e.target.checked)}
                        className="w-4 h-4 rounded"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product) => {
                    const productId = getProductId(product);
                    const isSelected = selectedProducts.has(productId);
                    return (
                    <tr key={productId || product.slug} className={isSelected ? 'bg-blue-50' : ''}>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleProductSelection(productId)}
                          className="w-4 h-4 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {product.images?.[0] && (
                            <Image
                              src={product.images[0].url}
                              alt={product.name}
                              width={40}
                              height={40}
                              sizes="40px"
                              className="w-10 h-10 rounded object-cover mr-3"
                              loading="lazy"
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">{product.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">NPR {product.price}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.stockQuantity}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            product.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={productId ? `/vendor/products/${productId}/edit` : '/vendor/products'}
                            className="text-primary-600 hover:text-primary-900"
                            aria-label={`Edit ${product.name}`}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(product)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
