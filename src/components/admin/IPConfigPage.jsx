import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Power, 
  PowerOff,
  Globe,
  Server,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Download,
  Upload,
  Settings,
  Lock,
  Unlock,
  Wrench,
  Pause,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { toast } from 'sonner';
import { apiCaller } from '../../utils/axiosInstance';
import { useLoader } from '../../context/LoaderContext';

const IPConfigPage = () => {
  const { showLoader, hideLoader } = useLoader();
  
  // State management
  const [ipList, setIpList] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [currentIp, setCurrentIp] = useState(null);
  const [selectedIps, setSelectedIps] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [editingIp, setEditingIp] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  // IP Restrictions Settings State
  const [restrictionSettings, setRestrictionSettings] = useState({
    isEnabled: false,
    mode: 'development',
    allowLocalhostInProduction: false,
    enableDetailedLogging: true,
    maxUnauthorizedAttemptsPerHour: 100,
    lastChangeDescription: '',
    lastModifiedBy: null,
    updatedAt: null
  });
  const [toggling, setToggling] = useState(false);

  // Form data for add/edit
  const [formData, setFormData] = useState({
    ipAddress: '',
    description: '',
    isActive: true
  });

  // Settings form data
  const [settingsFormData, setSettingsFormData] = useState({
    isEnabled: false,
    mode: 'development',
    allowLocalhostInProduction: false,
    enableDetailedLogging: true,
    maxUnauthorizedAttemptsPerHour: 100,
    lastChangeDescription: ''
  });

  // Load data on component mount
  useEffect(() => {
    loadIPList();
    loadStatistics();
    checkCurrentIP();
    loadRestrictionSettings();
  }, [pagination.currentPage, searchTerm, filterStatus]);

  // API calls
  const loadIPList = async () => {
    try {
      showLoader();
      const queryParams = new URLSearchParams({
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        ...(searchTerm && { search: searchTerm }),
        ...(filterStatus !== 'all' && { isActive: filterStatus === 'active' })
      });

      const response = await apiCaller('GET', `/api/ip-restrictions?${queryParams}`);
      if (response.data.success) {
        setIpList(response.data.data.allowedIps);
        setPagination(prev => ({
          ...prev,
          totalPages: response.data.data.pagination.totalPages,
          totalItems: response.data.data.pagination.totalItems
        }));
      }
    } catch (error) {
      console.error('Error loading IP list:', error);
      toast.error('Failed to load IP list');
    } finally {
      hideLoader();
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await apiCaller('GET', '/api/ip-restrictions/stats');
      if (response.data.success) {
        setStatistics(response.data.data);
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const checkCurrentIP = async () => {
    try {
      // First try the backend endpoint
      const response = await apiCaller('GET', '/api/ip-restrictions/check-current');
      if (response.data.success) {
        setCurrentIp(response.data.data);
        return;
      }
    } catch (error) {
      console.error('Error checking current IP via backend:', error);
    }

    // Fallback: Use external IP detection service
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      
      if (data.ip) {
        setCurrentIp({
          clientIp: data.ip,
          isAllowed: false, // We don't know if it's allowed without backend check
          allowedIpInfo: null
        });
        toast.info(`Your IP was detected: ${data.ip}`);
      }
    } catch (error) {
      console.error('Error detecting IP via external service:', error);
      toast.error('Could not detect IP address');
    }
  };

  const loadRestrictionSettings = async () => {
    try {
      const response = await apiCaller('GET', '/api/ip-restrictions/settings');
      if (response.data.success) {
        const settings = response.data.data;
        setRestrictionSettings(settings);
        setSettingsFormData({
          isEnabled: settings.isEnabled,
          mode: settings.mode,
          allowLocalhostInProduction: settings.allowLocalhostInProduction,
          enableDetailedLogging: settings.enableDetailedLogging,
          maxUnauthorizedAttemptsPerHour: settings.maxUnauthorizedAttemptsPerHour,
          lastChangeDescription: ''
        });
      }
    } catch (error) {
      console.error('Error loading restriction settings:', error);
      // Don't show error toast as settings might not exist yet
    }
  };

  const toggleRestrictions = async () => {
    if (!restrictionSettings.isEnabled) {
      // Enabling restrictions - show confirmation
      if (!confirm('Enable IP restrictions? Some users may lose access.')) {
        return;
      }
    } else {
      // Disabling restrictions - show warning
      if (!confirm('Disable IP restrictions? The system will be accessible from any IP address.')) {
        return;
      }
    }

    setToggling(true);
    try {
      const response = await apiCaller('POST', '/api/ip-restrictions/settings/toggle',{test:"no"});
      if (response.data.success) {
        toast.success(response.data.message);
        loadRestrictionSettings();
      }
    } catch (error) {
      console.error('Error toggling restrictions:', error);
      toast.error(error.response?.data?.message || 'Failed to toggle IP restrictions');
    } finally {
      setToggling(false);
    }
  };

  const updateRestrictionSettings = async () => {
    try {
      showLoader();
      const response = await apiCaller('PUT', '/api/ip-restrictions/settings', settingsFormData);
      
      if (response.data.success) {
        toast.success('Settings updated successfully');
        setShowSettingsModal(false);
        loadRestrictionSettings();
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error(error.response?.data?.message || 'Failed to update settings');
    } finally {
      hideLoader();
    }
  };

  const addCurrentIP = async () => {
    console.log("currentIp", currentIp);
    if (!currentIp?.clientIp) {
      toast.error('Could not detect current IP address');
      return;
    }

    try {
      showLoader();
      const response = await apiCaller('POST', '/api/ip-restrictions', {
        ipAddress: currentIp.clientIp,
        description: `Auto-added IP — ${new Date().toLocaleDateString('en-US')}`,
        isActive: true
      });

      if (response.data.success) {
        toast.success('Current IP added successfully');
        loadIPList();
        checkCurrentIP();
      }
    } catch (error) {
      console.error('Error adding current IP:', error);
      toast.error(error.response?.data?.message || 'Failed to add current IP');
    } finally {
      hideLoader();
    }
  };

  const handleAddIP = async () => {
    try {
      showLoader();
      const response = await apiCaller('POST', '/api/ip-restrictions', formData);
      
      if (response.data.success) {
        toast.success('IP address added successfully');
        setShowAddModal(false);
        resetForm();
        loadIPList();
        loadStatistics();
      }
    } catch (error) {
      console.error('Error adding IP:', error);
      toast.error(error.response?.data?.message || 'Failed to add IP address');
    } finally {
      hideLoader();
    }
  };

  const handleEditIP = async () => {
    try {
      showLoader();
      const response = await apiCaller('PUT', `/api/ip-restrictions/${editingIp._id}`, formData);
      
      if (response.data.success) {
        toast.success('IP address updated successfully');
        setShowEditModal(false);
        setEditingIp(null);
        resetForm();
        loadIPList();
        loadStatistics();
      }
    } catch (error) {
      console.error('Error updating IP:', error);
      toast.error(error.response?.data?.message || 'Failed to update IP address');
    } finally {
      hideLoader();
    }
  };

  const handleDeleteIP = async (id) => {
    if (!confirm('Delete this IP address?')) return;

    try {
      showLoader();
      const response = await apiCaller('DELETE', `/api/ip-restrictions/${id}`);
      
      if (response.data.success) {
        toast.success('IP address removed successfully');
        loadIPList();
        loadStatistics();
      }
    } catch (error) {
      console.error('Error deleting IP:', error);
      toast.error(error.response?.data?.message || 'Failed to delete IP address');
    } finally {
      hideLoader();
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedIps.length === 0) {
      toast.error('Select at least one IP address');
      return;
    }

    const actionVerb = action === 'activate' ? 'activate' : action === 'deactivate' ? 'deactivate' : 'delete';
    if (!confirm(`Are you sure you want to ${actionVerb} ${selectedIps.length} selected IP address(es)?`)) return;

    try {
      showLoader();
      const response = await apiCaller('POST', '/api/ip-restrictions/bulk', {
        action,
        ids: selectedIps
      });

      if (response.data.success) {
        const pastVerb = action === 'activate' ? 'activated' : action === 'deactivate' ? 'deactivated' : 'deleted';
        toast.success(`Successfully ${pastVerb} ${selectedIps.length} IP address(es)`);
        setSelectedIps([]);
        loadIPList();
        loadStatistics();
      }
    } catch (error) {
      console.error(`Error performing bulk ${action}:`, error);
      toast.error(error.response?.data?.message || `Failed to ${actionVerb} IP addresses`);
    } finally {
      hideLoader();
    }
  };

  const resetForm = () => {
    setFormData({
      ipAddress: '',
      description: '',
      isActive: true
    });
  };

  const openEditModal = (ip) => {
    setEditingIp(ip);
    setFormData({
      ipAddress: ip.ipAddress,
      description: ip.description,
      isActive: ip.isActive
    });
    setShowEditModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleSelectAll = () => {
    if (selectedIps.length === ipList.length) {
      setSelectedIps([]);
    } else {
      setSelectedIps(ipList.map(ip => ip._id));
    }
  };

  const toggleSelectIP = (id) => {
    setSelectedIps(prev => 
      prev.includes(id) 
        ? prev.filter(ipId => ipId !== id)
        : [...prev, id]
    );
  };

  const getStatusInfo = () => {
    if (!restrictionSettings.isEnabled) {
      return {
        status: 'Disabled',
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        icon: Unlock,
        description: 'IP restrictions are fully disabled'
      };
    }
    
    switch (restrictionSettings.mode) {
      case 'development':
        return {
          status: 'Development mode',
          color: 'text-orange-600',
          bgColor: 'bg-orange-100',
          icon: Wrench,
          description: 'Localhost is automatically allowed'
        };
      case 'strict':
        return {
          status: 'Strict mode',
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          icon: Lock,
          description: 'Full restrictions enabled'
        };
      case 'disabled':
        return {
          status: 'Disabled (mode)',
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          icon: Pause,
          description: 'Disabled via mode setting'
        };
      default:
        return {
          status: 'Unknown',
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          icon: AlertTriangle,
          description: 'Unknown status'
        };
    }
  };

  const resetSettingsForm = () => {
    setSettingsFormData({
      isEnabled: restrictionSettings.isEnabled,
      mode: restrictionSettings.mode,
      allowLocalhostInProduction: restrictionSettings.allowLocalhostInProduction,
      enableDetailedLogging: restrictionSettings.enableDetailedLogging,
      maxUnauthorizedAttemptsPerHour: restrictionSettings.maxUnauthorizedAttemptsPerHour,
      lastChangeDescription: ''
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Shield className="text-blue-600" size={32} />
              IP access control
            </h1>
            <p className="text-gray-600 mt-2">
              Manage authorized IP addresses for secure access to the backend
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={addCurrentIP}
              disabled={currentIp?.isAllowed}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Globe size={16} />
              Add current IP
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus size={16} />
              Add IP address
            </button>
          </div>
        </div>

        {/* IP Restrictions Control Panel */}
        <div className="bg-white rounded-lg border mb-6">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Settings className="text-blue-600" size={24} />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">IP restriction system</h2>
                  <p className="text-sm text-gray-600">Control access to the entire system</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowSettingsModal(true)}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center gap-2"
                >
                  <Settings size={16} />
                  Settings
                </button>
                
                <button
                  onClick={toggleRestrictions}
                  disabled={toggling}
                  className={`px-6 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors ${
                    restrictionSettings.isEnabled
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {toggling ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  ) : restrictionSettings.isEnabled ? (
                    <ToggleLeft size={16} />
                  ) : (
                    <ToggleRight size={16} />
                  )}
                  {restrictionSettings.isEnabled ? 'Disable restrictions' : 'Enable restrictions'}
                </button>
              </div>
            </div>

            {/* Status Indicator */}
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-full ${getStatusInfo().bgColor}`}>
                {React.createElement(getStatusInfo().icon, { 
                  className: getStatusInfo().color, 
                  size: 20 
                })}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`font-semibold ${getStatusInfo().color}`}>
                    {getStatusInfo().status}
                  </span>
                  {restrictionSettings.isEnabled && (
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2">{getStatusInfo().description}</p>
                
                {restrictionSettings.lastModifiedBy && (
                  <div className="text-xs text-gray-500">
                    Last change: {new Date(restrictionSettings.updatedAt).toLocaleString('en-US')} 
                    {' by '} {restrictionSettings.lastModifiedBy.name?.first} {restrictionSettings.lastModifiedBy.name?.last}
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm font-medium text-gray-600">Mode</div>
                  <div className="text-lg font-bold text-gray-900 capitalize">{restrictionSettings.mode}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm font-medium text-gray-600">Max attempts/h</div>
                  <div className="text-lg font-bold text-gray-900">{restrictionSettings.maxUnauthorizedAttemptsPerHour}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm font-medium text-gray-600">Logging</div>
                  <div className="text-lg font-bold text-gray-900">
                    {restrictionSettings.enableDetailedLogging ? 'Yes' : 'No'}
                  </div>
                </div>
              </div>
            </div>

            {/* Warning Messages */}
            {!restrictionSettings.isEnabled && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertTriangle size={20} />
                  <span className="font-medium">Warning: IP restrictions are disabled</span>
                </div>
                <p className="text-sm text-red-700 mt-1">
                  Everyone can access the system regardless of IP address
                </p>
              </div>
            )}

            {restrictionSettings.isEnabled && restrictionSettings.mode === 'development' && (
              <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-2 text-orange-800">
                  <Wrench size={20} />
                  <span className="font-medium">Development mode</span>
                </div>
                <p className="text-sm text-orange-700 mt-1">
                  Localhost (127.0.0.1) is always allowed regardless of the IP list
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Current IP Status */}
        <div className="bg-white rounded-lg border p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${currentIp?.isAllowed ? 'bg-green-100' : 'bg-red-100'}`}>
                {currentIp?.isAllowed ? (
                  <CheckCircle className="text-green-600" size={20} />
                ) : (
                  <AlertTriangle className="text-red-600" size={20} />
                )}
              </div>
              <div>
                <p className="font-medium">Your current IP: {currentIp?.clientIp}</p>
                <p className={`text-sm ${currentIp?.isAllowed ? 'text-green-600' : 'text-red-600'}`}>
                  {currentIp?.isAllowed ? 'Access authorized' : 'Unauthorized — add to the allowlist'}
                </p>
              </div>
            </div>
            {currentIp?.allowedIpInfo && (
              <div className="text-right text-sm text-gray-600">
                <p>Via: {currentIp.allowedIpInfo.description}</p>
                <p>Last used: {formatDate(currentIp.allowedIpInfo.lastUsed)}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">All IPs</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.totalIps || 0}</p>
            </div>
            <Server className="text-blue-600" size={24} />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active IPs</p>
              <p className="text-2xl font-bold text-green-600">{statistics.activeIps || 0}</p>
            </div>
            <CheckCircle className="text-green-600" size={24} />
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Recently used</p>
              <p className="text-2xl font-bold text-orange-600">{statistics.recentlyUsed || 0}</p>
            </div>
            <Activity className="text-orange-600" size={24} />
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total usage</p>
              <p className="text-2xl font-bold text-purple-600">{statistics.totalUsage || 0}</p>
            </div>
            <Users className="text-purple-600" size={24} />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg border mb-6">
        <div className="p-6 border-b">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            {/* Search and Filter */}
            <div className="flex gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search IP addresses or descriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All statuses</option>
                <option value="active">Active only</option>
                <option value="inactive">Inactive only</option>
              </select>
            </div>

            {/* Bulk Actions */}
            {selectedIps.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkAction('activate')}
                  className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <Power size={16} />
                  Activate ({selectedIps.length})
                </button>
                <button
                  onClick={() => handleBulkAction('deactivate')}
                  className="bg-orange-600 text-white px-3 py-2 rounded-lg hover:bg-orange-700 flex items-center gap-2"
                >
                  <PowerOff size={16} />
                  Deactivate ({selectedIps.length})
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Delete ({selectedIps.length})
                </button>
              </div>
            )}
          </div>
        </div>

        {/* IP List */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedIps.length === ipList.length && ipList.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last used
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created by
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ipList.map((ip) => (
                <tr key={ip._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIps.includes(ip._id)}
                      onChange={() => toggleSelectIP(ip._id)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="font-mono text-sm font-medium text-gray-900">
                        {ip.ipAddress}
                      </span>
                      {ip.ipAddress === currentIp?.clientIp && (
                        <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{ip.description}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      ip.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {ip.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">{ip.usageCount}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">
                      {ip.lastUsed ? formatDate(ip.lastUsed) : 'Never'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">
                      {ip.createdBy?.name?.first} {ip.createdBy?.name?.last}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger asChild>
                        <button className="text-gray-500 hover:text-gray-700">
                          <MoreVertical size={20} />
                        </button>
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Portal>
                        <DropdownMenu.Content
                          className="min-w-[160px] bg-white rounded-md shadow-lg z-50 border p-1"
                          sideOffset={5}
                          align="end"
                        >
                          <DropdownMenu.Item
                            className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
                            onClick={() => openEditModal(ip)}
                          >
                            <Edit size={16} className="mr-2" />
                            Edit
                          </DropdownMenu.Item>
                          <DropdownMenu.Item
                            className="flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md cursor-pointer"
                            onClick={() => handleDeleteIP(ip._id)}
                          >
                            <Trash2 size={16} className="mr-2" />
                            Delete
                          </DropdownMenu.Item>
                        </DropdownMenu.Content>
                      </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Showing {(pagination.currentPage - 1) * pagination.itemsPerPage + 1} to {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems} results
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                disabled={pagination.currentPage === 1}
                className="disabled:opacity-50 px-3 py-1 border rounded hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                disabled={pagination.currentPage === pagination.totalPages}
                className="disabled:opacity-50 px-3 py-1 border rounded hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add IP Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add IP address</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  IP address *
                </label>
                <input
                  type="text"
                  value={formData.ipAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, ipAddress: e.target.value }))}
                  placeholder="192.168.1.100 or 192.168.1.0/24"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supports single IPs (192.168.1.100) or CIDR ranges (192.168.1.0/24)
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Office network access"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Activate immediately
                </label>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddIP}
                disabled={!formData.ipAddress || !formData.description}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add IP address
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit IP Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit IP address</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  IP address *
                </label>
                <input
                  type="text"
                  value={formData.ipAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, ipAddress: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="editIsActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <label htmlFor="editIsActive" className="text-sm font-medium text-gray-700">
                  Active
                </label>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingIp(null);
                  resetForm();
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleEditIP}
                disabled={!formData.ipAddress || !formData.description}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Update IP address
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Settings size={24} />
              IP restriction settings
            </h2>
            
            <div className="space-y-6">
              {/* Main Toggle */}
              <div className="border-b pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-lg font-medium text-gray-900">
                      Enable IP restrictions
                    </label>
                    <p className="text-sm text-gray-600">
                      Control access to the system based on IP addresses
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settingsFormData.isEnabled}
                      onChange={(e) => setSettingsFormData(prev => ({ ...prev, isEnabled: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              {/* Mode Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Operating mode
                </label>
                <select
                  value={settingsFormData.mode}
                  onChange={(e) => setSettingsFormData(prev => ({ ...prev, mode: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="development">🔧 Development — localhost allowed</option>
                  <option value="strict">🔒 Strict — full restrictions</option>
                  <option value="disabled">⏸️ Disabled</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  How strictly IP restrictions are applied
                </p>
              </div>

              {/* Max Attempts */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max attempts per hour
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={settingsFormData.maxUnauthorizedAttemptsPerHour}
                  onChange={(e) => setSettingsFormData(prev => ({ 
                    ...prev, 
                    maxUnauthorizedAttemptsPerHour: parseInt(e.target.value) || 100 
                  }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum unauthorized access attempts per hour
                </p>
              </div>

              {/* Checkboxes */}
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="allowLocalhost"
                    checked={settingsFormData.allowLocalhostInProduction}
                    onChange={(e) => setSettingsFormData(prev => ({ 
                      ...prev, 
                      allowLocalhostInProduction: e.target.checked 
                    }))}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="allowLocalhost" className="ml-2 text-sm font-medium text-gray-700">
                    Allow localhost in production
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enableLogging"
                    checked={settingsFormData.enableDetailedLogging}
                    onChange={(e) => setSettingsFormData(prev => ({ 
                      ...prev, 
                      enableDetailedLogging: e.target.checked 
                    }))}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="enableLogging" className="ml-2 text-sm font-medium text-gray-700">
                    Enable detailed logging
                  </label>
                </div>
              </div>

              {/* Change Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Change description (optional)
                </label>
                <textarea
                  rows={3}
                  value={settingsFormData.lastChangeDescription}
                  onChange={(e) => setSettingsFormData(prev => ({ 
                    ...prev, 
                    lastChangeDescription: e.target.value 
                  }))}
                  placeholder="Briefly describe why you are changing these settings..."
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6 pt-4 border-t">
              <button
                onClick={() => {
                  setShowSettingsModal(false);
                  resetSettingsForm();
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={updateRestrictionSettings}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IPConfigPage; 