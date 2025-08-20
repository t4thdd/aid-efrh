import React, { useState, useEffect, useCallback } from 'react';
import { 
  mockTasks, 
  mockBeneficiaries, 
  mockPackages, 
  mockCouriers,
  type Task, 
  type Beneficiary, 
  type Package as PackageType, 
  type Courier 
} from '../../data/mockData';
import { useErrorLogger } from '../../utils/errorLogger';
import { Button, Card, Input, Badge, Modal, ExportModal } from '../ui';
import GazaMap, { type MapPoint } from '../GazaMap';
import { MapPin, User, Package, Truck, Clock, CheckCircle, AlertTriangle, Calendar, RefreshCw, Download, Star, TrendingUp, Activity, Navigation, BarChart3, Phone, FileText, Mail, Award } from 'lucide-react';

export default function TrackingPage() {
  const { logInfo, logError } = useErrorLogger();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedCourier, setSelectedCourier] = useState<Courier | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'view' | 'update' | 'track'>('view');
  const [showExportModal, setShowExportModal] = useState(false);
  const [mapFilter, setMapFilter] = useState<'all' | 'delivered' | 'problem' | 'rescheduled' | 'pending'>('all');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  // استخدام البيانات الوهمية مباشرة
  const tasks = mockTasks;
  const beneficiaries = mockBeneficiaries;
  const packages = mockPackages;
  const couriers = mockCouriers;
  const [simulatedCourierLocation, setSimulatedCourierLocation] = useState<{ lat: number; lng: number } | null>(null);

  const regions = ['شمال غزة', 'مدينة غزة', 'الوسط', 'خان يونس', 'رفح'];

  // فلترة المهام
  const filteredTasks = tasks.filter(task => {
    const beneficiary = beneficiaries.find(b => b.id === task.beneficiaryId);
    const packageInfo = packages.find(p => p.id === task.packageId);
    const courier = couriers.find(c => c.id === task.courierId);
    
    const matchesSearch = 
      beneficiary?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      beneficiary?.nationalId.includes(searchTerm) ||
      packageInfo?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      courier?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // إعداد نقاط الخريطة
  const mapPoints: MapPoint[] = beneficiaries
    .filter(beneficiary => {
      if (mapFilter === 'all') return true;
      const task = tasks.find(t => t.beneficiaryId === beneficiary.id);
      return task && task.status === mapFilter;
    })
    .map(beneficiary => {
      const task = tasks.find(t => t.beneficiaryId === beneficiary.id);
      return {
        id: beneficiary.id,
        lat: beneficiary.location?.lat || 0,
        lng: beneficiary.location?.lng || 0,
        status: task?.status || 'pending',
        title: beneficiary.name,
        description: task ? packages.find(p => p.id === task.packageId)?.name || 'طرد غير محدد' : 'لا توجد مهمة',
        data: beneficiary
      };
    })
    .filter(point => point.lat !== 0 && point.lng !== 0);

  // إحصائيات
  const stats = {
    total: tasks.length,
    delivered: tasks.filter(t => t.status === 'delivered').length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    problem: tasks.filter(t => t.status === 'problem').length,
    rescheduled: tasks.filter(t => t.status === 'rescheduled').length
  };

  const handleViewTask = (task: Task) => {
    setSelectedTask(task);
    setSelectedCourier(couriers.find(c => c.id === task.courierId) || null);
    setModalType('view');
    setShowModal(true);
  };

  const handleUpdateTask = (task: Task) => {
    setSelectedTask(task);
    setSelectedCourier(couriers.find(c => c.id === task.courierId) || null);
    setModalType('update');
    setShowModal(true);
  };

  const handleTrackTask = (task: Task) => {
    setSelectedTask(task);
    setSelectedCourier(couriers.find(c => c.id === task.courierId) || null);
    setModalType('track');
    setShowModal(true);
  };

  const simulateCourierMovement = useCallback(() => {
    if (selectedCourier && selectedCourier.currentLocation) {
      const newLat = selectedCourier.currentLocation.lat + (Math.random() - 0.5) * 0.01; // Small random change
      const newLng = selectedCourier.currentLocation.lng + (Math.random() - 0.5) * 0.01;
      setSimulatedCourierLocation({ lat: newLat, lng: newLng });
      setNotification({ message: 'تم تحديث موقع المندوب (محاكاة)', type: 'info' });
      setTimeout(() => setNotification(null), 2000);
    } else {
      setNotification({ message: 'لا يوجد موقع حالي للمندوب للمحاكاة', type: 'warning' });
      setTimeout(() => setNotification(null), 3000);
    }
  }, [selectedCourier]);

  useEffect(() => {
    if (modalType === 'track' && selectedCourier && selectedCourier.currentLocation) {
      setSimulatedCourierLocation(selectedCourier.currentLocation);
    }
  }, [modalType, selectedCourier]);


  const handleMapPointClick = (beneficiary: Beneficiary) => {
    const task = tasks.find(t => t.beneficiaryId === beneficiary.id);
    if (task) {
      handleViewTask(task);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'في الانتظار';
      case 'in_progress': return 'قيد التنفيذ';
      case 'delivered': return 'تم التسليم';
      case 'problem': return 'مشكلة';
      case 'rescheduled': return 'تم إعادة الجدولة';
      case 'active': return 'نشط';
      case 'busy': return 'مشغول';
      case 'offline': return 'غير متصل';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'success';
      case 'in_progress': return 'info';
      case 'pending': return 'warning';
      case 'problem': return 'error';
      case 'rescheduled': return 'neutral';
      default: return 'neutral';
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
      case 'success': return <CheckCircle className="w-5 h-5 text-green-600" />; // Keep CheckCircle for success
      case 'error': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'warning': return <Clock className="w-5 h-5 text-orange-600" />;
    }
  };

  const handleExport = () => {
    setShowExportModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-3 space-x-reverse ${getNotificationClasses(notification.type)}`}>
          {getNotificationIcon(notification.type)} {/* Use the correct icon */}
          <span className="font-medium">{notification.message}</span>
          <button onClick={() => setNotification(null)} className="text-gray-500 hover:text-gray-700">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Data Source Indicator */}
      <Card className="bg-blue-50 border-blue-200" padding="sm">
        <div className="flex items-center space-x-2 space-x-reverse text-blue-600">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm font-medium">
            البيانات الوهمية محملة - {tasks.length} مهمة، {beneficiaries.length} مستفيد، {couriers.length} مندوب
          </span>
        </div>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="bg-blue-50">
          <div className="text-center">
            <div className="bg-blue-100 p-3 rounded-xl mb-2">
              <Package className="w-6 h-6 text-blue-600 mx-auto" />
            </div>
            <p className="text-sm text-blue-600">إجمالي المهام</p>
            <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
          </div>
        </Card>

        <Card className="bg-green-50">
          <div className="text-center">
            <div className="bg-green-100 p-3 rounded-xl mb-2">
              <CheckCircle className="w-6 h-6 text-green-600 mx-auto" />
            </div>
            <p className="text-sm text-green-600">تم التسليم</p>
            <p className="text-2xl font-bold text-green-900">{stats.delivered}</p>
          </div>
        </Card>

        <Card className="bg-orange-50">
          <div className="text-center">
            <div className="bg-orange-100 p-3 rounded-xl mb-2">
              <Clock className="w-6 h-6 text-orange-600 mx-auto" />
            </div>
            <p className="text-sm text-orange-600">في الانتظار</p>
            <p className="text-2xl font-bold text-orange-900">{stats.pending}</p>
          </div>
        </Card>

        <Card className="bg-purple-50">
          <div className="text-center">
            <div className="bg-purple-100 p-3 rounded-xl mb-2">
              <Activity className="w-6 h-6 text-purple-600 mx-auto" />
            </div>
            <p className="text-sm text-purple-600">قيد التنفيذ</p>
            <p className="text-2xl font-bold text-purple-900">{stats.inProgress}</p>
          </div>
        </Card>

        <Card className="bg-red-50">
          <div className="text-center">
            <div className="bg-red-100 p-3 rounded-xl mb-2">
              <AlertTriangle className="w-6 h-6 text-red-600 mx-auto" />
            </div>
            <p className="text-sm text-red-600">مشاكل</p>
            <p className="text-2xl font-bold text-red-900">{stats.problem}</p>
          </div>
        </Card>

        <Card className="bg-gray-50">
          <div className="text-center">
            <div className="bg-gray-100 p-3 rounded-xl mb-2">
              <Calendar className="w-6 h-6 text-gray-600 mx-auto" />
            </div>
            <p className="text-sm text-gray-600">معاد جدولتها</p>
            <p className="text-2xl font-bold text-gray-900">{stats.rescheduled}</p>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <Input
            type="text"
            icon={Package}
            iconPosition="right"
            placeholder="البحث في المهام..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Card>

        <Card>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">جميع الحالات</option>
            <option value="pending">في الانتظار</option>
            <option value="in_progress">قيد التنفيذ</option>
            <option value="delivered">تم التسليم</option>
            <option value="problem">مشكلة</option>
            <option value="rescheduled">معاد جدولتها</option>
          </select>
        </Card>

        <Card>
          <Button variant="secondary" icon={Download} iconPosition="right" onClick={handleExport} className="w-full">
            تصدير البيانات
          </Button>
        </Card>
      </div>

      {/* Map Section */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">خريطة التتبع</h3>
          <div className="flex space-x-2 space-x-reverse">
            <select
              value={mapFilter}
              onChange={(e) => setMapFilter(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع المهام</option>
              <option value="pending">في الانتظار</option>
              <option value="delivered">تم التسليم</option>
              <option value="problem">مشاكل</option>
              <option value="rescheduled">معاد جدولتها</option>
            </select>
          </div>
        </div>
        
        <GazaMap
          points={mapPoints}
          onPointClick={handleMapPointClick}
          className="h-96"
        />
      </Card>

      {/* Tasks List */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">قائمة المهام</h3>
          <div className="text-sm text-gray-600">
            عرض {filteredTasks.length} من {tasks.length} مهمة
          </div>
        </div>

        <div className="space-y-4">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => {
              const beneficiary = beneficiaries.find(b => b.id === task.beneficiaryId);
              const packageInfo = packages.find(p => p.id === task.packageId);
              const courier = couriers.find(c => c.id === task.courierId);

              return (
                <div key={task.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 space-x-reverse mb-2">
                        <h4 className="font-semibold text-gray-900">{beneficiary?.name || 'مستفيد غير محدد'}</h4>
                        <Badge variant={getStatusColor(task.status)} size="sm">
                          {getStatusText(task.status)}
                        </Badge>
                        <span className="text-sm text-gray-500">#{task.trackingNumber}</span>
                      </div>
                      
                      <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                        <div>
                          <span className="font-medium">الطرد:</span> {packageInfo?.name || 'غير محدد'}
                        </div>
                        <div>
                          <span className="font-medium">المندوب:</span> {courier?.name || 'غير مُعيَّن'}
                        </div>
                        <div>
                          <span className="font-medium">المنطقة:</span> {beneficiary?.detailedAddress?.district || 'غير محددة'}
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">تاريخ الإنشاء:</span> {new Date(task.createdAt).toLocaleDateString('ar-SA')}
                        </div>
                        <div>
                          <span className="font-medium">آخر تحديث:</span> {new Date(task.updatedAt).toLocaleDateString('ar-SA')}
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2 space-x-reverse">
                      <Button variant="secondary" size="sm" onClick={() => handleViewTask(task)}>
                        عرض
                      </Button>
                      <Button variant="info" size="sm" onClick={() => handleUpdateTask(task)}>
                        تحديث
                      </Button>
                      {task.courierId && (
                        <Button variant="success" size="sm" onClick={() => handleTrackTask(task)}>
                          تتبع
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">لا توجد مهام مطابقة</p>
              <p className="text-sm mt-2">جرب تعديل معايير البحث أو الفلترة</p>
            </div>
          )}
        </div>
      </Card>

      {/* Task Details Modal */}
      {showModal && selectedTask && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={`تفاصيل المهمة #${trackingNumbers[selectedTask.id]}`}
          size="lg"
        >
          <div className="p-6">
            {/* Task Info */}
            <div className="bg-gray-50 p-4 rounded-xl mb-6">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center"><Package className="w-4 h-4 ml-2 text-gray-600" /> معلومات المهمة</h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">المستفيد:</span>
                  <span className="font-medium text-gray-900 mr-1">
                    {beneficiaries.find(b => b.id === selectedTask.beneficiaryId)?.name || 'غير محدد'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">الطرد:</span>
                  <span className="font-medium text-gray-900 mr-1">
                    {packages.find(p => p.id === selectedTask.packageId)?.name || 'غير محدد'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">الحالة:</span>
                  <Badge variant={getStatusColor(selectedTask.status)} size="sm" className="mr-1">
                    {getStatusText(selectedTask.status)}
                  </Badge>
                </div>
                <div>
                  <span className="text-gray-600">الأولوية:</span>
                  <Badge variant={selectedTask.priority === 'high' ? 'error' : selectedTask.priority === 'medium' ? 'warning' : 'neutral'} size="sm" className="mr-1">
                    {selectedTask.priority === 'high' ? 'عالية' : selectedTask.priority === 'medium' ? 'متوسطة' : 'منخفضة'}
                  </Badge>
                </div>
                <div>
                  <span className="text-gray-600">تاريخ الإنشاء:</span>
                  <span className="font-medium text-gray-900 mr-1">
                    {new Date(selectedTask.createdAt).toLocaleDateString('ar-SA')}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">آخر تحديث:</span>
                  <span className="font-medium text-gray-900 mr-1">
                    {new Date(selectedTask.updatedAt).toLocaleDateString('ar-SA')}
                  </span>
                </div>
              </div>
            </div>

            {/* View Mode */}
            {modalType === 'view' && (
              <div className="space-y-4">
                {/* Beneficiary Details */}
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <h5 className="font-medium text-blue-800 mb-3 flex items-center"><User className="w-4 h-4 ml-2" /> تفاصيل المستفيد</h5>
                  {(() => {
                    const beneficiary = beneficiaries.find(b => b.id === selectedTask.beneficiaryId);
                    return beneficiary ? (
                      <div className="grid md:grid-cols-2 gap-2 text-sm">
                        <div><span className="text-blue-700">الاسم الكامل:</span> <span className="font-medium text-blue-900">{beneficiary.fullName}</span></div>
                        <div><span className="text-blue-700">رقم الهوية:</span> <span className="font-medium text-blue-900">{beneficiary.nationalId}</span></div>
                        <div><span className="text-blue-700">الهاتف:</span> <span className="font-medium text-blue-900">{beneficiary.phone}</span></div>
                        <div><span className="text-blue-700">العنوان:</span> <span className="font-medium text-blue-900">{beneficiary.detailedAddress.district} - {beneficiary.detailedAddress.street}</span></div>
                      </div>
                    ) : <p className="text-gray-500">معلومات المستفيد غير متاحة</p>;
                  })()}
                </div>

                {/* Package Details */}
                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                  <h5 className="font-medium text-green-800 mb-3 flex items-center"><Package className="w-4 h-4 ml-2" /> تفاصيل الطرد</h5>
                  {(() => {
                    const packageInfo = packages.find(p => p.id === selectedTask.packageId);
                    return packageInfo ? (
                      <div className="grid md:grid-cols-2 gap-2 text-sm">
                        <div><span className="text-green-700">اسم الطرد:</span> <span className="font-medium text-green-900">{packageInfo.name}</span></div>
                        <div><span className="text-green-700">النوع:</span> <span className="font-medium text-green-900">{packageInfo.type}</span></div>
                        <div><span className="text-green-700">القيمة:</span> <span className="font-medium text-green-900">{packageInfo.value} ₪</span></div>
                        <div><span className="text-green-700">الممول:</span> <span className="font-medium text-green-900">{packageInfo.funder}</span></div>
                      </div>
                    ) : <p className="text-gray-500">معلومات الطرد غير متاحة</p>;
                  })()}
                </div>

                {/* Courier Details */}
                {selectedTask.courierId && (
                  <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                    <h5 className="font-medium text-purple-800 mb-3 flex items-center"><Truck className="w-4 h-4 ml-2" /> تفاصيل المندوب</h5>
                    {(() => {
                      const courier = couriers.find(c => c.id === selectedTask.courierId);
                      return courier ? (
                        <div className="grid md:grid-cols-2 gap-2 text-sm">
                          <div><span className="text-purple-700">الاسم:</span> <span className="font-medium text-purple-900">{courier.name}</span></div>
                          <div><span className="text-purple-700">الهاتف:</span> <span className="font-medium text-purple-900">{courier.phone}</span></div>
                          <div><span className="text-purple-700">التقييم:</span> <span className="font-medium text-purple-900">{courier.rating} <Star className="w-3 h-3 inline text-yellow-400" /></span></div>
                          <div><span className="text-purple-700">المهام المكتملة:</span> <span className="font-medium text-purple-900">{courier.completedTasks}</span></div>
                        </div>
                      ) : <p className="text-gray-500">معلومات المندوب غير متاحة</p>;
                    })()}
                  </div>
                )}

                {/* Additional Notes and Proofs */}
                {(selectedTask.notes || selectedTask.courierNotes || selectedTask.deliveryProofImageUrl || selectedTask.digitalSignatureImageUrl || selectedTask.failureReason) && (
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <h5 className="font-medium text-gray-800 mb-3 flex items-center"><FileText className="w-4 h-4 ml-2" /> ملاحظات وإثباتات</h5>
                    <div className="space-y-2 text-sm">
                      {selectedTask.notes && (
                        <div>
                          <span className="text-gray-700">ملاحظات المهمة:</span>
                          <p className="text-gray-900 mt-1">{selectedTask.notes}</p>
                        </div>
                      )}
                      {selectedTask.courierNotes && (
                        <div>
                          <span className="text-gray-700">ملاحظات المندوب:</span>
                          <p className="text-gray-900 mt-1">{selectedTask.courierNotes}</p>
                        </div>
                      )}
                      {selectedTask.failureReason && (
                        <div>
                          <span className="text-gray-700">سبب الفشل:</span>
                          <p className="text-red-600 mt-1">{selectedTask.failureReason}</p>
                        </div>
                      )}
                      {selectedTask.deliveryProofImageUrl && (
                        <div>
                          <span className="text-gray-700">صورة إثبات التسليم:</span>
                          <a href={selectedTask.deliveryProofImageUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline mr-2">عرض الصورة</a>
                        </div>
                      )}
                      {selectedTask.digitalSignatureImageUrl && (
                        <div>
                          <span className="text-gray-700">صورة التوقيع الرقمي:</span>
                          <a href={selectedTask.digitalSignatureImageUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline mr-2">عرض الصورة</a>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedTask.estimatedArrivalTime && (
                  <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                    <h5 className="font-medium text-yellow-800 mb-2 flex items-center"><Clock className="w-4 h-4 ml-2" /> الوقت المتوقع</h5>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-yellow-700">وقت الوصول المتوقع:</span>
                        <span className="font-medium text-yellow-900 mr-2">
                          {new Date(selectedTask.estimatedArrivalTime).toLocaleString('ar-SA')}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-4">
                  <Button variant="primary" onClick={() => setShowModal(false)}>
                    إغلاق
                  </Button>
                </div>
              </div>
            )}

            {/* Update Mode */}
            {modalType === 'update' && (
              <div className="space-y-4">
                <div className="bg-orange-50 p-4 rounded-xl">
                  <h5 className="font-medium text-orange-800 mb-2">تحديث حالة المهمة</h5>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="pending">في الانتظار</option>
                    <option value="in_progress">قيد التنفيذ</option>
                    <option value="delivered">تم التسليم</option>
                    <option value="problem">مشكلة</option>
                    <option value="rescheduled">إعادة جدولة</option>
                  </select>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl">
                  <h5 className="font-medium text-gray-800 mb-2">ملاحظات إضافية</h5>
                  <textarea 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="أضف ملاحظات حول التحديث..."
                  />
                </div>

                <div className="flex space-x-3 space-x-reverse justify-end pt-4">
                  <Button variant="secondary" onClick={() => setShowModal(false)}>
                    إلغاء
                  </Button>
                  <Button variant="primary" onClick={() => {
                    setNotification({ message: 'تم تحديث المهمة بنجاح', type: 'success' });
                    setTimeout(() => setNotification(null), 3000);
                    setShowModal(false);
                  }}>
                    حفظ التحديث
                  </Button>
                </div>
              </div>
            )}

            {/* Track Mode */}
            {modalType === 'track' && (
              <div className="space-y-6">
                {selectedCourier && (
                  <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                    <h5 className="font-medium text-purple-800 mb-3 flex items-center"><Truck className="w-4 h-4 ml-2" /> معلومات المندوب</h5>
                    <div className="grid md:grid-cols-2 gap-2 text-sm">
                      <div><span className="text-purple-700">الاسم:</span> <span className="font-medium text-purple-900">{selectedCourier.name}</span></div>
                      <div><span className="text-purple-700">الهاتف:</span> <span className="font-medium text-purple-900">{selectedCourier.phone}</span></div>
                      <div><span className="text-purple-700">التقييم:</span> <span className="font-medium text-purple-900">{selectedCourier.rating} <Star className="w-3 h-3 inline text-yellow-400" /></span></div>
                      <div><span className="text-purple-700">المهام المكتملة:</span> <span className="font-medium text-purple-900">{selectedCourier.completedTasks}</span></div>
                      <div><span className="text-purple-700">الحالة:</span> <Badge variant={selectedCourier.status === 'active' ? 'success' : selectedCourier.status === 'busy' ? 'warning' : 'neutral'} size="sm">{getStatusText(selectedCourier.status)}</Badge></div>
                      <div><span className="text-purple-700">معتمد:</span> <Badge variant={selectedCourier.isHumanitarianApproved ? 'success' : 'neutral'} size="sm">{selectedCourier.isHumanitarianApproved ? 'نعم' : 'لا'}</Badge></div>
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <h5 className="font-medium text-gray-800 mb-3 flex items-center"><MapPin className="w-4 h-4 ml-2" /> تتبع الموقع (محاكاة)</h5>
                  {selectedCourier && selectedCourier.currentLocation && selectedTask && selectedTask.beneficiaryId ? (
                    <div className="space-y-4">
                      <GazaMap
                        points={[
                          {
                            id: 'courier-location',
                            lat: simulatedCourierLocation?.lat || selectedCourier.currentLocation.lat,
                            lng: simulatedCourierLocation?.lng || selectedCourier.currentLocation.lng,
                            status: 'active', // Custom status for courier
                            title: `موقع المندوب: ${selectedCourier.name}`,
                            description: `الحالة: ${getStatusText(selectedCourier.status)}`,
                            data: {} as Beneficiary // Dummy data
                          },
                          {
                            id: 'beneficiary-location',
                            lat: beneficiaries.find(b => b.id === selectedTask.beneficiaryId)?.location?.lat || 0,
                            lng: beneficiaries.find(b => b.id === selectedTask.beneficiaryId)?.location?.lng || 0,
                            status: 'pending', // Status for beneficiary's task
                            title: `موقع المستفيد: ${beneficiaries.find(b => b.id === selectedTask.beneficiaryId)?.name}`,
                            description: `المهمة: ${packages.find(p => p.id === selectedTask.packageId)?.name}`,
                            data: {} as Beneficiary // Dummy data
                          }
                        ].filter(p => p.lat !== 0 && p.lng !== 0) as MapPoint[]} // Filter out invalid points
                        onPointClick={() => {}} // No action on click for this map
                        className="h-64"
                      />
                      <div className="flex justify-center">
                        <Button variant="secondary" onClick={simulateCourierMovement} icon={RefreshCw} iconPosition="right">
                          محاكاة حركة المندوب
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>لا تتوفر بيانات تتبع لهذا المندوب أو المستفيد.</p>
                      <p className="text-sm mt-2">تأكد من تعيين المندوب وتوفر بيانات الموقع.</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-4">
                  <Button variant="primary" onClick={() => {
                    setShowModal(false);
                    setSimulatedCourierLocation(null); // Reset simulated location on close
                  }}>
                    إغلاق
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
          data={filteredTasks}
          title="مهام التتبع"
          defaultFilename={`مهام_التتبع_${new Date().toISOString().split('T')[0]}`}
          availableFields={[
            { key: 'trackingNumber', label: 'رقم التتبع' },
            { key: 'status', label: 'الحالة' },
            { key: 'priority', label: 'الأولوية' },
            { key: 'beneficiaryId', label: 'المستفيد' },
            { key: 'packageId', label: 'الطرد' },
            { key: 'courierId', label: 'المندوب' },
            { key: 'createdAt', label: 'تاريخ الإنشاء' },
            { key: 'updatedAt', label: 'آخر تحديث' },
            { key: 'notes', label: 'الملاحظات' }
          ]}
          filters={{ searchTerm, statusFilter }}
        />
      )}

      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3 space-x-reverse">
          <MapPin className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-blue-800 mb-3">إرشادات التتبع</h4>
            <ul className="text-sm text-blue-700 space-y-2">
              <li className="flex items-start space-x-2 space-x-reverse">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>انقر على النقاط في الخريطة لعرض تفاصيل المهمة</span>
              </li>
              <li className="flex items-start space-x-2 space-x-reverse">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>استخدم الفلاتر لتضييق نطاق البحث</span>
              </li>
              <li className="flex items-start space-x-2 space-x-reverse">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>يمكن تتبع المندوبين المعينين للمهام في الوقت الفعلي</span>
              </li>
              <li className="flex items-start space-x-2 space-x-reverse">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>تحديث حالة المهام يساعد في تحسين دقة التتبع</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}