import { useState, useEffect } from 'react';
import { billsAPI } from '../services/api';
import Layout from '../components/Layout';
import {
  Search,
  Filter,
  Receipt,
  DollarSign,
  CreditCard,
  Wallet,
  Edit,
  Trash2,
  Eye,
  FileText,
  Download,
} from 'lucide-react';

const Bills = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [filters, setFilters] = useState({
    paymentStatus: '',
  });

  // Edit form state
  const [editForm, setEditForm] = useState({
    items: [],
    discount: 0,
    discountType: 'percentage',
    gstRate: 18,
    customerGstin: '',
    paymentMethod: 'cash',
  });

  useEffect(() => {
    fetchBills();
  }, [filters]);

  const fetchBills = async () => {
    try {
      const response = await billsAPI.getAll(filters);
      setBills(response.data.bills);
    } catch (error) {
      console.error('Error fetching bills:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewBill = async (bill) => {
    try {
      const response = await billsAPI.getById(bill._id);
      setSelectedBill(response.data);
    } catch (error) {
      console.error('Error fetching bill:', error);
    }
  };

  const handleEditBill = (bill) => {
    setEditForm({
      items: bill.items,
      discount: bill.discount || 0,
      discountType: bill.discountType || 'percentage',
      gstRate: bill.taxRate || 18,
      customerGstin: bill.customerGstin || '',
      paymentMethod: bill.paymentMethod || 'cash',
    });
    setSelectedBill(bill);
    setShowEditModal(true);
  };

  const calculateTotal = () => {
    let subtotal = editForm.items.reduce((sum, item) => sum + item.total, 0);
    let discount = 0;
    if (editForm.discountType === 'percentage') {
      discount = (subtotal * editForm.discount) / 100;
    } else {
      discount = editForm.discount;
    }
    const taxableAmount = subtotal - discount;
    const tax = (taxableAmount * editForm.gstRate) / 100;
    const total = taxableAmount + tax;
    return { subtotal, discount, tax, total };
  };

  const handleUpdateBill = async () => {
    try {
      const totals = calculateTotal();
      await billsAPI.update(selectedBill._id, {
        ...editForm,
        discount: totals.discount,
        taxRate: editForm.gstRate,
        customerGstin: editForm.customerGstin,
      });
      setShowEditModal(false);
      fetchBills();
      alert('Bill updated successfully!');
    } catch (error) {
      console.error('Error updating bill:', error);
      alert('Failed to update bill');
    }
  };

  const handleGenerateGSTInvoice = async (bill) => {
    try {
      // Call API to generate GST invoice PDF
      const response = await billsAPI.generateGSTInvoice(bill._id);
      
      // Create a blob from the response and download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `GST-Invoice-${bill.billNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating GST invoice:', error);
      alert('Failed to generate GST invoice');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getPaymentIcon = (method) => {
    const icons = {
      cash: DollarSign,
      card: CreditCard,
      upi: Wallet,
      wallet: Wallet,
    };
    const Icon = icons[method] || DollarSign;
    return <Icon size={16} />;
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fadeIn">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-dark">Bills</h1>
          <p className="text-gray-500">Manage all bills and transactions</p>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="flex flex-col md:flex-row gap-4">
<div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by Bill No. or Order Type..."
                value={filters.searchTerm || ''}
                onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl bg-white text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm transition-all duration-200"
              />
            </div>
            <select
              value={filters.paymentStatus}
              onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value })}
              className="input max-w-xs"
            >
              <option value="">All Payments</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>

        {/* Bills Table */}
        <div className="card overflow-hidden">
          <table className="table">
            <thead>
              <tr>
                <th>Bill No.</th>
                <th>Date</th>
                <th>Order Type</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  </td>
                </tr>
              ) : bills.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-500">
                    No bills found
                  </td>
                </tr>
              ) : (
                bills
                  .filter((bill) => {
                    const search = (filters.searchTerm || '').toLowerCase();
                    return (
                      bill.billNumber?.toLowerCase().includes(search) ||
                      bill.orderId?.orderType?.toLowerCase().includes(search)
                    );
                  })
                  .map((bill) => (
                  <tr key={bill._id}>
                    <td className="font-medium">{bill.billNumber}</td>
                    <td>{new Date(bill.createdAt).toLocaleDateString()}</td>
                    <td className="capitalize">{bill.orderId?.orderType?.replace('_', ' ') || '-'}</td>
                    <td>{bill.items?.length || 0} items</td>
                    <td className="font-medium">{formatCurrency(bill.total)}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        {getPaymentIcon(bill.paymentMethod)}
                        <span className="capitalize">{bill.paymentMethod}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewBill(bill)}
                          className="p-1.5 hover:bg-blue-50 rounded text-blue-600 transition-colors"
                          title="View Bill"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleEditBill(bill)}
                          className="p-1.5 hover:bg-orange-50 rounded text-orange-600 transition-colors"
                          title="Edit Bill"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleGenerateGSTInvoice(bill)}
                          className="p-1.5 hover:bg-green-50 rounded text-green-600 transition-colors"
                          title="Generate GST Invoice"
                        >
                          <FileText size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Bill Modal */}
      {selectedBill && !showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white">
              <h2 className="text-xl font-bold">Bill #{selectedBill.billNumber}</h2>
            </div>
            <div className="p-6">
              <div className="space-y-1 mb-6 text-sm text-gray-600">
                <p className="font-semibold text-dark text-base">{selectedBill.restaurantId?.name || 'Restaurant Name'}</p>
                <p>{selectedBill.restaurantId?.address}</p>
                <p>Phone: {selectedBill.restaurantId?.phone}</p>
                {selectedBill.gstin && (
                  <p className="font-bold text-dark mt-2 border-t pt-2">GSTIN: {selectedBill.gstin}</p>
                )}
                {selectedBill.customerGstin && (
                  <p className="font-bold text-dark">Customer GSTIN: {selectedBill.customerGstin}</p>
                )}
              </div>

              <div className="space-y-3 mb-6">
                {selectedBill.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{item.quantity}x {item.name}</span>
                    <span>{formatCurrency(item.total)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-3 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(selectedBill.subtotal)}</span>
                </div>
                {selectedBill.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatCurrency(selectedBill.discount)}</span>
                  </div>
                )}
                {selectedBill.tax > 0 && (
                  <>
                    <div className="flex justify-between text-sm text-gray-600 italic">
                      <span>CGST ({(selectedBill.taxRate / 2).toFixed(1)}%)</span>
                      <span>{formatCurrency(selectedBill.tax / 2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 italic">
                      <span>SGST ({(selectedBill.taxRate / 2).toFixed(1)}%)</span>
                      <span>{formatCurrency(selectedBill.tax / 2)}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                  <span>Total</span>
                  <span>{formatCurrency(selectedBill.total)}</span>
                </div>
              </div>
            </div>
            <div className="p-4 border-t flex justify-end sticky bottom-0 bg-white">
              <button
                onClick={() => setSelectedBill(null)}
                className="btn btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Bill Modal */}
      {showEditModal && selectedBill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white">
              <h2 className="text-xl font-bold">Edit Bill #{selectedBill.billNumber}</h2>
            </div>
            <div className="p-6 space-y-5">
              {/* Items Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3 text-gray-700">Order Items</h3>
                <div className="space-y-2">
                  {editForm.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>{item.quantity}x {item.name}</span>
                      <span className="font-medium">{formatCurrency(item.total)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Discount */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Discount</label>
<div className="flex gap-2 items-stretch">
                  <select
                    value={editForm.discountType}
                    onChange={(e) => setEditForm({ ...editForm, discountType: e.target.value })}
                    className="input w-20 px-3 py-3 font-semibold text-sm bg-white border-2 border-gray-200 focus:border-primary focus:ring-0 rounded-l-xl"
                  >
                    <option value="percentage">%</option>
                    <option value="fixed">₹</option>
                  </select>
                  <input
                    type="number"
                    value={editForm.discount}
                    onChange={(e) => setEditForm({ ...editForm, discount: parseFloat(e.target.value) || 0 })}
                    className="w-full h-14 px-10 py-3 text-2xl font-bold text-black bg-white border-2 border-gray-200 rounded-r-2xl shadow-lg focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20 min-w-[200px]"
                    min="0"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* GST Rate */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">GST Rate (%)</label>
                <input
                  type="number"
                  value={editForm.gstRate}
                  onChange={(e) => setEditForm({ ...editForm, gstRate: parseFloat(e.target.value) || 0 })}
                  className="input text-base px-4 py-2.5"
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder="Enter GST rate"
                />
              </div>

              {/* Customer GSTIN */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Customer GSTIN (Optional)</label>
                <input
                  type="text"
                  value={editForm.customerGstin}
                  onChange={(e) => setEditForm({ ...editForm, customerGstin: e.target.value.toUpperCase() })}
                  className="input text-base px-4 py-2.5"
                  placeholder="Enter customer GSTIN"
                  maxLength="15"
                />
                <p className="text-xs text-gray-500 mt-1">Format: 22AAAAA0000A1Z5</p>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Payment Method</label>
                <select
                  value={editForm.paymentMethod}
                  onChange={(e) => setEditForm({ ...editForm, paymentMethod: e.target.value })}
                  className="input text-base px-4 py-2.5"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="upi">UPI</option>
                  <option value="wallet">Wallet</option>
                </select>
              </div>

              {/* Total Calculation */}
              <div className="border-t pt-4 space-y-2 bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatCurrency(calculateTotal().subtotal)}</span>
                </div>
                {calculateTotal().discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-{formatCurrency(calculateTotal().discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">GST ({editForm.gstRate}%)</span>
                  <span className="font-medium">{formatCurrency(calculateTotal().tax)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(calculateTotal().total)}</span>
                </div>
              </div>
            </div>
            <div className="p-4 border-t flex gap-3 justify-end sticky bottom-0 bg-white">
              <button
                onClick={() => setShowEditModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateBill}
                className="btn btn-primary"
              >
                Update Bill
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Bills;
