import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordersAPI, menuAPI, billsAPI } from '../services/api';
import { calculateBilling } from '../utils/billing';
import Layout from '../components/Layout';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Clock,
  CheckCircle,
  XCircle,
  ChefHat,
  Truck,
  Receipt,
  ShoppingBag,
  CheckCircle2,
  Printer,
} from 'lucide-react';

// Extracted utility functions outside to prevent recreation
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount);
};

// Highly optimized memoized menu card
const MenuItemCard = React.memo(({ item, quantity, onAdd }) => {
  return (
    <button
      onClick={() => onAdd(item)}
      disabled={!item.isAvailable}
      className={`p-3 rounded-lg text-left transition-all relative border-2 ${
        quantity > 0 
          ? 'bg-primary/10 border-primary text-primary shadow-sm' 
          : 'bg-gray-50 border-transparent hover:border-gray-200'
      } ${!item.isAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <div className="flex justify-between items-start">
        <p className="font-semibold text-sm leading-tight">{item.name}</p>
        {quantity > 0 && (
          <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full -mt-1 -mr-1">
            {quantity}x
          </span>
        )}
      </div>
      <p className={`text-xs mt-1 ${quantity > 0 ? 'text-primary/80' : 'text-gray-500'}`}>
        {formatCurrency(item.price)}
      </p>
    </button>
  );
});

// Highly optimized memoized cart item card
const CartItemCard = React.memo(({ item, onUpdateQuantity }) => {
  return (
    <div className="flex items-center justify-between p-3 bg-white border shadow-sm rounded-lg">
      <div className="flex-1">
        <p className="font-semibold text-sm text-gray-800 leading-tight">{item.name}</p>
        <p className="text-xs text-gray-500 mt-0.5">
          {formatCurrency(item.price)} each
        </p>
      </div>
      <div className="flex flex-col items-end gap-1.5 ml-2">
        <span className="font-bold text-sm text-primary">{formatCurrency(item.total)}</span>
        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg shadow-sm">
          <button 
            onClick={() => onUpdateQuantity(item.menuItemId, -1)}
            className="px-2.5 py-1 text-gray-600 hover:bg-red-50 hover:text-red-500 rounded-l-lg transition-colors active:bg-gray-200"
          >
            -
          </button>
          <span className="px-2 font-bold text-xs min-w-[1.5rem] text-center">{item.quantity}</span>
          <button 
            onClick={() => onUpdateQuantity(item.menuItemId, 1)}
            className="px-2.5 py-1 text-gray-600 hover:bg-primary/10 hover:text-primary rounded-r-lg transition-colors active:bg-gray-200"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
});

const SuccessModal = ({ data, onNewOrder, onViewBill, formatCurrency }) => {
  if (!data) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-scaleIn">
        <div className="p-8 text-center">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-3xl font-black text-gray-800 mb-2">Order Success!</h2>
          <p className="text-gray-500 mb-6">Order #{data.orderId?.slice(-6).toUpperCase()} has been placed.</p>
          
          <div className="bg-gray-50 rounded-2xl p-6 mb-8">
            <div className="flex justify-between items-center mb-1">
              <span className="text-gray-500 font-bold uppercase text-xs tracking-wider">Total Amount</span>
              <span className="text-2xl font-black text-green-600">{formatCurrency(data.total)}</span>
            </div>
            <p className="text-sm text-gray-600 font-medium">Customer: {data.customerName}</p>
          </div>

          <div className="flex flex-col gap-3">
            <button 
              onClick={onViewBill}
              className="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all flex items-center justify-center gap-2"
            >
              <Receipt size={20} />
              View Bill / Print
            </button>
            <button 
              onClick={onNewOrder}
              className="w-full py-4 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all"
            >
              New Order
            </button>
          </div>
        </div>
        
        {data.whatsappSid && (
          <div className="bg-green-50 p-4 text-center border-t border-green-100">
            <p className="text-xs font-bold text-green-700 flex items-center justify-center gap-1">
              ✅ WhatsApp Bill Sent Successfully
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [menuSearchTerm, setMenuSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    orderType: '',
  });

  const [successData, setSuccessData] = useState(null);

  // New order form state
  const [newOrder, setNewOrder] = useState({
    orderType: 'dine_in',
    customerName: '',
    customerPhone: '',
    tableNumber: '',
    items: [],
    notes: '',
    discount: 0,
    isGstEnabled: true,
    taxRate: 18,
    taxLabel: 'GST',
  });

  const nameRef = useRef(null);
  const phoneRef = useRef(null);

  const isOrderValid = useMemo(() => {
    const isNameValid = newOrder.customerName && newOrder.customerName.trim().length > 0;
    const isPhoneValid = newOrder.customerPhone && /^\d{10}$/.test(newOrder.customerPhone);
    const hasItems = newOrder.items.length > 0;
    return isNameValid && isPhoneValid && hasItems;
  }, [newOrder.customerName, newOrder.customerPhone, newOrder.items]);

  useEffect(() => {
    fetchOrders();
    fetchMenu();
  }, [filters]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrders();
    }, 10000);
    return () => clearInterval(interval);
  }, [filters]);

  const fetchOrders = async () => {
    try {
      const response = await ordersAPI.getAll(filters);
      setOrders(response.data.orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMenu = async () => {
    try {
      const [catRes, itemsRes] = await Promise.all([
        menuAPI.getCategories(),
        menuAPI.getAllItems(),
      ]);
      setCategories(catRes.data);
      setMenuItems(itemsRes.data);
    } catch (error) {
      console.error('Error fetching menu:', error);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateStatus(orderId, newStatus);
      fetchOrders();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleGenerateBill = async (order) => {
    try {
      await billsAPI.create({
        orderId: order._id,
        paymentMethod: 'cash',
      });
      fetchOrders();
      alert('Bill generated successfully!');
    } catch (error) {
      console.error('Error generating bill:', error);
      alert('Failed to generate bill');
    }
  };

  const handleViewBill = (order) => {
    if (order.billId) {
      // Navigate to bills page with filter
      navigate(`/admin/bills?orderId=${order._id}`);
    }
  };

  const addItemToOrder = useCallback((item) => {
    setNewOrder((prevOrder) => {
      const existingItem = prevOrder.items.find((i) => i.menuItemId === item._id);
      if (existingItem) {
        return {
          ...prevOrder,
          items: prevOrder.items.map((i) =>
            i.menuItemId === item._id
              ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.price }
              : i
          ),
        };
      } else {
        return {
          ...prevOrder,
          items: [
            ...prevOrder.items,
            {
              menuItemId: item._id,
              name: item.name,
              price: item.price,
              quantity: 1,
              total: item.price,
            },
          ],
        };
      }
    });
  }, []);

  const updateItemQuantity = useCallback((itemId, delta) => {
    setNewOrder((prevOrder) => {
      const existingItemIndex = prevOrder.items.findIndex((i) => i.menuItemId === itemId);
      if (existingItemIndex === -1) return prevOrder;

      const item = prevOrder.items[existingItemIndex];
      const newQuantity = item.quantity + delta;

      if (newQuantity <= 0) {
        return {
          ...prevOrder,
          items: prevOrder.items.filter((i) => i.menuItemId !== itemId),
        };
      }

      const updatedItems = [...prevOrder.items];
      updatedItems[existingItemIndex] = {
        ...item,
        quantity: newQuantity,
        total: newQuantity * item.price,
      };

      return {
        ...prevOrder,
        items: updatedItems,
      };
    });
  }, []);

  const handlePlaceOrder = async (keepOpen = false) => {
    console.log("Order Placed");
    
    if (newOrder.items.length === 0) {
      alert('Please add items to the order. Cannot place an empty order.');
      return;
    }

    try {
      const totals = calculateOrderTotal();
      const response = await ordersAPI.create({
        ...newOrder,
        subtotal: totals.subtotal,
        discount: newOrder.discount,
        tax: totals.tax,
        taxRate: newOrder.taxRate,
        taxLabel: newOrder.taxLabel,
        total: totals.finalTotal,
      });
      const { order: createdOrder } = response.data;
      
      if (!keepOpen) {
        setShowNewOrderModal(false);
      }
      
      // Cache values for success messages before reset
      const savedPhone = newOrder.customerPhone;
      const savedName = newOrder.customerName;

      // Reset form
      setNewOrder({
        orderType: 'dine_in',
        customerName: '',
        customerPhone: '',
        tableNumber: '',
        items: [],
        notes: '',
        discount: 0,
        isGstEnabled: true,
      });
      setMenuSearchTerm('');
      fetchOrders();

      // Handle Success Feedback
      setSuccessData({
        orderId: createdOrder._id,
        total: totals.finalTotal,
        customerName: savedName,
        whatsappSid: response.data.whatsappSid,
        billId: response.data.bill?._id
      });
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order');
    }
  };

  const calculateOrderTotal = () => {
    return calculateBilling(
      newOrder.items, 
      newOrder.discount || 0, 
      newOrder.isGstEnabled,
      newOrder.taxRate || 18
    );
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge-pending',
      preparing: 'badge-preparing',
      ready: 'badge-ready',
      delivered: 'badge-delivered',
      cancelled: 'badge-cancelled',
    };
    return badges[status] || 'badge-pending';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: Clock,
      preparing: ChefHat,
      ready: CheckCircle,
      delivered: Truck,
      cancelled: XCircle,
    };
    const Icon = icons[status] || Clock;
    return <Icon size={16} />;
  };

  const orderTypeOptions = [
    { value: '', label: 'All Types' },
    { value: 'dine_in', label: 'Dine In' },
    { value: 'take_away', label: 'Take Away' },
    { value: 'delivery', label: 'Delivery' },
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'preparing', label: 'Preparing' },
    { value: 'ready', label: 'Ready' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const filteredMenuItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory = !selectedCategory || item.categoryId?._id === selectedCategory;
      const matchesSearch = !menuSearchTerm || item.name.toLowerCase().includes(menuSearchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [menuItems, selectedCategory, menuSearchTerm]);

  return (
    <Layout>
      <div className="space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-dark">Orders</h1>
            <p className="text-gray-500">Manage all your restaurant orders</p>
          </div>
          <button
            onClick={() => setShowNewOrderModal(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            New Order
          </button>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="flex flex-wrap gap-4">
            <select
              value={filters.orderType}
              onChange={(e) => setFilters({ ...filters, orderType: e.target.value })}
              className="input max-w-xs"
            >
              {orderTypeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="input max-w-xs"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Orders List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              No orders found
            </div>
          ) : (
            orders.map((order) => (
              <div key={order._id} className="card">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">#{order._id.slice(-6).toUpperCase()}</h3>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-500 capitalize">
                        {order.orderType.replace('_', ' ')}
                      </p>
                      {order.tableNumber && (
                        <span className="badge badge-info text-xs">Table: {order.tableNumber}</span>
                      )}
                    </div>
                  </div>
                  <span className={`badge ${getStatusBadge(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span className="ml-1 capitalize">{order.status}</span>
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  {order.items.slice(0, 5).map((item, idx) => (
                    <div key={idx} className="flex justify-between text-base border-b border-gray-50 pb-1">
                      <span className="font-medium">{item.quantity}x {item.name}</span>
                      <span className="text-gray-600">{formatCurrency(item.total)}</span>
                    </div>
                  ))}
                  {order.items.length > 5 && (
                    <p className="text-sm text-gray-500">+{order.items.length - 5} more items</p>
                  )}
                </div>

                <div className="border-t pt-3 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-lg">{formatCurrency(order.total)}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {order.status !== 'cancelled' && order.status !== 'delivered' && (
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className="text-sm border rounded px-2 py-1"
                      >
                        <option value="pending">Pending</option>
                        <option value="preparing">Preparing</option>
                        <option value="ready">Ready</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancel</option>
                      </select>
                    )}
                    {!order.billId && order.status !== 'cancelled' && (
                      <button
                        onClick={() => handleGenerateBill(order)}
                        className="btn btn-primary py-1 px-2 text-sm"
                        title="Generate Bill"
                      >
                        <Receipt size={16} />
                      </button>
                    )}
                    {order.billId && (
                      <button
                        onClick={() => handleViewBill(order)}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white p-3 rounded-xl transition-all shadow-md shadow-green-200 flex items-center justify-center gap-2 group"
                        title="View Bill"
                      >
                        <Receipt size={20} className="group-hover:scale-110 transition-transform" />
                        <span className="font-bold">Bill</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      {/* New Order Modal */}
      {showNewOrderModal && (
        <div className="fixed inset-0 z-50 bg-gray-50 flex lg:p-6 overflow-y-auto w-full h-full min-h-screen">
          <div className="bg-white lg:rounded-2xl shadow-2xl w-full h-full lg:max-h-[90vh] flex flex-col relative w-full max-w-7xl mx-auto">
            
            {/* Modal Header */}
            <div className="p-4 lg:p-6 border-b shrink-0 flex justify-between items-center bg-white z-20 shadow-sm sticky top-0">
              <h2 className="text-2xl font-bold text-gray-800">New Order</h2>
              <button 
                onClick={() => setShowNewOrderModal(false)} 
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors"
                title="Close Modal"
              >
                <XCircle size={24} />
              </button>
            </div>
            
            {/* Modal Body - 3 Column Layout */}
            <div className="flex-1 bg-gray-50 lg:p-6 p-4 pb-32 lg:pb-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:h-full">
                
                {/* 1. Menu Section */}
                <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col gap-4 lg:h-full overflow-y-auto">
                  <div className="shrink-0 flex items-center justify-between pb-2 border-b">
                    <h3 className="font-bold text-gray-700 text-lg">Menu</h3>
                    <span className="text-xs font-medium bg-gray-100 text-gray-600 py-1 px-2 rounded-full">{menuItems.length} items</span>
                  </div>
                  <div className="space-y-3 shrink-0">
                    <div className="search-input-wrapper relative">
                      <Search className="search-icon absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input type="text" placeholder="Search menu items..." value={menuSearchTerm} onChange={(e) => setMenuSearchTerm(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
                    </div>
                    <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium text-gray-700 cursor-pointer">
                      <option value="">All Categories</option>
                      {categories.map((cat) => (
                         <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1 min-h-[300px] lg:min-h-0 pr-1 -mr-1">
                    <div className="grid grid-cols-2 gap-2 pb-2">
                       {filteredMenuItems.map((item) => (
                         <MenuItemCard key={item._id} item={item} quantity={newOrder.items.find(i => i.menuItemId === item._id)?.quantity || 0} onAdd={addItemToOrder} formatCurrency={formatCurrency} />
                       ))}
                    </div>
                  </div>
                </div>

                {/* 2. Cart Section */}
                <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col gap-4 lg:h-full overflow-y-auto">
                  <div className="flex items-center justify-between pb-2 border-b shrink-0">
                    <h3 className="font-bold text-gray-700 text-lg">Order Details</h3>
                    <span className="bg-primary/10 text-primary font-bold text-xs px-2.5 py-1 rounded-full">{newOrder.items.length} items</span>
                  </div>
                  <div className="space-y-3 shrink-0">
                    <select value={newOrder.orderType} onChange={(e) => setNewOrder({ ...newOrder, orderType: e.target.value })} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-semibold text-gray-800 cursor-pointer">
                      <option value="dine_in">🍽️ Dine In</option>
                      <option value="take_away">🛍️ Take Away</option>
                      <option value="delivery">🛵 Delivery</option>
                    </select>
                    {newOrder.orderType === 'dine_in' && (
                      <input type="text" placeholder="Table Number" value={newOrder.tableNumber} onChange={(e) => setNewOrder({ ...newOrder, tableNumber: e.target.value })} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-h-[250px] lg:min-h-0 mt-1 pr-1 -mr-1">
                    {newOrder.items.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400 min-h-[150px]">
                        <ShoppingBag size={48} className="mb-3 opacity-20" />
                        <p className="font-medium text-sm">Cart is empty</p>
                        <p className="text-xs mt-1 opacity-70">Tap items on the left to add</p>
                      </div>
                    ) : (
                      <div className="space-y-2 pb-2">
                        {newOrder.items.map((item) => (
                           <CartItemCard key={item.menuItemId} item={item} onUpdateQuantity={updateItemQuantity} formatCurrency={formatCurrency} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Billing Section (Sticky on right/bottom) */}
                <div className="bg-white rounded-xl shadow-md border border-gray-100 flex flex-col h-full z-40">
                  <div className="p-4 lg:p-6 flex-1">
                    <h3 className="font-bold text-gray-700 text-lg pb-3 border-b mb-4">Customer Details</h3>
                    <div className="space-y-3 mb-6">
                      <div>
                        <input 
                          ref={nameRef}
                          autoFocus
                          type="text" 
                          placeholder="Customer Name *" 
                          value={newOrder.customerName} 
                          onChange={(e) => setNewOrder({ ...newOrder, customerName: e.target.value })}
                          onKeyDown={(e) => { if (e.key === 'Enter') phoneRef.current?.focus(); }}
                          className={`w-full px-3 py-2 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm ${(!newOrder.customerName || newOrder.customerName.trim() === '') ? 'border-red-300' : 'border-gray-200'}`} 
                        />
                        {(!newOrder.customerName || newOrder.customerName.trim() === '') && (
                          <p className="text-red-500 text-xs mt-1 ml-1 font-medium">Name is required</p>
                        )}
                      </div>
                      <div>
                        <input 
                          ref={phoneRef}
                          type="tel" 
                          placeholder="Phone Number (10 digits) *" 
                          value={newOrder.customerPhone} 
                          onChange={(e) => setNewOrder({ ...newOrder, customerPhone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                          onKeyDown={(e) => { if (e.key === 'Enter' && isOrderValid) handlePlaceOrder(false); }}
                          className={`w-full px-3 py-2 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm ${(!newOrder.customerPhone || !/^\d{10}$/.test(newOrder.customerPhone)) ? 'border-red-300' : 'border-gray-200'}`} 
                        />
                        {(!newOrder.customerPhone || !/^\d{10}$/.test(newOrder.customerPhone)) && (
                          <p className="text-red-500 text-xs mt-1 ml-1 font-medium">Must be exactly 10 digits</p>
                        )}
                      </div>
                    </div>

                    <h3 className="font-bold text-gray-700 text-lg pb-3 border-b mb-5">Billing Summary</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm items-center">
                        <span className="text-gray-500 font-medium">Subtotal</span>
                        <span className="font-bold text-gray-800 text-base">{formatCurrency(calculateOrderTotal().subtotal)}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm group bg-gray-50/80 border border-gray-200 rounded-xl p-3 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
                        <span className="text-gray-700 font-semibold flex items-center gap-2">
                          Discount (%)
                          <input type="number" min="0" max="100" className="w-20 px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 shadow-sm text-center font-bold bg-white" value={newOrder.discount === 0 ? '' : newOrder.discount} onChange={(e) => setNewOrder({...newOrder, discount: e.target.value === '' ? 0 : parseFloat(e.target.value)})} placeholder="0" />
                        </span>
                        <span className="text-green-600 font-bold text-lg">-{formatCurrency(calculateOrderTotal().discountAmount)}</span>
                      </div>

                      <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700 font-bold flex items-center gap-3">
                            <div 
                              className={`w-12 h-6 rounded-full flex items-center p-1 cursor-pointer transition-all duration-300 ${newOrder.isGstEnabled ? 'bg-primary shadow-inner shadow-primary-dark/20' : 'bg-gray-300'}`} 
                              onClick={() => setNewOrder({...newOrder, isGstEnabled: !newOrder.isGstEnabled})}
                            >
                              <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${newOrder.isGstEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </div>
                            Apply Tax/GST
                          </span>
                          {!newOrder.isGstEnabled && <span className="text-gray-400 font-bold italic text-xs uppercase tracking-widest">Disabled</span>}
                        </div>

                        {newOrder.isGstEnabled && (
                          <div className="grid grid-cols-2 gap-3 animate-fadeIn">
                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">Tax Label</label>
                              <input 
                                type="text" 
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-bold text-gray-700 bg-white shadow-sm"
                                value={newOrder.taxLabel}
                                onChange={(e) => setNewOrder({...newOrder, taxLabel: e.target.value})}
                                placeholder="GST"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">Rate (%)</label>
                              <div className="relative">
                                <input 
                                  type="number" 
                                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-black text-primary bg-white shadow-sm text-center pr-8"
                                  value={newOrder.taxRate}
                                  onChange={(e) => setNewOrder({...newOrder, taxRate: parseFloat(e.target.value) || 0})}
                                  placeholder="18"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">%</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {newOrder.isGstEnabled && (
                          <div className="bg-white/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-primary/10 shadow-sm flex justify-between items-center text-[11px] font-bold">
                            <div className="flex flex-col">
                              <span className="text-gray-400 uppercase tracking-tighter">Central ({newOrder.taxRate/2}%)</span>
                              <span className="text-gray-700 text-sm">{formatCurrency(calculateOrderTotal().cgst)}</span>
                            </div>
                            <div className="w-px h-6 bg-gray-100"></div>
                            <div className="flex flex-col items-end">
                              <span className="text-gray-400 uppercase tracking-tighter text-right">State ({newOrder.taxRate/2}%)</span>
                              <span className="text-gray-700 text-sm">{formatCurrency(calculateOrderTotal().sgst)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Highlight total amount (big, bold) */}
                      <div className="flex flex-col pt-5 border-t-2 border-dashed border-gray-200 mt-4">
                        <span className="text-gray-500 font-bold tracking-tight uppercase text-xs mb-1">Total Amount</span>
                        <span className="text-green-600 font-black text-4xl leading-none">
                           {formatCurrency(calculateOrderTotal().finalTotal)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* BUTTON VISIBILITY FIX */}
                  <div className="fixed bottom-0 left-0 w-full lg:sticky lg:bottom-0 bg-white p-4 lg:p-4 pb-6 lg:pb-4 shadow-[0_-10px_20px_rgba(0,0,0,0.15)] lg:shadow-lg z-50 lg:rounded-b-xl border-t">
                    <div className="flex flex-col gap-3 max-w-7xl mx-auto">
                      
                      {/* Mobile Total Display (Only visible on small screens) */}
                      <div className="flex items-center justify-between lg:hidden mb-1 px-1">
                        <span className="text-sm text-gray-500 font-bold uppercase tracking-wider">Total Amount</span>
                        <span className="text-2xl font-black text-green-600 leading-none">
                          {formatCurrency(calculateOrderTotal().finalTotal)}
                        </span>
                      </div>
                      <button 
                        onClick={() => handlePlaceOrder(false)} 
                        disabled={!isOrderValid}
                        className={`w-full py-4 text-xl font-black rounded-xl transition-all ${isOrderValid ? 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                      >
                        {isOrderValid ? 'Place Order' : 'Enter Order Details'}
                      </button>
                      <div className="flex gap-3">
                        <button 
                          onClick={() => {
                             if(isOrderValid) {
                                handlePlaceOrder(true);
                                alert("Bill requested for printing (Mock)");
                             } else {
                                alert("Add items to order first");
                             }
                          }}
                          className={`flex-1 py-3 text-lg font-bold rounded-xl shadow-sm transition-all border ${isOrderValid ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600' : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'}`}
                        >
                          Print Bill
                        </button>
                        <button 
                          onClick={() => setShowNewOrderModal(false)} 
                          className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white text-lg font-bold rounded-xl shadow-sm transition-all"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}
      {/* Success Modal */}
      <SuccessModal 
        data={successData} 
        onNewOrder={() => setSuccessData(null)}
        onViewBill={() => {
          const orderId = successData.orderId;
          setSuccessData(null);
          navigate(`/admin/bills?orderId=${orderId}`);
        }}
        formatCurrency={formatCurrency}
      />
    </Layout>
  );
};

export default Orders;
