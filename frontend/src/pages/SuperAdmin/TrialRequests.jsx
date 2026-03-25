import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { toast, Toaster } from 'react-hot-toast';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Phone, 
  Building2, 
  User, 
  MapPin, 
  Search,
  RefreshCw,
  MoreVertical,
  ExternalLink,
  ChevronRight,
  Filter,
  Loader2
} from 'lucide-react';
import Layout from '../../components/Layout';

const TrialRequests = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const { data: requests, isLoading, isRefetching } = useQuery({
    queryKey: ['trialRequests'],
    queryFn: async () => {
      const res = await api.get('/trial-request');
      return res.data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: (id) => api.put(`/trial-request/${id}/approve`),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['trialRequests']);
      toast.success('Lead Approved! Account provisioned.');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Approval failed'),
  });

  const rejectMutation = useMutation({
    mutationFn: (id) => api.put(`/trial-request/${id}/reject`),
    onSuccess: () => {
      queryClient.invalidateQueries(['trialRequests']);
      toast.success('Lead Rejected');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Rejection failed'),
  });

  const filteredRequests = (requests || []).filter(req => {
    const matchesSearch = 
      req.restaurantName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      req.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      req.phone.includes(searchTerm);
      
    const matchesStatus = filterStatus === 'all' ? true : req.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  if (isLoading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />
    </div>
  );

  return (
    <Layout>
      <Toaster position="top-right" />
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-4">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              TRIAL REQUESTS
              <span className="bg-orange-500 text-white text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-widest">{filteredRequests.length} Leads</span>
            </h1>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Pending Approval Queue</p>
          </div>
          <div className="flex items-center gap-3 mt-4 md:mt-0">
             <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
               <input 
                 type="text" 
                 placeholder="Search by name or phone..." 
                 className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none w-64"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             <button 
               onClick={() => queryClient.invalidateQueries(['trialRequests'])}
               className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-primary transition-colors active:scale-95"
             >
               <RefreshCw className={`w-5 h-5 ${isRefetching ? 'animate-spin text-primary' : ''}`} />
             </button>
          </div>
        </div>

        {/* Request Grid */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Restaurant</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Owner</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Phone</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Details</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map((req) => (
                  <tr key={req._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-orange-500 group-hover:text-white transition-all">
                          <Building2 className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-black text-slate-800 tracking-tight leading-none mb-1.5">{req.restaurantName}</p>
                          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{req.businessType}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 transition-all">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-300" />
                        <p className="text-sm font-bold text-slate-600">{req.ownerName}</p>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <a href={`tel:${req.phone}`} className="flex items-center gap-2 text-sm font-black text-primary hover:underline">
                        <Phone className="w-4 h-4" />
                        {req.phone}
                      </a>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-2 text-slate-400">
                        <MapPin className="w-4 h-4" />
                        <p className="text-xs font-bold uppercase tracking-wider">{req.city}</p>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="px-8 py-6">
                      {req.status === 'pending' ? (
                        <div className="flex items-center gap-3">
                          <button 
                            disabled={approveMutation.isLoading}
                            onClick={() => approveMutation.mutate(req._id)}
                            className="bg-green-500 hover:bg-green-600 text-white font-black text-[10px] uppercase px-4 py-2 rounded-lg shadow-lg shadow-green-500/10 transition-all flex items-center gap-2"
                          >
                            Approve
                            <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
                          </button>
                          <button 
                            disabled={rejectMutation.isLoading}
                            onClick={() => rejectMutation.mutate(req._id)}
                            className="text-red-500 hover:text-red-600 font-black text-[10px] uppercase px-4 py-2 bg-red-500/10 rounded-lg transition-all"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-slate-300 font-bold text-xs uppercase italic px-4">
                           {req.status === 'approved' ? 'Processed ✓' : 'Dropped ✕'}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredRequests.length === 0 && (
              <div className="py-20 text-center flex flex-col items-center">
                 <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                   <Filter className="w-8 h-8 text-slate-200" />
                 </div>
                 <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No matching requests found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    pending: 'bg-orange-100 text-orange-600 border-orange-200 px-3 py-1',
    approved: 'bg-green-100 text-green-600 border-green-200 px-3 py-1',
    rejected: 'bg-red-100 text-red-600 border-red-200 px-3 py-1',
  };
  
  const icons = {
    pending: <Clock className="w-3.5 h-3.5" />,
    approved: <CheckCircle2 className="w-3.5 h-3.5" />,
    rejected: <XCircle className="w-3.5 h-3.5" />,
  };

  return (
    <div className={`inline-flex items-center gap-2 rounded-full border text-[10px] font-black uppercase tracking-widest ${styles[status]}`}>
      {icons[status]}
      {status}
    </div>
  );
};

export default TrialRequests;
