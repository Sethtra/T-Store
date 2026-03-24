import { useState } from 'react';
import { useDebounce } from '../../hooks/useDebounce';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { useAdminInventory, useStockHistory, useAdjustStock } from '../../hooks/useInventory';
import Button from '../../components/ui/Button';
import AdminLayout from '../../components/admin/AdminLayout';

const InventoryPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [adjustAmount, setAdjustAmount] = useState<number | ''>('');
  const [adjustNotes, setAdjustNotes] = useState('');
  const debouncedSearch = useDebounce(search, 500);

  const { data: inventoryData, isLoading } = useAdminInventory({
    page,
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
  });

  const { data: historyData, isLoading: historyLoading } = useStockHistory(selectedProduct?.id);
  const adjustMutation = useAdjustStock();

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || adjustAmount === '' || adjustAmount === 0) return;

    try {
      await adjustMutation.mutateAsync({
        product_id: selectedProduct.id,
        quantity_change: Number(adjustAmount),
        notes: adjustNotes || 'Manual adjustment via dashboard',
      });
      setAdjustAmount('');
      setAdjustNotes('');
      // optionally show success toast here
    } catch (err) {
      console.error('Failed to adjust stock', err);
    }
  };

  const getStockStatusBadge = (stock: number) => {
    let styles = "";
    let label = "";
    if (stock <= 0) {
      styles = "text-red-400 bg-red-500/10";
      label = "Out of Stock";
    } else if (stock <= 10) {
      styles = "text-amber-400 bg-amber-500/10";
      label = "Low Stock";
    } else {
      styles = "text-emerald-400 bg-emerald-500/10";
      label = "In Stock";
    }
    return (
      <span className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider whitespace-nowrap ${styles}`}>
        {label}
      </span>
    );
  };

  return (
    <AdminLayout>
      <div className="w-full px-4 lg:px-8 py-4 lg:py-6 space-y-4 lg:space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
              Inventory Management
            </h1>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              Track and manage stock levels across all products
            </p>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-[320px]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search products by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] cursor-pointer"
          >
            <option value="">All Stock Status</option>
            <option value="in">In Stock (&gt;10)</option>
            <option value="low">Low Stock (1-10)</option>
            <option value="out">Out of Stock (0)</option>
          </select>
        </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Products Table (Spans 2 cols on XL) */}
        <div className={`bg-[var(--color-bg-elevated)] rounded-xl border border-[var(--color-border)] overflow-hidden ${selectedProduct ? 'xl:col-span-2' : 'xl:col-span-3'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-surface)]">
                  <th className="px-3 lg:px-6 py-3 lg:py-4 font-semibold text-sm">Product</th>
                  <th className="px-3 lg:px-6 py-3 lg:py-4 font-semibold text-sm hidden sm:table-cell">Price</th>
                  <th className="px-3 lg:px-6 py-3 lg:py-4 font-semibold text-sm text-center">Stock</th>
                  <th className="px-3 lg:px-6 py-3 lg:py-4 font-semibold text-sm">Status</th>
                  <th className="px-3 lg:px-6 py-3 lg:py-4 font-semibold text-sm text-right hidden md:table-cell">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-[var(--color-text-muted)]">
                      <div className="w-8 h-8 border-4 border-t-[var(--color-primary)] border-[var(--color-border)] rounded-full animate-spin mx-auto mb-4"></div>
                      Loading inventory...
                    </td>
                  </tr>
                ) : inventoryData?.data.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-[var(--color-text-muted)]">
                      No products found.
                    </td>
                  </tr>
                ) : (
                  inventoryData?.data.map((product: any) => (
                    <tr 
                      key={product.id} 
                      onClick={() => setSelectedProduct(product)}
                      className={`hover:bg-[var(--color-bg-surface)] transition-colors cursor-pointer ${selectedProduct?.id === product.id ? 'bg-[var(--color-primary)]/5' : ''}`}
                    >
                      <td className="px-3 lg:px-6 py-3 lg:py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-lg border border-[var(--color-border)] flex items-center justify-center overflow-hidden p-1 flex-shrink-0">
                            {product.images && product.images.length > 0 ? (
                              <img src={product.images[0]} alt={product.title} className="w-full h-full object-contain mix-blend-multiply" />
                            ) : (
                              <span className="text-gray-400">?</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium line-clamp-1">{product.title}</div>
                            <div className="text-xs text-[var(--color-text-muted)]">{product.category?.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap hidden sm:table-cell">
                        ${Number(product.price).toFixed(2)}
                      </td>
                      <td className="px-3 lg:px-6 py-3 lg:py-4 text-center">
                        <span className="font-mono font-medium text-lg">{product.stock}</span>
                      </td>
                      <td className="px-3 lg:px-6 py-3 lg:py-4">
                        {getStockStatusBadge(product.stock)}
                      </td>
                      <td className="px-3 lg:px-6 py-3 lg:py-4 text-right hidden md:table-cell">
                        <button 
                          className="text-[var(--color-primary)] hover:underline text-sm font-medium"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProduct(product);
                          }}
                        >
                          Manage Stock
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {inventoryData?.meta && inventoryData.meta.last_page > 1 && (
            <div className="px-6 py-4 border-t border-[var(--color-border)] flex items-center justify-between">
              <span className="text-sm text-[var(--color-text-muted)]">
                Showing {((inventoryData.meta.current_page - 1) * inventoryData.meta.per_page) + 1} to {Math.min(inventoryData.meta.current_page * inventoryData.meta.per_page, inventoryData.meta.total)} of {inventoryData.meta.total} products
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === inventoryData.meta.last_page}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Selected Product Detail Panel */}
        <AnimatePresence mode="popLayout">
          {selectedProduct && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }}
              className="bg-[var(--color-bg-elevated)] rounded-xl border border-[var(--color-border)] flex flex-col h-[calc(100vh-140px)] sticky top-24"
            >
              <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
                <h3 className="font-bold text-lg">Stock Details</h3>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors rounded-lg hover:bg-[var(--color-bg-surface)]"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                {/* Product Info Summary */}
                <div className="flex items-start gap-4 mb-8">
                  <div className="w-16 h-16 bg-white rounded-lg border border-[var(--color-border)] p-1 flex-shrink-0">
                    <img src={selectedProduct.images?.[0]} alt={selectedProduct.title} className="w-full h-full object-contain mix-blend-multiply" />
                  </div>
                  <div>
                    <h4 className="font-semibold line-clamp-2">{selectedProduct.title}</h4>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="text-sm text-[var(--color-text-muted)]">Current Stock:</div>
                      <div className="font-mono font-bold text-xl">{selectedProduct.stock}</div>
                    </div>
                  </div>
                </div>

                {/* Adjust Stock Form */}
                <div className="bg-[var(--color-bg-surface)] p-4 rounded-xl border border-[var(--color-border)] mb-8">
                  <h5 className="font-semibold mb-4 text-sm uppercase tracking-wider text-[var(--color-text-muted)]">Manual Adjustment</h5>
                  <form onSubmit={handleAdjustSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Quantity Change (+/-)</label>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setAdjustAmount(Number(adjustAmount || 0) - 1)} className="px-3 py-2 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-bg-surface)]">-</button>
                        <input
                          type="number"
                          value={adjustAmount}
                          onChange={(e) => setAdjustAmount(e.target.value ? Number(e.target.value) : '')}
                          placeholder="e.g. 50 or -10"
                          className="w-full px-3 py-2 bg-transparent border border-[var(--color-border)] rounded-lg focus:outline-none focus:border-[var(--color-primary)] text-center font-mono"
                          required
                        />
                        <button type="button" onClick={() => setAdjustAmount(Number(adjustAmount || 0) + 1)} className="px-3 py-2 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-bg-surface)]">+</button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Reason / Notes</label>
                      <input
                        type="text"
                        value={adjustNotes}
                        onChange={(e) => setAdjustNotes(e.target.value)}
                        placeholder="e.g. Restock shipment arrived"
                        className="w-full px-3 py-2 bg-transparent border border-[var(--color-border)] rounded-lg focus:outline-none focus:border-[var(--color-primary)] text-sm"
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      fullWidth 
                      isLoading={adjustMutation.isPending}
                      disabled={adjustAmount === '' || adjustAmount === 0}
                    >
                      Update Stock
                    </Button>
                    
                    {/* Preview new stock */}
                    {adjustAmount !== '' && adjustAmount !== 0 && (
                      <p className={`text-xs text-center mt-2 ${selectedProduct.stock + Number(adjustAmount) < 0 ? 'text-red-500 font-medium' : 'text-[var(--color-text-muted)]'}`}>
                        New stock will be: <span className="font-mono font-bold">{selectedProduct.stock + Number(adjustAmount)}</span>
                      </p>
                    )}
                  </form>
                </div>

                {/* History Timeline */}
                <div>
                  <h5 className="font-semibold mb-4 text-sm uppercase tracking-wider text-[var(--color-text-muted)] flex items-center justify-between">
                    <span>Stock History</span>
                    {historyLoading && <span className="text-xs normal-case animate-pulse">Loading...</span>}
                  </h5>
                  
                  {historyData?.movements && historyData.movements.length > 0 ? (
                    <div className="relative border-l border-[var(--color-border)] ml-3 space-y-6 pb-4">
                      {historyData.movements.map((movement: any) => (
                        <div key={movement.id} className="relative pl-6">
                          {/* Timeline dot */}
                          <div className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-[var(--color-bg-elevated)] ${
                            movement.type === 'sale' ? 'bg-red-400' :
                            movement.type === 'restock' ? 'bg-emerald-400' :
                            movement.type === 'cancellation' ? 'bg-blue-400' :
                            'bg-amber-400' // adjustment
                          }`} />
                          
                          <div className="flex justify-between items-start mb-1">
                            <div>
                              <span className="font-medium capitalize text-sm">{movement.type}</span>
                              <span className="text-xs text-[var(--color-text-muted)] ml-2">{format(new Date(movement.created_at), 'MMM d, yyyy h:mm a')}</span>
                            </div>
                            <span className={`font-mono text-sm font-bold ${movement.quantity_change > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                              {movement.quantity_change > 0 ? '+' : ''}{movement.quantity_change}
                            </span>
                          </div>
                          
                          {movement.reference && (
                            <p className="text-xs text-[var(--color-primary)] font-medium mt-1">{movement.reference}</p>
                          )}
                          {movement.notes && (
                            <p className="text-xs text-[var(--color-text-secondary)] mt-1">{movement.notes}</p>
                          )}
                          {movement.created_by && (
                            <p className="text-[10px] text-[var(--color-text-muted)] mt-1">by {movement.created_by.name}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-sm text-[var(--color-text-muted)] border border-dashed border-[var(--color-border)] rounded-xl">
                      No stock movement history found.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
    </AdminLayout>
  );
};

export default InventoryPage;
