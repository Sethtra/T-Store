import { motion, AnimatePresence } from "framer-motion";
import { type Order } from "../../hooks/useOrders";
import Button from "../ui/Button";
import { useTranslation } from "react-i18next";

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

const InvoiceModal = ({ isOpen, onClose, order }: InvoiceModalProps) => {
  const { t, i18n } = useTranslation();
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    const printContent = document.getElementById("invoice-content");
    const windowUrl = "about:blank";
    const uniqueName = new Date().getTime();
    const windowName = "Print" + uniqueName;
    const printWindow = window.open(
      windowUrl,
      windowName,
      "left=50000,top=50000,width=0,height=0",
    );

    if (printWindow && printContent) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${i18n.language === 'kh' ? 'វិក្កយបត្រ' : 'Invoice'} - ${order.tracking_id || order.id}</title>
            <style>
              body { font-family: sans-serif; padding: 20px; color: #333; }
              .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
              .title { font-size: 24px; font-weight: bold; }
              .meta { text-align: right; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
              th, td { text-align: left; padding: 12px; border-bottom: 1px solid #eee; }
              th { background-color: #f9f9f9; }
              .total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px; }
              .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #888; }
            </style>
          </head>
          <body dir="${i18n.language === 'kh' ? 'ltr' : 'ltr'}">
            ${printContent.innerHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white text-black w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Toolbar */}
              <div className="p-4 bg-gray-100 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-bold text-gray-700">{i18n.language === 'kh' ? 'មើលវិក្កយបត្រ' : 'Invoice Preview'}</h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrint}
                    className="bg-white"
                  >
                    {i18n.language === 'kh' ? 'បោះពុម្ព / PDF' : 'Print / PDF'}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={onClose}>
                    {t("common.close")}
                  </Button>
                </div>
              </div>

              {/* Invoice Content (Printable) */}
              <div
                className="p-8 overflow-y-auto bg-white"
                id="invoice-content"
              >
                {/* Invoice Header */}
                <div className="flex justify-between items-start mb-12">
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight text-black">
                      {i18n.language === 'kh' ? 'វិក្កយបត្រ' : 'INVOICE'}
                    </h1>
                    <div className="mt-4 text-gray-500 text-sm">
                      <p className="font-bold text-black">T-Store Inc.</p>
                      <p>123 Tech Boulevard</p>
                      <p>Silicon Valley, CA 94000</p>
                      <p>support@tstore.com</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="w-12 h-12 bg-black text-white rounded-lg flex items-center justify-center ml-auto mb-4 text-xl font-bold">
                      T
                    </div>
                    <p className="text-sm text-gray-500">{t("orders.tracking_id")}</p>
                    <p className="text-xl font-bold mb-2 font-mono">
                      {order.tracking_id || order.id}
                    </p>
                    <p className="text-sm text-gray-500">{t("orders.date")}</p>
                    <p className="font-medium">
                      {new Date(order.created_at).toLocaleDateString(i18n.language === 'kh' ? 'km-KH' : 'en-US')}
                    </p>
                  </div>
                </div>

                {/* Items Table */}
                <table className="w-full mb-8">
                  <thead>
                    <tr className="bg-gray-50 border-y border-gray-100 text-sm uppercase text-gray-500">
                      <th className="py-3 px-2 font-semibold">{i18n.language === 'kh' ? 'ទំនិញ' : 'Item'}</th>
                      <th className="py-3 px-2 font-semibold text-right">
                        {i18n.language === 'kh' ? 'ចំនួន' : 'Qty'}
                      </th>
                      <th className="py-3 px-2 font-semibold text-right">
                        {t("common.price")}
                      </th>
                      <th className="py-3 px-2 font-semibold text-right">
                        {t("orders.total")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {order.items.map((item) => (
                      <tr key={item.id}>
                        <td className="py-4 px-2">
                          <p className="font-medium text-gray-900">
                            {item.product_title}
                          </p>
                          {item.attributes &&
                            Object.keys(item.attributes).length > 0 && (
                              <div className="text-xs text-gray-500 mt-1">
                                {Object.entries(item.attributes).map(
                                  ([key, value]) => (
                                    <span key={key} className="mr-3">
                                      {key}:{" "}
                                      <span className="font-semibold">
                                        {value}
                                      </span>
                                    </span>
                                  ),
                                )}
                              </div>
                            )}
                        </td>
                        <td className="py-4 px-2 text-right">
                          {item.quantity}
                        </td>
                        <td className="py-4 px-2 text-right">
                          ${Number(item.price).toFixed(2)}
                        </td>
                        <td className="py-4 px-2 text-right font-medium">
                          ${(Number(item.price) * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Totals */}
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between text-gray-500">
                      <span>{t("cart.subtotal")}</span>
                      <span>${Number(order.total).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>{i18n.language === 'kh' ? 'ពន្ធ (០%)' : 'Tax (0%)'}</span>
                      <span>$0.00</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>{t("orders.delivery")}</span>
                      <span>{t("orders.free")}</span>
                    </div>
                    <div className="h-px bg-gray-200 my-2"></div>
                    <div className="flex justify-between text-xl font-bold text-black">
                      <span>{t("checkout.total")}</span>
                      <span>${Number(order.total).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-16 pt-8 border-t border-gray-100 text-center text-gray-400 text-sm">
                  <p>{i18n.language === 'kh' ? 'អរគុណសម្រាប់ការទិញទំនិញជាមួយ T-Store!' : 'Thank you for shopping with T-Store!'}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default InvoiceModal;
