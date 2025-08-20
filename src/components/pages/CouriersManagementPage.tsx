import React, { useState } from 'react';
import { Truck, Search, Filter, Plus, Eye, Edit, Phone, Mail, CheckCircle, Clock, AlertTriangle, Star, Users, MapPin, Calendar, Download, RefreshCw, X, Activity, TrendingUp, BarChart3, Award, Shield, UserCheck, Navigation, MessageSquare } from 'lucide-react';
import { 
  mockCouriers,
  mockTasks, 
  mockBeneficiaries, 
  mockPackages,
  type Courier, 
  type Task
} from '../../data/mockData';
import { useErrorLogger } from '../../utils/errorLogger';
import { useExport } from '../../utils/exportUtils';
import { Button, Card, Input, Badge, Modal } from '../ui';

interface CourierFormData {
  name: string;
  phone: string;
  email: string;
  status: 'active' | 'busy' | 'offline';
  isHumanitarianApproved: boolean;
}

export default function CouriersManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit' | 'view' | 'assign-task' | 'track-location'>('add');
  const [selectedCourier, setSelectedCourier] = useState<Courier | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const { exportData } = useExport();
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const { logInfo, logError } = useErrorLogger();

  // استخدام البيانات الوهمية مباشرة
  const [couriers, setCouriers] = useState<Courier[]>(mockCouriers);
  const tasks = mockTasks;
  const beneficiaries = mockBeneficiaries;
  const packages = mockPackages;

  // Form states
  const [courierForm, setCourierForm] = useState<CourierFormData>({
    name: '',
    phone: '',
    email: '',
    status: 'active',
    isHumanitarianApproved: false
  });

  // فلترة المندوبين
  const filteredCouriers = couriers.filter(courier => {
    const matchesSearch = courier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         courier.phone.includes(searchTerm) ||
                         courier.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || courier.status === statusFilter;
    
    const matchesRating = ratingFilter === 'all' || 
                         (ratingFilter === 'high' && courier.rating >= 4.5) ||
                         (ratingFilter === 'medium' && courier.rating >= 3.5 && courier.rating < 4.5) ||
                         (ratingFilter === 'low' && courier.rating < 3.5);
    
    return matchesSearch && matchesStatus && matchesRating;
  });

  // إحصائيات المندوبين
  const statistics = {
    total: couriers.length,
    active: couriers.filter(c => c.status === 'active').length,
    busy: couriers.filter(c => c.status === 'busy').length,
    offline: couriers.filter(c => c.status === 'offline').length,
    approved: couriers.filter(c => c.isHumanitarianApproved).length,
    averageRating: couriers.reduce((sum, c) => sum + c.rating, 0) / couriers.length,
    totalCompletedTasks: couriers.reduce((sum, c) => sum + c.completedTasks, 0)
  };

  // الحصول على مهام المندوب
  const getCourierTasks = (courierId: string) => {
    return tasks.filter(task => task.courierId === courierId);
  };

  // الحصول على المهام النشطة للمندوب
  const getCourierActiveTasks = (courierId: string) => {
    return tasks.filter(task => 
      task.courierId === courierId && 
      ['assigned', 'in_progress'].includes(task.status)
    );
  };

  const handleAddCourier = () => {
    setModalType('add');
    setSelectedCourier(null);
    setCourierForm({
      name: '',
      phone: '',
      email: '',
      status: 'active',
      isHumanitarianApproved: false
    });
    setShowModal(true);
  };

  const handleEditCourier = (courier: Courier) => {
    setModalType('edit');
    setSelectedCourier(courier);
    setCourierForm({
      name: courier.name,
      phone: courier.phone,
      email: courier.email,
      status: courier.status,
      isHumanitarianApproved: courier.isHumanitarianApproved
    });
    setShowModal(true);
  };

  const handleViewCourier = (courier: Courier) => {
    setModalType('view');
    setSelectedCourier(courier);
    setShowModal(true);
  };

  const handleTrackLocation = (courier: Courier) => {
    setModalType('track-location');
    setSelectedCourier(courier);
    setShowModal(true);
  };

  const handleAssignTask = (courier: Courier) => {
    setModalType('assign-task');
    setSelectedCourier(courier);
    setShowModal(true);
  };

  const handleSaveCourier = async () => {
    if (!courierForm.name.trim() || !courierForm.phone.trim() || !courierForm.email.trim()) {
      setNotification({ message: 'يرجى إدخال جميع الحقول المطلوبة', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    try {
      if (modalType === 'add') {
        // إضافة مندوب جديد
        const newCourier: Courier = {
          id: `courier-${Date.now()}`,
          name: courierForm.name,
          phone: courierForm.phone,
          email: courierForm.email,
          status: courierForm.status,
          rating: 0,
          completedTasks: 0,
          currentLocation: { lat: 31.3469, lng: 34.3029 }, // موقع افتراضي في غزة
          isHumanitarianApproved: courierForm.isHumanitarianApproved
        };
        
        setCouriers(prev => [newCourier, ...prev]);
        setNotification({ message: `تم إضافة المندوب ${courierForm.name} بنجاح`, type: 'success' });
        logInfo(`تم إضافة مندوب جديد: ${courierForm.name}`, 'CouriersManagementPage');
      } else if (modalType === 'edit' && selectedCourier) {
        // تحديث مندوب موجود
        setCouriers(prev => 
          prev.map(courier => 
            courier.id === selectedCourier.id 
              ? { ...courier, ...courierForm }
              : courier
          )
        );
        setNotification({ message: `تم تحديث بيانات ${courierForm.name} بنجاح`, type: 'success' });
        logInfo(`تم تحديث بيانات المندوب: ${courierForm.name}`, 'CouriersManagementPage');
      }
      
      setTimeout(() => setNotification(null), 3000);
      setShowModal(false);
      setSelectedCourier(null);
    } catch (error) {
      logError(error as Error, 'CouriersManagementPage');
      setNotification({ message: 'حدث خطأ في حفظ البيانات', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleDeleteCourier = (courier: Courier) => {
    const activeTasks = getCourierActiveTasks(courier.id);
    if (activeTasks.length > 0) {
      setNotification({ 
        message: `لا يمكن حذف ${courier.name} لأن لديه ${activeTasks.length} مهمة نشطة`, 
        type: 'error' 
      });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    if (confirm(`هل أنت متأكد من حذف المندوب ${courier.name}؟`)) {
      setCouriers(prev => prev.filter(c => c.id !== courier.id));
      setNotification({ message: `تم حذف المندوب ${courier.name}`, type: 'warning' });
      setTimeout(() => setNotification(null), 3000);
      logInfo(`تم حذف المندوب: ${courier.name}`, 'CouriersManagementPage');
    }
  };

  const handleChangeStatus = (courier: Courier, newStatus: Courier['status']) => {
    setCouriers(prev => 
      prev.map(c => 
        c.id === courier.id 
          ? { ...c, status: newStatus }
          : c
      )
    );
    
    const statusText = {
      'active': 'نشط',
      'busy': 'مشغول',
      'offline': 'غير متصل'
    };
    
    setNotification({ 
      message: `تم تغيير حالة ${courier.name} إلى "${statusText[newStatus]}"`, 
      type: 'success' 
    });
    setTimeout(() => setNotification(null), 3000);
    logInfo(`تم تغيير حالة المندوب ${courier.name} إلى ${newStatus}`, 'CouriersManagementPage');
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
      case 'busy': return 'bg-orange-100 text-orange-800';
      case 'offline': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'busy': return 'مشغول';
      case 'offline': return 'غير متصل';
      default: return 'غير محدد';
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-yellow-600';
    return 'text-red-600';
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
            البيانات الوهمية محملة - {couriers.length} مندوب، {tasks.length} مهمة
          </span>
        </div>
      </Card>

      {/* Actions Bar */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-3 space-x-reverse">
          <Button variant="success" icon={Download} iconPosition="right" onClick={() => {
            exportData(filteredCouriers.map(courier => {
              const courierTasks = getCourierTasks(courier.id);
              const activeTasks = getCourierActiveTasks(courier.id);
              return {
                id: courier.id,
                name: courier.name,
                phone: courier.phone,
                email: courier.email,
                status: getStatusText(courier.status),
                rating: courier.rating,
                completedTasks: courier.completedTasks,
                activeTasks: activeTasks.length,
                isApproved: courier.isHumanitarianApproved ? 'معتمد' : 'غير معتمد',
                location: courier.currentLocation ?
                  `${courier.currentLocation.lat.toFixed(4)}, ${courier.currentLocation.lng.toFixed(4)}` :
                  'غير محدد'
              };
            }), { format: 'json', filename: `تقرير_المندوبين_سريع_${new Date().toISOString().split('T')[0]}` });
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
          <Button variant="primary" icon={Plus} iconPosition="right" onClick={handleAddCourier}>
            إضافة مندوب جديد
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
            placeholder="البحث في المندوبين..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">حالة المندوب</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع الحالات</option>
              <option value="active">نشط</option>
              <option value="busy">مشغول</option>
              <option value="offline">غير متصل</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">التقييم</label>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع التقييمات</option>
              <option value="high">ممتاز (4.5+)</option>
              <option value="medium">جيد (3.5-4.5)</option>
              <option value="low">يحتاج تحسين (أقل من 3.5)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-blue-50">
          <div className="text-center">
            <div className="bg-blue-100 p-3 rounded-xl mb-2">
              <Truck className="w-6 h-6 text-blue-600 mx-auto" />
            </div>
            <p className="text-sm text-blue-600">إجمالي المندوبين</p>
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

        <Card className="bg-orange-50">
          <div className="text-center">
            <div className="bg-orange-100 p-3 rounded-xl mb-2">
              <Clock className="w-6 h-6 text-orange-600 mx-auto" />
            </div>
            <p className="text-sm text-orange-600">مشغولين</p>
            <p className="text-2xl font-bold text-orange-900">{statistics.busy}</p>
          </div>
        </Card>

        <Card className="bg-gray-50">
          <div className="text-center">
            <div className="bg-gray-100 p-3 rounded-xl mb-2">
              <AlertTriangle className="w-6 h-6 text-gray-600 mx-auto" />
            </div>
            <p className="text-sm text-gray-600">غير متصلين</p>
            <p className="text-2xl font-bold text-gray-900">{statistics.offline}</p>
          </div>
        </Card>

        <Card className="bg-purple-50">
          <div className="text-center">
            <div className="bg-purple-100 p-3 rounded-xl mb-2">
              <Shield className="w-6 h-6 text-purple-600 mx-auto" />
            </div>
            <p className="text-sm text-purple-600">معتمدين</p>
            <p className="text-2xl font-bold text-purple-900">{statistics.approved}</p>
          </div>
        </Card>

        <Card className="bg-yellow-50">
          <div className="text-center">
            <div className="bg-yellow-100 p-3 rounded-xl mb-2">
              <Star className="w-6 h-6 text-yellow-600 mx-auto" />
            </div>
            <p className="text-sm text-yellow-600">متوسط التقييم</p>
            <p className="text-2xl font-bold text-yellow-900">{statistics.averageRating.toFixed(1)}</p>
          </div>
        </Card>
      </div>

      {/* Couriers Table */}
      <Card padding="none" className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">قائمة المندوبين ({filteredCouriers.length})</h3>
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
                  المندوب
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  معلومات الاتصال
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الحالة
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  التقييم
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المهام
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الموقع
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCouriers.length > 0 ? (
                filteredCouriers.map((courier) => {
                  const activeTasks = getCourierActiveTasks(courier.id);
                  
                  return (
                    <tr key={courier.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="bg-blue-100 p-2 rounded-lg ml-4">
                            <Truck className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2 space-x-reverse">
                              <span className="text-sm font-medium text-gray-900">{courier.name}</span>
                              {courier.isHumanitarianApproved && (
                                <Shield className="w-4 h-4 text-green-600" title="معتمد إنسانياً" />
                              )}
                            </div>
                            <div className="text-sm text-gray-500">#{courier.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm text-gray-900">{courier.phone}</div>
                          <div className="text-sm text-gray-500">{courier.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          <Badge variant={
                            courier.status === 'active' ? 'success' :
                            courier.status === 'busy' ? 'warning' : 'neutral'
                          } size="sm">
                            {getStatusText(courier.status)}
                          </Badge>
                          {courier.isHumanitarianApproved && (
                            <Badge variant="success" size="sm">
                              معتمد
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1 space-x-reverse">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className={`font-medium ${getRatingColor(courier.rating)}`}>
                            {courier.rating.toFixed(1)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {courier.completedTasks} مكتملة
                          </div>
                          <div className="text-sm text-gray-500">
                            {activeTasks.length} نشطة
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {courier.currentLocation ? (
                          <div className="flex items-center space-x-1 space-x-reverse">
                            <MapPin className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-gray-900">متاح</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1 space-x-reverse">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-500">غير محدد</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2 space-x-reverse">
                          <button 
                            onClick={() => handleViewCourier(courier)}
                            className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors" 
                            title="عرض التفاصيل"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEditCourier(courier)}
                            className="text-green-600 hover:text-green-900 p-2 rounded-lg hover:bg-green-50 transition-colors" 
                            title="تعديل"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleCall(courier.phone)}
                            className="text-orange-600 hover:text-orange-900 p-2 rounded-lg hover:bg-orange-50 transition-colors" 
                            title="اتصال"
                          >
                            <Phone className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleTrackLocation(courier)}
                            className="text-purple-600 hover:text-purple-900 p-2 rounded-lg hover:bg-purple-50 transition-colors" 
                            title="تتبع الموقع"
                          >
                            <Navigation className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <Truck className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium">
                        {searchTerm || statusFilter !== 'all' || ratingFilter !== 'all' 
                          ? 'لا توجد مندوبين مطابقين للفلاتر' 
                          : 'لا توجد مندوبين'}
                      </p>
                      <p className="text-sm mt-2">
                        {searchTerm || statusFilter !== 'all' || ratingFilter !== 'all'
                          ? 'جرب تعديل الفلاتر أو مصطلح البحث'
                          : 'لم يتم إضافة أي مندوبين بعد'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Performance Overview */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">أداء المندوبين</h3>
          <div className="space-y-4">
            {couriers.slice(0, 5).map((courier) => {
              const courierTasks = getCourierTasks(courier.id);
              const completedTasks = courierTasks.filter(t => t.status === 'delivered').length;
              const successRate = courierTasks.length > 0 ? (completedTasks / courierTasks.length * 100) : 0;

              return (
                <div key={courier.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <Truck className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{courier.name}</p>
                      <p className="text-sm text-gray-600">{courierTasks.length} مهمة</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1 space-x-reverse mb-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="font-medium text-gray-900">{courier.rating}</span>
                    </div>
                    <div className="text-sm text-green-600 font-medium">{successRate.toFixed(1)}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">إحصائيات الأداء</h3>
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-xl border border-green-200">
              <div className="flex items-center justify-between">
                <span className="text-green-700">معدل النجاح العام</span>
                <span className="text-2xl font-bold text-green-900">
                  {tasks.length > 0 ? ((tasks.filter(t => t.status === 'delivered').length / tasks.length) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-blue-700">متوسط وقت التسليم</span>
                <span className="text-2xl font-bold text-blue-900">2.3 ساعة</span>
              </div>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
              <div className="flex items-center justify-between">
                <span className="text-orange-700">المهام النشطة</span>
                <span className="text-2xl font-bold text-orange-900">
                  {tasks.filter(t => ['assigned', 'in_progress'].includes(t.status)).length}
                </span>
              </div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
              <div className="flex items-center justify-between">
                <span className="text-purple-700">إجمالي المهام المكتملة</span>
                <span className="text-2xl font-bold text-purple-900">{statistics.totalCompletedTasks}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Modal for Courier Operations */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={
            modalType === 'add' ? 'إضافة مندوب جديد' :
            modalType === 'edit' ? 'تعديل بيانات المندوب' :
            modalType === 'view' ? 'تفاصيل المندوب' :
            modalType === 'track-location' ? 'تتبع موقع المندوب' :
            'تعيين مهمة'
          }
          size="md"
        >
          <div className="p-6">
            {/* Add/Edit Courier Form */}
            {(modalType === 'add' || modalType === 'edit') && (
              <div className="space-y-4">
                <Input
                  label="اسم المندوب *"
                  type="text"
                  value={courierForm.name}
                  onChange={(e) => setCourierForm({...courierForm, name: e.target.value})}
                  placeholder="أدخل اسم المندوب..."
                  required
                />

                <Input
                  label="رقم الهاتف *"
                  type="tel"
                  value={courierForm.phone}
                  onChange={(e) => setCourierForm({...courierForm, phone: e.target.value})}
                  placeholder="مثال: 0591234567"
                  required
                />

                <Input
                  label="البريد الإلكتروني *"
                  type="email"
                  value={courierForm.email}
                  onChange={(e) => setCourierForm({...courierForm, email: e.target.value})}
                  placeholder="مثال: courier@example.com"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">حالة المندوب</label>
                  <select
                    value={courierForm.status}
                    onChange={(e) => setCourierForm({...courierForm, status: e.target.value as Courier['status']})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="active">نشط</option>
                    <option value="busy">مشغول</option>
                    <option value="offline">غير متصل</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse">
                  <input
                    type="checkbox"
                    checked={courierForm.isHumanitarianApproved}
                    onChange={(e) => setCourierForm({...courierForm, isHumanitarianApproved: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label className="text-sm text-gray-700">معتمد للعمل الإنساني</label>
                </div>

                <div className="flex space-x-3 space-x-reverse justify-end pt-4">
                  <Button variant="secondary" onClick={() => setShowModal(false)}>
                    إلغاء
                  </Button>
                  <Button variant="primary" onClick={handleSaveCourier}>
                    {modalType === 'add' ? 'إضافة المندوب' : 'حفظ التغييرات'}
                  </Button>
                </div>
              </div>
            )}

            {/* View Courier Details */}
            {modalType === 'view' && selectedCourier && (
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-3">معلومات المندوب</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700">الاسم:</span>
                      <span className="font-medium text-blue-900 mr-2">{selectedCourier.name}</span>
                    </div>
                    <div>
                      <span className="text-blue-700">الهاتف:</span>
                      <span className="font-medium text-blue-900 mr-2">{selectedCourier.phone}</span>
                    </div>
                    <div>
                      <span className="text-blue-700">البريد الإلكتروني:</span>
                      <span className="font-medium text-blue-900 mr-2">{selectedCourier.email}</span>
                    </div>
                    <div>
                      <span className="text-blue-700">الحالة:</span>
                      <Badge variant={
                        selectedCourier.status === 'active' ? 'success' :
                        selectedCourier.status === 'busy' ? 'warning' : 'neutral'
                      } size="sm" className="mr-2">
                        {getStatusText(selectedCourier.status)}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-blue-700">التقييم:</span>
                      <div className="flex items-center space-x-1 space-x-reverse mr-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="font-medium text-blue-900">{selectedCourier.rating}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-blue-700">المهام المكتملة:</span>
                      <span className="font-medium text-blue-900 mr-2">{selectedCourier.completedTasks}</span>
                    </div>
                  </div>
                </div>

                {/* Courier Tasks */}
                <div className="bg-gray-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-gray-800 mb-3">المهام الحالية</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {getCourierActiveTasks(selectedCourier.id).length > 0 ? (
                      getCourierActiveTasks(selectedCourier.id).map((task) => {
                        const beneficiary = beneficiaries.find(b => b.id === task.beneficiaryId);
                        const packageInfo = packages.find(p => p.id === task.packageId);
                        
                        return (
                          <div key={task.id} className="bg-white p-3 rounded-lg flex justify-between items-center">
                            <div>
                              <p className="font-medium text-gray-900">
                                {packageInfo?.name || 'طرد غير محدد'}
                              </p>
                              <p className="text-sm text-gray-600">
                                {beneficiary?.name || 'مستفيد غير محدد'}
                              </p>
                            </div>
                            <Badge variant={
                              task.status === 'assigned' ? 'info' : 'warning'
                            } size="sm">
                              {task.status === 'assigned' ? 'معين' : 'قيد التنفيذ'}
                            </Badge>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-gray-500 text-center py-4">لا توجد مهام نشطة</p>
                    )}
                  </div>
                </div>

                <div className="flex space-x-3 space-x-reverse justify-end pt-4">
                  <Button variant="secondary" onClick={() => setShowModal(false)}>
                    إغلاق
                  </Button>
                  <Button variant="primary" onClick={() => {
                    setModalType('edit');
                    setCourierForm({
                      name: selectedCourier.name,
                      phone: selectedCourier.phone,
                      email: selectedCourier.email,
                      status: selectedCourier.status,
                      isHumanitarianApproved: selectedCourier.isHumanitarianApproved
                    });
                  }}>
                    تعديل البيانات
                  </Button>
                </div>
              </div>
            )}

            {/* Track Location */}
            {modalType === 'track-location' && selectedCourier && (
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-3">موقع المندوب الحالي</h4>
                  {selectedCourier.currentLocation ? (
                    <div className="space-y-3">
                      <div className="bg-white p-4 rounded-lg">
                        <div className="flex items-center space-x-2 space-x-reverse mb-2">
                          <MapPin className="w-5 h-5 text-green-600" />
                          <span className="font-medium text-gray-900">الإحداثيات</span>
                        </div>
                        <p className="text-sm text-gray-700">
                          خط العرض: {selectedCourier.currentLocation.lat.toFixed(6)}
                        </p>
                        <p className="text-sm text-gray-700">
                          خط الطول: {selectedCourier.currentLocation.lng.toFixed(6)}
                        </p>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg h-48 flex items-center justify-center">
                        <div className="text-center">
                          <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">خريطة تفاعلية</p>
                          <p className="text-xs text-gray-500">سيتم تطوير الخريطة التفاعلية هنا</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-600">الموقع غير متاح</p>
                      <p className="text-sm text-gray-500">المندوب لم يشارك موقعه بعد</p>
                    </div>
                  )}
                </div>

                <div className="flex space-x-3 space-x-reverse justify-end pt-4">
                  <Button variant="secondary" onClick={() => setShowModal(false)}>
                    إغلاق
                  </Button>
                  <Button variant="primary">
                    تحديث الموقع
                  </Button>
                </div>
              </div>
            )}

            {/* Assign Task */}
            {modalType === 'assign-task' && selectedCourier && (
              <div className="space-y-4">
                <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                  <h4 className="font-semibold text-purple-800 mb-3">تعيين مهمة جديدة</h4>
                  <p className="text-purple-700 text-sm">
                    سيتم تعيين مهمة جديدة للمندوب {selectedCourier.name}
                  </p>
                </div>

                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">نموذج تعيين المهام</p>
                  <p className="text-sm text-gray-500">سيتم تطوير واجهة تعيين المهام هنا</p>
                </div>

                <div className="flex space-x-3 space-x-reverse justify-end pt-4">
                  <Button variant="secondary" onClick={() => setShowModal(false)}>
                    إلغاء
                  </Button>
                  <Button variant="primary">
                    تعيين المهمة
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
          data={filteredCouriers.map(courier => {
            const courierTasks = getCourierTasks(courier.id);
            const activeTasks = getCourierActiveTasks(courier.id);
            
            return {
              id: courier.id,
              name: courier.name,
              phone: courier.phone,
              email: courier.email,
              status: getStatusText(courier.status),
              rating: courier.rating,
              completedTasks: courier.completedTasks,
              activeTasks: activeTasks.length,
              isApproved: courier.isHumanitarianApproved ? 'معتمد' : 'غير معتمد',
              location: courier.currentLocation ? 
                `${courier.currentLocation.lat.toFixed(4)}, ${courier.currentLocation.lng.toFixed(4)}` : 
                'غير محدد'
            };
          })}
          title="قائمة المندوبين"
          defaultFilename={`قائمة_المندوبين_${new Date().toISOString().split('T')[0]}`}
          availableFields={[
            { key: 'id', label: 'معرف المندوب' },
            { key: 'name', label: 'الاسم' },
            { key: 'phone', label: 'الهاتف' },
            { key: 'email', label: 'البريد الإلكتروني' },
            { key: 'status', label: 'الحالة' },
            { key: 'rating', label: 'التقييم' },
            { key: 'completedTasks', label: 'المهام المكتملة' },
            { key: 'activeTasks', label: 'المهام النشطة' },
            { key: 'isApproved', label: 'الاعتماد' },
            { key: 'location', label: 'الموقع الحالي' }
          ]}
          filters={{ statusFilter, ratingFilter, searchTerm }}
        />
      )}

      {/* Quick Status Change */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">تغيير سريع للحالة</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {couriers.filter(c => c.status !== 'offline').map((courier) => (
            <div key={courier.id} className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Truck className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-gray-900">{courier.name}</span>
                </div>
                <Badge variant={
                  courier.status === 'active' ? 'success' :
                  courier.status === 'busy' ? 'warning' : 'neutral'
                } size="sm">
                  {getStatusText(courier.status)}
                </Badge>
              </div>
              
              <div className="flex space-x-2 space-x-reverse">
                <button
                  onClick={() => handleChangeStatus(courier, 'active')}
                  disabled={courier.status === 'active'}
                  className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg text-sm hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  نشط
                </button>
                <button
                  onClick={() => handleChangeStatus(courier, 'busy')}
                  disabled={courier.status === 'busy'}
                  className="flex-1 bg-orange-600 text-white py-2 px-3 rounded-lg text-sm hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  مشغول
                </button>
                <button
                  onClick={() => handleChangeStatus(courier, 'offline')}
                  disabled={courier.status === 'offline'}
                  className="flex-1 bg-gray-600 text-white py-2 px-3 rounded-lg text-sm hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  غير متصل
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3 space-x-reverse">
          <Truck className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-blue-800 mb-3">إرشادات إدارة المندوبين</h4>
            <ul className="text-sm text-blue-700 space-y-2">
              <li className="flex items-start space-x-2 space-x-reverse">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>المندوبين المعتمدين فقط يمكنهم تسليم المساعدات الإنسانية</span>
              </li>
              <li className="flex items-start space-x-2 space-x-reverse">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>يتم تتبع موقع المندوبين أثناء تنفيذ المهام لضمان الأمان</span>
              </li>
              <li className="flex items-start space-x-2 space-x-reverse">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>التقييمات تعتمد على آراء المستفيدين وسرعة التسليم</span>
              </li>
              <li className="flex items-start space-x-2 space-x-reverse">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>يمكن تغيير حالة المندوب بسرعة من لوحة التحكم السريع</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}