import React, { useState } from 'react';
import { Users, Search, Filter, Plus, Eye, Edit, Trash2, CheckCircle, Clock, AlertTriangle, Shield, UserCheck, Mail, Phone, Calendar, Download, RefreshCw, X, Star, Activity, Lock, Unlock } from 'lucide-react';
import { 
  mockSystemUsers, 
  mockRoles, 
  mockPermissions,
  type SystemUser, 
  type Role, 
  type Permission 
} from '../../data/mockData';
import { useErrorLogger } from '../../utils/errorLogger';
import { useExport } from '../../utils/exportUtils';
import { Button, Card, Input, Badge, Modal, ExportModal } from '../ui';

export default function UserManagementPage() {
  const { logInfo, logError } = useErrorLogger();
  const { exportData } = useExport();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit' | 'view' | 'permissions'>('add');
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  // استخدام البيانات الوهمية مباشرة
  const [users, setUsers] = useState<SystemUser[]>(mockSystemUsers);
  const roles = mockRoles;
  const permissions = mockPermissions;

  // Form state for adding/editing users
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    roleId: '',
    associatedId: '',
    associatedType: null as 'organization' | 'family' | null,
    status: 'active' as SystemUser['status']
  });

  // فلترة المستخدمين
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone.includes(searchTerm);
    
    const matchesRole = roleFilter === 'all' || user.roleId === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // إحصائيات
  const statistics = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    inactive: users.filter(u => u.status === 'inactive').length,
    suspended: users.filter(u => u.status === 'suspended').length,
    admins: users.filter(u => roles.find(r => r.id === u.roleId)?.name === 'مدير النظام').length,
    recentLogins: users.filter(u => {
      const lastLogin = new Date(u.lastLogin);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - lastLogin.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    }).length
  };

  const handleAddUser = () => {
    setModalType('add');
    setSelectedUser(null);
    setUserForm({
      name: '',
      email: '',
      phone: '',
      roleId: '',
      associatedId: '',
      associatedType: null,
      status: 'active'
    });
    setShowModal(true);
  };

  const handleEditUser = (user: SystemUser) => {
    setModalType('edit');
    setSelectedUser(user);
    setUserForm({
      name: user.name,
      email: user.email,
      phone: user.phone,
      roleId: user.roleId,
      associatedId: user.associatedId || '',
      associatedType: user.associatedType,
      status: user.status
    });
    setShowModal(true);
  };

  const handleViewUser = (user: SystemUser) => {
    setModalType('view');
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleSaveUser = async () => {
    if (!userForm.name.trim() || !userForm.email.trim() || !userForm.roleId) {
      setNotification({ message: 'يرجى إدخال جميع الحقول المطلوبة', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    try {
      if (modalType === 'add') {
        // إضافة مستخدم جديد
        const newUser: SystemUser = {
          id: `user-${Date.now()}`,
          name: userForm.name,
          email: userForm.email,
          phone: userForm.phone,
          roleId: userForm.roleId,
          associatedId: userForm.associatedId || null,
          associatedType: userForm.associatedType,
          status: userForm.status,
          lastLogin: new Date().toISOString(),
          createdAt: new Date().toISOString()
        };
        
        setUsers(prev => [newUser, ...prev]);
        setNotification({ message: `تم إضافة المستخدم ${userForm.name} بنجاح`, type: 'success' });
        logInfo(`تم إضافة مستخدم جديد: ${userForm.name}`, 'UserManagementPage');
      } else if (modalType === 'edit' && selectedUser) {
        // تحديث مستخدم موجود
        setUsers(prev => 
          prev.map(user => 
            user.id === selectedUser.id 
              ? { ...user, ...userForm }
              : user
          )
        );
        setNotification({ message: `تم تحديث بيانات ${userForm.name} بنجاح`, type: 'success' });
        logInfo(`تم تحديث بيانات المستخدم: ${userForm.name}`, 'UserManagementPage');
      }
      
      setTimeout(() => setNotification(null), 3000);
      setShowModal(false);
      setSelectedUser(null);
    } catch (error) {
      logError(error as Error, 'UserManagementPage');
      setNotification({ message: 'حدث خطأ في حفظ البيانات', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleDeleteUser = (user: SystemUser) => {
    if (confirm(`هل أنت متأكد من حذف المستخدم ${user.name}؟`)) {
      setUsers(prev => prev.filter(u => u.id !== user.id));
      setNotification({ message: `تم حذف المستخدم ${user.name}`, type: 'warning' });
      setTimeout(() => setNotification(null), 3000);
      logInfo(`تم حذف المستخدم: ${user.name}`, 'UserManagementPage');
    }
  };

  const handleToggleStatus = (user: SystemUser) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    setUsers(prev => 
      prev.map(u => 
        u.id === user.id 
          ? { ...u, status: newStatus }
          : u
      )
    );
    
    const action = newStatus === 'active' ? 'تفعيل' : 'إلغاء تفعيل';
    setNotification({ message: `تم ${action} المستخدم ${user.name}`, type: 'success' });
    setTimeout(() => setNotification(null), 3000);
  };

  const getRoleName = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    return role ? role.name : 'غير محدد';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'inactive': return 'غير نشط';
      case 'suspended': return 'موقوف';
      default: return 'غير محدد';
    }
  };

  const getNotificationClasses = (type: 'success' | 'error' | 'warning') => {
    switch (type) {
      case 'success': return 'bg-green-100 border-green-200 text-green-800';
      case 'error': return 'bg-red-100 border-red-200 text-red-800';
      case 'warning': return 'bg-orange-100 border-orange-200 text-orange-800';
    }
  };

  const getNotificationIcon = (type: 'success' | 'error' | 'warning') => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'warning': return <Clock className="w-5 h-5 text-orange-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-3 space-x-reverse ${getNotificationClasses(notification.type)}`}>
          {getNotificationIcon(notification.type)}
          <span className="font-medium">{notification.message}</span>
          <button onClick={() => setNotification(null)} className="text-gray-500 hover:text-gray-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Data Source Indicator */}
      <Card className="bg-blue-50 border-blue-200" padding="sm">
        <div className="flex items-center space-x-2 space-x-reverse text-blue-600">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm font-medium">
            البيانات الوهمية محملة - {users.length} مستخدم، {roles.length} دور
          </span>
        </div>
      </Card>

      {/* Actions Bar */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-3 space-x-reverse">
          <Button variant="success" icon={Download} iconPosition="right" onClick={() => {
            exportData(filteredUsers.map(user => ({
              id: user.id,
              name: user.name,
              email: user.email,
              phone: user.phone,
              role: getRoleName(user.roleId),
              status: getStatusText(user.status),
              lastLogin: user.lastLogin,
              createdAt: user.createdAt
            })), {
              format: 'json',
              filename: `قائمة_المستخدمين_${new Date().toISOString().split('T')[0]}`
            });
          }}>
            تصدير سريع
          </Button>
          <Button 
            variant="success" 
            icon={Download} 
            iconPosition="right" 
            onClick={() => setShowExportModal(true)}
          >
            تصدير متقدم
          </Button>
          <Button variant="primary" icon={Plus} iconPosition="right" onClick={handleAddUser}>
            إضافة مستخدم جديد
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <div className="grid md:grid-cols-3 gap-4">
          <Input
            type="text"
            icon={Search}
            iconPosition="right"
            placeholder="البحث في المستخدمين..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">الدور</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع الأدوار</option>
              {roles.map(role => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">الحالة</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع الحالات</option>
              <option value="active">نشط</option>
              <option value="inactive">غير نشط</option>
              <option value="suspended">موقوف</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-blue-50">
          <div className="text-center">
            <div className="bg-blue-100 p-3 rounded-xl mb-2">
              <Users className="w-6 h-6 text-blue-600 mx-auto" />
            </div>
            <p className="text-sm text-blue-600">إجمالي المستخدمين</p>
            <p className="text-2xl font-bold text-blue-900">{statistics.total}</p>
          </div>
        </Card>

        <Card className="bg-green-50">
          <div className="text-center">
            <div className="bg-green-100 p-3 rounded-xl mb-2">
              <CheckCircle className="w-6 h-6 text-green-600 mx-auto" />
            </div>
            <p className="text-sm text-green-600">نشطين</p>
            <p className="text-2xl font-bold text-green-900">{statistics.active}</p>
          </div>
        </Card>

        <Card className="bg-gray-50">
          <div className="text-center">
            <div className="bg-gray-100 p-3 rounded-xl mb-2">
              <Clock className="w-6 h-6 text-gray-600 mx-auto" />
            </div>
            <p className="text-sm text-gray-600">غير نشطين</p>
            <p className="text-2xl font-bold text-gray-900">{statistics.inactive}</p>
          </div>
        </Card>

        <Card className="bg-red-50">
          <div className="text-center">
            <div className="bg-red-100 p-3 rounded-xl mb-2">
              <AlertTriangle className="w-6 h-6 text-red-600 mx-auto" />
            </div>
            <p className="text-sm text-red-600">موقوفين</p>
            <p className="text-2xl font-bold text-red-900">{statistics.suspended}</p>
          </div>
        </Card>

        <Card className="bg-purple-50">
          <div className="text-center">
            <div className="bg-purple-100 p-3 rounded-xl mb-2">
              <Shield className="w-6 h-6 text-purple-600 mx-auto" />
            </div>
            <p className="text-sm text-purple-600">مديرين</p>
            <p className="text-2xl font-bold text-purple-900">{statistics.admins}</p>
          </div>
        </Card>

        <Card className="bg-orange-50">
          <div className="text-center">
            <div className="bg-orange-100 p-3 rounded-xl mb-2">
              <Activity className="w-6 h-6 text-orange-600 mx-auto" />
            </div>
            <p className="text-sm text-orange-600">دخول حديث</p>
            <p className="text-2xl font-bold text-orange-900">{statistics.recentLogins}</p>
          </div>
        </Card>
      </div>

      {/* Users Table */}
      <Card padding="none" className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">قائمة المستخدمين ({filteredUsers.length})</h3>
            <div className="flex items-center space-x-2 space-x-reverse text-blue-600">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">البيانات الوهمية</span>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المستخدم
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  معلومات الاتصال
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الدور
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الحالة
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  آخر دخول
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="bg-blue-100 p-2 rounded-lg ml-4">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">#{user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">{user.email}</div>
                        <div className="text-sm text-gray-500">{user.phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="info" size="sm">
                        {getRoleName(user.roleId)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge 
                        variant={
                          user.status === 'active' ? 'success' :
                          user.status === 'inactive' ? 'neutral' : 'error'
                        }
                        size="sm"
                      >
                        {getStatusText(user.status)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(user.lastLogin).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2 space-x-reverse">
                        <button 
                          onClick={() => handleViewUser(user)}
                          className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors" 
                          title="عرض التفاصيل"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEditUser(user)}
                          className="text-green-600 hover:text-green-900 p-2 rounded-lg hover:bg-green-50 transition-colors" 
                          title="تعديل"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleToggleStatus(user)}
                          className={`p-2 rounded-lg transition-colors ${
                            user.status === 'active' 
                              ? 'text-orange-600 hover:text-orange-900 hover:bg-orange-50' 
                              : 'text-green-600 hover:text-green-900 hover:bg-green-50'
                          }`}
                          title={user.status === 'active' ? 'إلغاء التفعيل' : 'تفعيل'}
                        >
                          {user.status === 'active' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user)}
                          className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors" 
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium">
                        {searchTerm || roleFilter !== 'all' || statusFilter !== 'all' 
                          ? 'لا توجد مستخدمين مطابقين للفلاتر' 
                          : 'لا توجد مستخدمين'}
                      </p>
                      <p className="text-sm mt-2">
                        {searchTerm || roleFilter !== 'all' || statusFilter !== 'all'
                          ? 'جرب تعديل الفلاتر أو مصطلح البحث'
                          : 'لم يتم إضافة أي مستخدمين بعد'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal for User Operations */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={
            modalType === 'add' ? 'إضافة مستخدم جديد' :
            modalType === 'edit' ? 'تعديل بيانات المستخدم' :
            modalType === 'view' ? 'تفاصيل المستخدم' :
            'صلاحيات المستخدم'
          }
          size="md"
        >
          <div className="p-6">
            {/* Add/Edit User Form */}
            {(modalType === 'add' || modalType === 'edit') && (
              <div className="space-y-4">
                <Input
                  label="اسم المستخدم *"
                  type="text"
                  value={userForm.name}
                  onChange={(e) => setUserForm({...userForm, name: e.target.value})}
                  placeholder="أدخل اسم المستخدم..."
                  required
                />

                <Input
                  label="البريد الإلكتروني *"
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                  placeholder="أدخل البريد الإلكتروني..."
                  required
                />

                <Input
                  label="رقم الهاتف *"
                  type="tel"
                  value={userForm.phone}
                  onChange={(e) => setUserForm({...userForm, phone: e.target.value})}
                  placeholder="مثال: 0591234567"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الدور *</label>
                  <select
                    value={userForm.roleId}
                    onChange={(e) => setUserForm({...userForm, roleId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">اختر الدور</option>
                    {roles.map(role => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">حالة المستخدم</label>
                  <select
                    value={userForm.status}
                    onChange={(e) => setUserForm({...userForm, status: e.target.value as SystemUser['status']})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="active">نشط</option>
                    <option value="inactive">غير نشط</option>
                    <option value="suspended">موقوف</option>
                  </select>
                </div>

                <div className="flex space-x-3 space-x-reverse justify-end pt-4">
                  <Button variant="secondary" onClick={() => setShowModal(false)}>
                    إلغاء
                  </Button>
                  <Button variant="primary" onClick={handleSaveUser}>
                    {modalType === 'add' ? 'إضافة المستخدم' : 'حفظ التغييرات'}
                  </Button>
                </div>
              </div>
            )}

            {/* View User Details */}
            {modalType === 'view' && selectedUser && (
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-3">معلومات المستخدم</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700">الاسم:</span>
                      <span className="font-medium text-blue-900 mr-2">{selectedUser.name}</span>
                    </div>
                    <div>
                      <span className="text-blue-700">البريد الإلكتروني:</span>
                      <span className="font-medium text-blue-900 mr-2">{selectedUser.email}</span>
                    </div>
                    <div>
                      <span className="text-blue-700">الهاتف:</span>
                      <span className="font-medium text-blue-900 mr-2">{selectedUser.phone}</span>
                    </div>
                    <div>
                      <span className="text-blue-700">الدور:</span>
                      <Badge variant="info" size="sm" className="mr-2">
                        {getRoleName(selectedUser.roleId)}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-blue-700">الحالة:</span>
                      <Badge 
                        variant={
                          selectedUser.status === 'active' ? 'success' :
                          selectedUser.status === 'inactive' ? 'neutral' : 'error'
                        }
                        size="sm"
                        className="mr-2"
                      >
                        {getStatusText(selectedUser.status)}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-blue-700">آخر دخول:</span>
                      <span className="font-medium text-blue-900 mr-2">
                        {new Date(selectedUser.lastLogin).toLocaleDateString('ar-SA')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 space-x-reverse justify-end pt-4">
                  <Button variant="secondary" onClick={() => setShowModal(false)}>
                    إغلاق
                  </Button>
                  <Button variant="primary" onClick={() => {
                    setModalType('edit');
                    setUserForm({
                      name: selectedUser.name,
                      email: selectedUser.email,
                      phone: selectedUser.phone,
                      roleId: selectedUser.roleId,
                      associatedId: selectedUser.associatedId || '',
                      associatedType: selectedUser.associatedType,
                      status: selectedUser.status
                    });
                  }}>
                    تعديل البيانات
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          data={filteredUsers.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: getRoleName(user.roleId),
            status: getStatusText(user.status),
            lastLogin: user.lastLogin,
            createdAt: user.createdAt
          }))}
          title="قائمة المستخدمين"
          defaultFilename={`قائمة_المستخدمين_${new Date().toISOString().split('T')[0]}`}
          availableFields={[
            { key: 'id', label: 'معرف المستخدم' },
            { key: 'name', label: 'الاسم' },
            { key: 'email', label: 'البريد الإلكتروني' },
            { key: 'phone', label: 'الهاتف' },
            { key: 'role', label: 'الدور' },
            { key: 'status', label: 'الحالة' },
            { key: 'lastLogin', label: 'آخر دخول' },
            { key: 'createdAt', label: 'تاريخ الإنشاء' }
          ]}
          filters={{ roleFilter, statusFilter, searchTerm }}
        />
      )}

      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3 space-x-reverse">
          <Users className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-blue-800 mb-3">إرشادات إدارة المستخدمين</h4>
            <ul className="text-sm text-blue-700 space-y-2">
              <li className="flex items-start space-x-2 space-x-reverse">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>تأكد من تعيين الدور المناسب لكل مستخدم حسب مسؤولياته</span>
              </li>
              <li className="flex items-start space-x-2 space-x-reverse">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>راجع صلاحيات المستخدمين بانتظام لضمان الأمان</span>
              </li>
              <li className="flex items-start space-x-2 space-x-reverse">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>قم بإلغاء تفعيل الحسابات غير المستخدمة</span>
              </li>
              <li className="flex items-start space-x-2 space-x-reverse">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>تابع آخر دخول للمستخدمين لمراقبة النشاط</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}