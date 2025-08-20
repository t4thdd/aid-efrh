import React, { useState } from 'react';
import { Building2, Search, Filter, Plus, Eye, Edit, Phone, Mail, CheckCircle, Clock, AlertTriangle, Users, Package, Star, TrendingUp, Download, MapPin, Calendar, RefreshCw } from 'lucide-react';
import { mockOrganizations, type Organization } from '../../data/mockData';
import { useErrorLogger } from '../../utils/errorLogger';
import { useExport } from '../../utils/exportUtils';
import { Button, Card, Input, Badge, Modal, ExportModal } from '../ui';

import OrganizationForm from '../OrganizationForm';
interface OrganizationsListPageProps {
  loggedInUser?: any;
  highlightOrganizationId?: string;
}

export default function OrganizationsListPage({ loggedInUser, highlightOrganizationId }: OrganizationsListPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit' | 'view'>('add');
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const { exportData } = useExport();
  const { logError, logInfo } = useErrorLogger();

  // استخدام البيانات الوهمية مباشرة
  const organizations = mockOrganizations;
  const loading = false;
  const error = null;
  
  const refetch = () => {
    // Simulate refetching mock data
    // In a real app, this would re-fetch from the backend
    logInfo('محاكاة تحديث بيانات المؤسسات', 'OrganizationsListPage');
    // For mock data, we just re-render or update the mock data directly if it were mutable
  };

  // محاكاة العمليات
  const insert = async (data: Partial<Organization>) => {
    logInfo(`محاكاة إضافة مؤسسة: ${data.name}`, 'OrganizationsListPage');
    // Simulate adding to mock data
    mockOrganizations.push({ ...data, id: `org-${Date.now()}`, beneficiariesCount: 0, packagesCount: 0, completionRate: 0, createdAt: new Date().toISOString(), packagesAvailable: 0, templatesCount: 0, isPopular: false } as Organization);
    return true;
  };

  const update = async (id: string, data: Partial<Organization>) => {
    logInfo(`محاكاة تحديث مؤسسة: ${id}`, 'OrganizationsListPage');
    return true;
  };

  const deleteRecord = async (id: string) => {
    logInfo(`محاكاة حذف مؤسسة: ${id}`, 'OrganizationsListPage');
    return true;
  };

  // فلترة البيانات
  const filteredOrganizations = organizations.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         org.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         org.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || org.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // إحصائيات
  const totalOrganizations = organizations.length;
  const activeOrganizations = organizations.filter(org => org.status === 'active').length;
  const pendingOrganizations = organizations.filter(org => org.status === 'pending').length;
  const totalBeneficiaries = organizations.reduce((sum, org) => sum + org.beneficiariesCount, 0);

  const handleAddNew = () => {
    setModalType('add');
    setSelectedOrganization(null);
    setShowModal(true);
  };

  const handleEdit = (organization: Organization) => {
    setModalType('edit');
    setSelectedOrganization(organization);
    setShowModal(true);
  };

  const handleSaveOrganization = async (data: Partial<Organization>) => {
    try {
      if (modalType === 'add') {
        await insert(data);
        setNotification({ message: `تم إضافة المؤسسة "${data.name}" بنجاح`, type: 'success' });
      } else if (modalType === 'edit' && selectedOrganization) {
        await update(selectedOrganization.id, data);
        setNotification({ message: `تم تحديث المؤسسة "${data.name}" بنجاح`, type: 'success' });
      }
      setTimeout(() => setNotification(null), 3000);
      setShowModal(false);
      setSelectedOrganization(null);
      refetch();
    } catch (error) {
      logError(error as Error, 'OrganizationsListPage');
      setNotification({ message: 'حدث خطأ في حفظ البيانات', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleCancelOrganization = () => {
    setShowModal(false);
    setSelectedOrganization(null);
  };

  const handleView = (organization: Organization) => {
    setModalType('view');
    setSelectedOrganization(organization);
    setShowModal(true);
  };

  const handleDelete = async (organization: Organization) => {
    if (confirm(`هل أنت متأكد من حذف المؤسسة "${organization.name}"؟`)) {
      await deleteRecord(organization.id);
      logInfo(`تم حذف المؤسسة: ${organization.name}`, 'OrganizationsListPage');
      refetch();
    }
  };

  const handleCall = (phone: string) => {
    if (confirm(`هل تريد الاتصال بالرقم ${phone}؟`)) {
      window.open(`tel:${phone}`);
    }
  };

  const handleEmail = (email: string) => {
    window.open(`mailto:${email}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'نشطة';
      case 'pending': return 'معلقة';
      case 'suspended': return 'موقوفة';
      default: return 'غير محدد';
    }
  };

  return (
    <div className="space-y-6">
      {/* Data Source Indicator */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
        <div className="flex items-center space-x-2 space-x-reverse text-blue-600">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm font-medium">البيانات الوهمية محملة ({organizations.length} مؤسسة)</span>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-3 space-x-reverse">
          <button
            onClick={() => setShowExportModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors flex items-center"
          >
            <Download className="w-4 h-4 ml-2" />
            تصدير المؤسسات
          </button>
          <button 
            onClick={handleAddNew}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 ml-2" />
            إضافة مؤسسة جديدة
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="w-5 h-5 absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="البحث في المؤسسات (الاسم، النوع، الموقع)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع الحالات</option>
              <option value="active">نشطة</option>
              <option value="pending">معلقة</option>
              <option value="suspended">موقوفة</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">إجمالي المؤسسات</p>
              <p className="text-3xl font-bold text-gray-900">{totalOrganizations}</p>
            </div>
            <div className="bg-blue-100 p-4 rounded-2xl">
              <Building2 className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">مؤسسات نشطة</p>
              <p className="text-3xl font-bold text-gray-900">{activeOrganizations}</p>
            </div>
            <div className="bg-green-100 p-4 rounded-2xl">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">معلقة</p>
              <p className="text-3xl font-bold text-gray-900">{pendingOrganizations}</p>
            </div>
            <div className="bg-yellow-100 p-4 rounded-2xl">
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">إجمالي المستفيدين</p>
              <p className="text-3xl font-bold text-gray-900">{totalBeneficiaries}</p>
            </div>
            <div className="bg-purple-100 p-4 rounded-2xl">
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Organizations Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">قائمة المؤسسات ({filteredOrganizations.length})</h3>
            <div className="flex items-center space-x-2 space-x-reverse text-blue-600">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">البيانات الوهمية</span>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    المؤسسة
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    النوع
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الموقع
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    جهة الاتصال
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    المستفيدين
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الحالة
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrganizations.length > 0 ? (
                  filteredOrganizations.map((organization) => (
                    <tr key={organization.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="bg-blue-100 p-2 rounded-xl ml-4">
                            <Building2 className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{organization.name}</div>
                            <div className="text-sm text-gray-500">
                              تاريخ التسجيل: {new Date(organization.createdAt).toLocaleDateString('ar-SA')}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {organization.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center space-x-1 space-x-reverse">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span>{organization.location}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{organization.contactPerson}</div>
                          <div className="text-gray-500">{organization.phone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center space-x-1 space-x-reverse">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{organization.beneficiariesCount}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {organization.packagesCount} طرد
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(organization.status)}`}>
                          {getStatusText(organization.status)}
                        </span>
                        <div className="text-xs text-gray-500 mt-1">
                          {organization.completionRate}% إنجاز
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2 space-x-reverse">
                          <button 
                            onClick={() => handleView(organization)}
                            className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors" 
                            title="عرض التفاصيل"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEdit(organization)}
                            className="text-green-600 hover:text-green-900 p-2 rounded-lg hover:bg-green-50 transition-colors" 
                            title="تعديل"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleCall(organization.phone)}
                            className="text-orange-600 hover:text-orange-900 p-2 rounded-lg hover:bg-orange-50 transition-colors" 
                            title="اتصال"
                          >
                            <Phone className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEmail(organization.email)}
                            className="text-purple-600 hover:text-purple-900 p-2 rounded-lg hover:bg-purple-50 transition-colors" 
                            title="إرسال بريد إلكتروني"
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">
                          {searchTerm ? 'لا توجد نتائج للبحث' : 'لا توجد مؤسسات'}
                        </p>
                        <p className="text-sm mt-2">
                          {searchTerm ? 'جرب تعديل مصطلح البحث' : 'لم يتم إضافة أي مؤسسات بعد'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal for Add/Edit/View */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" dir="rtl">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {modalType === 'add' ? 'إضافة مؤسسة جديدة' :
                 modalType === 'edit' ? 'تعديل بيانات المؤسسة' :
                 'عرض تفاصيل المؤسسة'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                ✕
              </button>
            </div>
            
            {(modalType === 'add' || modalType === 'edit') && (
              <OrganizationForm
                organization={modalType === 'edit' ? selectedOrganization : null}
                onSave={handleSaveOrganization}
                onCancel={handleCancelOrganization}
              />
            )}
            {modalType === 'view' && selectedOrganization && (
              <div className="p-6 space-y-6">
                {/* Organization Details */}
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                  <h4 className="text-lg font-bold text-blue-800 mb-4">تفاصيل المؤسسة</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-3">
                      <div>
                        <span className="text-blue-700">اسم المؤسسة:</span>
                        <span className="font-medium text-blue-900 mr-2">{selectedOrganization.name}</span>
                      </div>
                      <div>
                        <span className="text-blue-700">النوع:</span>
                        <span className="font-medium text-blue-900 mr-2">{selectedOrganization.type}</span>
                      </div>
                      <div>
                        <span className="text-blue-700">الموقع:</span>
                        <span className="font-medium text-blue-900 mr-2">{selectedOrganization.location}</span>
                      </div>
                      <div>
                        <span className="text-blue-700">الحالة:</span>
                        <Badge variant={
                          selectedOrganization.status === 'active' ? 'success' :
                          selectedOrganization.status === 'pending' ? 'warning' : 'error'
                        } size="sm" className="mr-2">
                          {getStatusText(selectedOrganization.status)}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <span className="text-blue-700">شخص الاتصال:</span>
                        <span className="font-medium text-blue-900 mr-2">{selectedOrganization.contactPerson}</span>
                      </div>
                      <div>
                        <span className="text-blue-700">الهاتف:</span>
                        <span className="font-medium text-blue-900 mr-2">{selectedOrganization.phone}</span>
                      </div>
                      <div>
                        <span className="text-blue-700">البريد الإلكتروني:</span>
                        <span className="font-medium text-blue-900 mr-2">{selectedOrganization.email}</span>
                      </div>
                      <div>
                        <span className="text-blue-700">تاريخ التسجيل:</span>
                        <span className="font-medium text-blue-900 mr-2">
                          {new Date(selectedOrganization.createdAt).toLocaleDateString('ar-SA')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Statistics */}
                <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                  <h4 className="text-lg font-bold text-green-800 mb-4">إحصائيات المؤسسة</h4>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="bg-green-100 p-3 rounded-lg mb-2">
                        <Users className="w-6 h-6 text-green-600 mx-auto" />
                      </div>
                      <p className="text-green-700">المستفيدين</p>
                      <p className="text-2xl font-bold text-green-900">{selectedOrganization.beneficiariesCount}</p>
                    </div>
                    <div className="text-center">
                      <div className="bg-green-100 p-3 rounded-lg mb-2">
                        <Package className="w-6 h-6 text-green-600 mx-auto" />
                      </div>
                      <p className="text-green-700">الطرود</p>
                      <p className="text-2xl font-bold text-green-900">{selectedOrganization.packagesCount}</p>
                    </div>
                    <div className="text-center">
                      <div className="bg-green-100 p-3 rounded-lg mb-2">
                        <BarChart3 className="w-6 h-6 text-green-600 mx-auto" />
                      </div>
                      <p className="text-green-700">نسبة الإنجاز</p>
                      <p className="text-2xl font-bold text-green-900">{selectedOrganization.completionRate}%</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-3 space-x-reverse justify-end">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    إغلاق
                  </button>
                  <button
                    onClick={() => {
                      setModalType('edit');
                      // لا نحتاج لتغيير selectedOrganization لأنه نفس المؤسسة
                    }}
                    className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    تعديل البيانات
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          data={filteredOrganizations}
          title="قائمة المؤسسات"
          defaultFilename={`قائمة_المؤسسات_${new Date().toISOString().split('T')[0]}`}
          availableFields={[
            { key: 'name', label: 'اسم المؤسسة' },
            { key: 'type', label: 'النوع' },
            { key: 'location', label: 'الموقع' },
            { key: 'contactPerson', label: 'شخص الاتصال' },
            { key: 'phone', label: 'الهاتف' },
            { key: 'email', label: 'البريد الإلكتروني' },
            { key: 'beneficiariesCount', label: 'عدد المستفيدين' },
            { key: 'packagesCount', label: 'عدد الطرود' },
            { key: 'completionRate', label: 'نسبة الإنجاز' },
            { key: 'status', label: 'الحالة' },
            { key: 'createdAt', label: 'تاريخ التسجيل' }
          ]}
          filters={{ statusFilter, searchTerm }}
        />
      )}
    </div>
  );
}