import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Calendar, 
  Download, 
  Filter, 
  TrendingUp, 
  Users, 
  Package, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Star, 
  Award, 
  MapPin, 
  Activity, 
  PieChart, 
  LineChart, 
  Truck,
  Settings,
  RefreshCw,
  Eye,
  Plus,
  Edit,
  Trash2,
  Send,
  Mail,
  Bell
} from 'lucide-react';
import { 
  mockTasks, 
  mockBeneficiaries, 
  mockPackages, 
  mockCouriers, 
  mockOrganizations,
  calculateStats 
} from '../../data/mockData';
import { useErrorLogger } from '../../utils/errorLogger';
import { useExport } from '../../utils/exportUtils';
import { Button, Card, Input, Badge, Modal, ExportModal } from '../ui';

interface ScheduledReport {
  id: string;
  name: string;
  type: 'performance' | 'distribution' | 'beneficiaries' | 'organizations' | 'comprehensive';
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  recipients: string[];
  format: 'pdf' | 'excel' | 'csv';
  isActive: boolean;
  lastGenerated?: string;
  nextGeneration: string;
  createdBy: string;
  createdAt: string;
}

export default function AdvancedReportsPage() {
  const { logInfo, logError } = useErrorLogger();
  const { exportData } = useExport();
  
  const [activeTab, setActiveTab] = useState('analytics');
  const [dateRange, setDateRange] = useState('month');
  const [reportType, setReportType] = useState('overview');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'schedule' | 'edit-schedule' | 'view-report'>('schedule');
  const [selectedReport, setSelectedReport] = useState<ScheduledReport | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  // Mock scheduled reports
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([
    {
      id: 'report-1',
      name: 'تقرير الأداء الأسبوعي',
      type: 'performance',
      frequency: 'weekly',
      recipients: ['admin@humanitarian.ps', 'manager@humanitarian.ps'],
      format: 'pdf',
      isActive: true,
      lastGenerated: '2024-12-21T10:00:00',
      nextGeneration: '2024-12-28T10:00:00',
      createdBy: 'أحمد الإدمن',
      createdAt: '2024-01-15'
    },
    {
      id: 'report-2',
      name: 'تقرير التوزيع الشهري',
      type: 'distribution',
      frequency: 'monthly',
      recipients: ['director@humanitarian.ps'],
      format: 'excel',
      isActive: true,
      lastGenerated: '2024-12-01T09:00:00',
      nextGeneration: '2025-01-01T09:00:00',
      createdBy: 'فاطمة المشرفة',
      createdAt: '2024-02-01'
    },
    {
      id: 'report-3',
      name: 'تقرير المستفيدين اليومي',
      type: 'beneficiaries',
      frequency: 'daily',
      recipients: ['supervisor@humanitarian.ps'],
      format: 'csv',
      isActive: false,
      lastGenerated: '2024-12-20T08:00:00',
      nextGeneration: '2024-12-22T08:00:00',
      createdBy: 'سارة المنسقة',
      createdAt: '2024-03-01'
    }
  ]);

  const [reportForm, setReportForm] = useState({
    name: '',
    type: 'performance' as ScheduledReport['type'],
    frequency: 'weekly' as ScheduledReport['frequency'],
    recipients: [''],
    format: 'pdf' as ScheduledReport['format'],
    isActive: true
  });

  const stats = calculateStats();
  
  const tabs = [
    { id: 'analytics', name: 'التحليلات المتقدمة', icon: BarChart3 },
    { id: 'scheduled', name: 'التقارير المجدولة', icon: Calendar },
    { id: 'custom', name: 'تقارير مخصصة', icon: Settings },
    { id: 'templates', name: 'قوالب التقارير', icon: FileText }
  ];

  const reportTypes = [
    { id: 'overview', name: 'نظرة عامة', icon: BarChart3, color: 'blue' },
    { id: 'performance', name: 'تقرير الأداء', icon: TrendingUp, color: 'green' },
    { id: 'distribution', name: 'تقرير التوزيع', icon: Truck, color: 'orange' },
    { id: 'beneficiaries', name: 'تقرير المستفيدين', icon: Users, color: 'purple' },
    { id: 'geographical', name: 'التوزيع الجغرافي', icon: MapPin, color: 'red' }
  ];

  const regions = [
    { id: 'all', name: 'جميع المناطق' },
    { id: 'north', name: 'شمال غزة' },
    { id: 'gaza', name: 'مدينة غزة' },
    { id: 'middle', name: 'الوسط' },
    { id: 'khan-younis', name: 'خان يونس' },
    { id: 'rafah', name: 'رفح' }
  ];

  // Advanced analytics data
  const analyticsData = useMemo(() => {
    return {
      deliveryTrends: [
        { month: 'يناير', delivered: 1247, failed: 45, pending: 89 },
        { month: 'فبراير', delivered: 1356, failed: 32, pending: 67 },
        { month: 'مارس', delivered: 1489, failed: 28, pending: 78 },
        { month: 'أبريل', delivered: 1567, failed: 23, pending: 56 },
        { month: 'مايو', delivered: 1634, failed: 19, pending: 45 }
      ],
      regionPerformance: [
        { region: 'خان يونس', delivered: 456, successRate: 92.3, avgTime: 2.1 },
        { region: 'غزة', delivered: 389, successRate: 88.7, avgTime: 2.4 },
        { region: 'الوسط', delivered: 234, successRate: 85.2, avgTime: 2.8 },
        { region: 'شمال غزة', delivered: 298, successRate: 79.5, avgTime: 3.2 },
        { region: 'رفح', delivered: 167, successRate: 76.8, avgTime: 3.5 }
      ],
      packageTypes: [
        { type: 'مواد غذائية', count: 987, percentage: 65, trend: '+12%' },
        { type: 'أدوية', count: 304, percentage: 20, trend: '+8%' },
        { type: 'ملابس', count: 152, percentage: 10, trend: '-3%' },
        { type: 'أخرى', count: 76, percentage: 5, trend: '+5%' }
      ],
      courierPerformance: mockCouriers.map(courier => ({
        name: courier.name,
        delivered: courier.completedTasks,
        rating: courier.rating,
        efficiency: 85 + Math.random() * 15
      }))
    };
  }, []);

  const handleScheduleReport = () => {
    setModalType('schedule');
    setReportForm({
      name: '',
      type: 'performance',
      frequency: 'weekly',
      recipients: [''],
      format: 'pdf',
      isActive: true
    });
    setShowModal(true);
  };

  const handleEditScheduledReport = (report: ScheduledReport) => {
    setModalType('edit-schedule');
    setSelectedReport(report);
    setReportForm({
      name: report.name,
      type: report.type,
      frequency: report.frequency,
      recipients: report.recipients,
      format: report.format,
      isActive: report.isActive
    });
    setShowModal(true);
  };

  const handleSaveScheduledReport = () => {
    if (!reportForm.name.trim()) {
      setNotification({ message: 'يرجى إدخال اسم التقرير', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    try {
      if (modalType === 'schedule') {
        const newReport: ScheduledReport = {
          id: `report-${Date.now()}`,
          name: reportForm.name,
          type: reportForm.type,
          frequency: reportForm.frequency,
          recipients: reportForm.recipients.filter(r => r.trim()),
          format: reportForm.format,
          isActive: reportForm.isActive,
          nextGeneration: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          createdBy: 'أحمد الإدمن',
          createdAt: new Date().toISOString()
        };
        setScheduledReports(prev => [newReport, ...prev]);
        setNotification({ message: 'تم جدولة التقرير بنجاح', type: 'success' });
        logInfo(`تم جدولة تقرير جديد: ${newReport.name}`, 'AdvancedReportsPage');
      } else if (modalType === 'edit-schedule' && selectedReport) {
        setScheduledReports(prev => 
          prev.map(report => 
            report.id === selectedReport.id 
              ? { ...report, ...reportForm }
              : report
          )
        );
        setNotification({ message: 'تم تحديث التقرير المجدول بنجاح', type: 'success' });
        logInfo(`تم تحديث التقرير المجدول: ${reportForm.name}`, 'AdvancedReportsPage');
      }
      
      setTimeout(() => setNotification(null), 3000);
      setShowModal(false);
      setSelectedReport(null);
    } catch (error) {
      logError(error as Error, 'AdvancedReportsPage');
      setNotification({ message: 'حدث خطأ في حفظ التقرير', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleDeleteScheduledReport = (report: ScheduledReport) => {
    if (confirm(`هل أنت متأكد من حذف التقرير المجدول "${report.name}"؟`)) {
      setScheduledReports(prev => prev.filter(r => r.id !== report.id));
      setNotification({ message: `تم حذف التقرير "${report.name}"`, type: 'warning' });
      setTimeout(() => setNotification(null), 3000);
      logInfo(`تم حذف التقرير المجدول: ${report.name}`, 'AdvancedReportsPage');
    }
  };

  const handleToggleReport = (reportId: string) => {
    setScheduledReports(prev => 
      prev.map(report => 
        report.id === reportId 
          ? { ...report, isActive: !report.isActive }
          : report
      )
    );
    
    const report = scheduledReports.find(r => r.id === reportId);
    const action = report?.isActive ? 'إيقاف' : 'تفعيل';
    setNotification({ message: `تم ${action} التقرير "${report?.name}"`, type: 'success' });
    setTimeout(() => setNotification(null), 3000);
  };

  const getFrequencyText = (frequency: string) => {
    switch (frequency) {
      case 'daily': return 'يومي';
      case 'weekly': return 'أسبوعي';
      case 'monthly': return 'شهري';
      case 'quarterly': return 'ربع سنوي';
      default: return frequency;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'performance': return 'تقرير الأداء';
      case 'distribution': return 'تقرير التوزيع';
      case 'beneficiaries': return 'تقرير المستفيدين';
      case 'organizations': return 'تقرير المؤسسات';
      case 'comprehensive': return 'تقرير شامل';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-3 space-x-reverse ${
          notification.type === 'success' ? 'bg-green-100 border-green-200 text-green-800' :
          notification.type === 'error' ? 'bg-red-100 border-red-200 text-red-800' :
          'bg-orange-100 border-orange-200 text-orange-800'
        }`}>
          {notification.type === 'success' ? <CheckCircle className="w-5 h-5 text-green-600" /> :
           notification.type === 'error' ? <AlertTriangle className="w-5 h-5 text-red-600" /> :
           <Clock className="w-5 h-5 text-orange-600" />}
          <span className="font-medium">{notification.message}</span>
          <button onClick={() => setNotification(null)} className="text-gray-500 hover:text-gray-700">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">التقارير المتقدمة والتحليلات</h1>
            <p className="text-gray-600 mt-1">تحليلات شاملة وتقارير مجدولة لمراقبة الأداء</p>
          </div>
          <div className="flex space-x-3 space-x-reverse">
            <Button variant="success" icon={Download} iconPosition="right" onClick={() => setShowExportModal(true)}>
              تصدير شامل
            </Button>
            <Button variant="primary" icon={Plus} iconPosition="right" onClick={handleScheduleReport}>
              جدولة تقرير جديد
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 space-x-reverse">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 space-x-reverse px-4 py-3 rounded-lg font-medium text-sm transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-blue-50">
              <div className="text-center">
                <div className="bg-blue-100 p-3 rounded-xl mb-2">
                  <TrendingUp className="w-6 h-6 text-blue-600 mx-auto" />
                </div>
                <p className="text-sm text-blue-600">معدل التسليم</p>
                <p className="text-2xl font-bold text-blue-900">{stats.deliveryRate}%</p>
                <p className="text-xs text-green-600 mt-1">+5% من الشهر الماضي</p>
              </div>
            </Card>

            <Card className="bg-green-50">
              <div className="text-center">
                <div className="bg-green-100 p-3 rounded-xl mb-2">
                  <Clock className="w-6 h-6 text-green-600 mx-auto" />
                </div>
                <p className="text-sm text-green-600">متوسط وقت التسليم</p>
                <p className="text-2xl font-bold text-green-900">2.3</p>
                <p className="text-xs text-gray-600 mt-1">ساعة</p>
              </div>
            </Card>

            <Card className="bg-orange-50">
              <div className="text-center">
                <div className="bg-orange-100 p-3 rounded-xl mb-2">
                  <Star className="w-6 h-6 text-orange-600 mx-auto" />
                </div>
                <p className="text-sm text-orange-600">رضا المستفيدين</p>
                <p className="text-2xl font-bold text-orange-900">4.7</p>
                <p className="text-xs text-gray-600 mt-1">من 5 نجوم</p>
              </div>
            </Card>

            <Card className="bg-purple-50">
              <div className="text-center">
                <div className="bg-purple-100 p-3 rounded-xl mb-2">
                  <Package className="w-6 h-6 text-purple-600 mx-auto" />
                </div>
                <p className="text-sm text-purple-600">التكلفة لكل طرد</p>
                <p className="text-2xl font-bold text-purple-900">45</p>
                <p className="text-xs text-gray-600 mt-1">شيكل</p>
              </div>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Delivery Trends */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">اتجاهات التسليم</h3>
              <div className="space-y-4">
                {analyticsData.deliveryTrends.map((month) => {
                  const total = month.delivered + month.failed + month.pending;
                  const successRate = ((month.delivered / total) * 100).toFixed(1);
                  
                  return (
                    <div key={month.month} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-900">{month.month}</span>
                        <div className="text-right">
                          <span className="text-lg font-bold text-gray-900">{month.delivered}</span>
                          <div className="text-xs text-green-600">{successRate}% نجاح</div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="flex h-3 rounded-full overflow-hidden">
                          <div 
                            className="bg-green-500" 
                            style={{ width: `${(month.delivered / total) * 100}%` }}
                          ></div>
                          <div 
                            className="bg-blue-500" 
                            style={{ width: `${(month.pending / total) * 100}%` }}
                          ></div>
                          <div 
                            className="bg-red-500" 
                            style={{ width: `${(month.failed / total) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Regional Performance */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">الأداء الإقليمي</h3>
              <div className="space-y-4">
                {analyticsData.regionPerformance.map((region) => (
                  <div key={region.region} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{region.region}</p>
                      <p className="text-sm text-gray-600">{region.delivered} طرد</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">{region.successRate}%</div>
                      <div className="text-xs text-gray-500">{region.avgTime} ساعة</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Scheduled Reports Tab */}
      {activeTab === 'scheduled' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">التقارير المجدولة</h3>
            <Button variant="primary" icon={Plus} iconPosition="right" onClick={handleScheduleReport}>
              جدولة تقرير جديد
            </Button>
          </div>

          {/* Scheduled Reports List */}
          <div className="grid gap-4">
            {scheduledReports.map((report) => (
              <Card key={report.id}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <div className="bg-blue-100 p-3 rounded-xl">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 space-x-reverse mb-1">
                        <h4 className="font-semibold text-gray-900">{report.name}</h4>
                        <Badge variant={report.isActive ? 'success' : 'neutral'} size="sm">
                          {report.isActive ? 'نشط' : 'معطل'}
                        </Badge>
                        <Badge variant="info" size="sm">
                          {getTypeText(report.type)}
                        </Badge>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <span>التكرار:</span>
                          <span className="font-medium text-gray-900 mr-1">{getFrequencyText(report.frequency)}</span>
                        </div>
                        <div>
                          <span>الصيغة:</span>
                          <span className="font-medium text-gray-900 mr-1">{report.format.toUpperCase()}</span>
                        </div>
                        <div>
                          <span>المستلمين:</span>
                          <span className="font-medium text-gray-900 mr-1">{report.recipients.length}</span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        آخر توليد: {report.lastGenerated ? new Date(report.lastGenerated).toLocaleDateString('ar-SA') : 'لم يتم بعد'} | 
                        التوليد التالي: {new Date(report.nextGeneration).toLocaleDateString('ar-SA')}
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2 space-x-reverse">
                    <Button variant="secondary" size="sm" onClick={() => handleEditScheduledReport(report)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant={report.isActive ? 'warning' : 'success'} 
                      size="sm" 
                      onClick={() => handleToggleReport(report.id)}
                    >
                      {report.isActive ? <Clock className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDeleteScheduledReport(report)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Custom Reports Tab */}
      {activeTab === 'custom' && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-gray-900">إنشاء تقرير مخصص</h3>
          
          {/* Report Builder */}
          <Card>
            <h4 className="font-semibold text-gray-900 mb-4">منشئ التقارير</h4>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">نوع التقرير</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {reportTypes.map((type) => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الفترة الزمنية</label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="today">اليوم</option>
                  <option value="week">هذا الأسبوع</option>
                  <option value="month">هذا الشهر</option>
                  <option value="quarter">هذا الربع</option>
                  <option value="year">هذا العام</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">المنطقة</label>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {regions.map(region => (
                    <option key={region.id} value={region.id}>{region.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <Button variant="primary" icon={BarChart3} iconPosition="right" fullWidth>
              إنشاء التقرير المخصص
            </Button>
          </Card>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">قوالب التقارير</h3>
            <Button variant="primary" icon={Plus} iconPosition="right">
              إضافة قالب جديد
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportTypes.map((type) => {
              const IconComponent = type.icon;
              return (
                <Card key={type.id} className="hover:shadow-lg transition-shadow">
                  <div className="text-center">
                    <div className={`bg-${type.color}-100 p-4 rounded-xl mb-4`}>
                      <IconComponent className={`w-8 h-8 text-${type.color}-600 mx-auto`} />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">{type.name}</h4>
                    <p className="text-sm text-gray-600 mb-4">قالب تقرير جاهز للاستخدام</p>
                    <Button variant="primary" size="sm" fullWidth>
                      استخدام القالب
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Schedule Report Modal */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={modalType === 'schedule' ? 'جدولة تقرير جديد' : 'تعديل التقرير المجدول'}
          size="lg"
        >
          <div className="p-6 space-y-6">
            <Input
              label="اسم التقرير *"
              type="text"
              value={reportForm.name}
              onChange={(e) => setReportForm({...reportForm, name: e.target.value})}
              placeholder="أدخل اسم التقرير..."
              required
            />

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">نوع التقرير</label>
                <select
                  value={reportForm.type}
                  onChange={(e) => setReportForm({...reportForm, type: e.target.value as ScheduledReport['type']})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="performance">تقرير الأداء</option>
                  <option value="distribution">تقرير التوزيع</option>
                  <option value="beneficiaries">تقرير المستفيدين</option>
                  <option value="organizations">تقرير المؤسسات</option>
                  <option value="comprehensive">تقرير شامل</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">تكرار التوليد</label>
                <select
                  value={reportForm.frequency}
                  onChange={(e) => setReportForm({...reportForm, frequency: e.target.value as ScheduledReport['frequency']})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="daily">يومي</option>
                  <option value="weekly">أسبوعي</option>
                  <option value="monthly">شهري</option>
                  <option value="quarterly">ربع سنوي</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">صيغة التقرير</label>
              <select
                value={reportForm.format}
                onChange={(e) => setReportForm({...reportForm, format: e.target.value as ScheduledReport['format']})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
                <option value="csv">CSV</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">المستلمين</label>
              <div className="space-y-2">
                {reportForm.recipients.map((recipient, index) => (
                  <div key={index} className="flex space-x-2 space-x-reverse">
                    <Input
                      type="email"
                      value={recipient}
                      onChange={(e) => {
                        const newRecipients = [...reportForm.recipients];
                        newRecipients[index] = e.target.value;
                        setReportForm({...reportForm, recipients: newRecipients});
                      }}
                      placeholder="أدخل البريد الإلكتروني..."
                      className="flex-1"
                    />
                    {reportForm.recipients.length > 1 && (
                      <Button 
                        variant="danger" 
                        size="sm"
                        onClick={() => {
                          const newRecipients = reportForm.recipients.filter((_, i) => i !== index);
                          setReportForm({...reportForm, recipients: newRecipients});
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => setReportForm({...reportForm, recipients: [...reportForm.recipients, '']})}
                >
                  <Plus className="w-4 h-4 ml-1" />
                  إضافة مستلم
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-2 space-x-reverse">
              <input
                type="checkbox"
                checked={reportForm.isActive}
                onChange={(e) => setReportForm({...reportForm, isActive: e.target.checked})}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label className="text-sm text-gray-700">تفعيل التقرير فور الإنشاء</label>
            </div>

            <div className="flex space-x-3 space-x-reverse justify-end pt-4">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                إلغاء
              </Button>
              <Button variant="primary" onClick={handleSaveScheduledReport}>
                {modalType === 'schedule' ? 'جدولة التقرير' : 'حفظ التغييرات'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          data={analyticsData.deliveryTrends}
          title="بيانات التحليلات المتقدمة"
          defaultFilename={`تحليلات_متقدمة_${new Date().toISOString().split('T')[0]}`}
          availableFields={[
            { key: 'month', label: 'الشهر' },
            { key: 'delivered', label: 'المسلم' },
            { key: 'failed', label: 'الفاشل' },
            { key: 'pending', label: 'المعلق' }
          ]}
          filters={{ dateRange, reportType, selectedRegion }}
        />
      )}
    </div>
  );
}