import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Download, 
  Calendar, 
  Filter, 
  BarChart3, 
  TrendingUp, 
  Users, 
  Package, 
  Truck, 
  MapPin, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Star,
  Award,
  Activity,
  Settings,
  RefreshCw,
  Eye,
  Plus,
  Edit,
  Send,
  Mail
} from 'lucide-react';
import { 
  mockTasks, 
  mockBeneficiaries, 
  mockPackages, 
  mockCouriers, 
  mockOrganizations,
  mockFamilies,
  calculateStats 
} from '../../data/mockData';
import { useErrorLogger } from '../../utils/errorLogger';
import { useExport } from '../../utils/exportUtils';
import { Button, Card, Input, Badge, Modal, ExportModal } from '../ui';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  sections: string[];
  format: 'pdf' | 'excel' | 'word';
  isDefault: boolean;
  createdBy: string;
  createdAt: string;
  usageCount: number;
}

export default function ComprehensiveReportsPage() {
  const { logInfo, logError } = useErrorLogger();
  const { exportData } = useExport();
  
  const [selectedTemplate, setSelectedTemplate] = useState('comprehensive');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [selectedRegions, setSelectedRegions] = useState<string[]>(['all']);
  const [selectedOrganizations, setSelectedOrganizations] = useState<string[]>(['all']);
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeRecommendations, setIncludeRecommendations] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'preview' | 'schedule' | 'template'>('preview');
  const [showExportModal, setShowExportModal] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  // Mock report templates
  const reportTemplates: ReportTemplate[] = [
    {
      id: 'comprehensive',
      name: 'التقرير الشامل',
      description: 'تقرير شامل يغطي جميع جوانب العمليات',
      sections: ['overview', 'beneficiaries', 'distribution', 'performance', 'recommendations'],
      format: 'pdf',
      isDefault: true,
      createdBy: 'النظام',
      createdAt: '2024-01-01',
      usageCount: 156
    },
    {
      id: 'executive',
      name: 'تقرير تنفيذي',
      description: 'ملخص تنفيذي للإدارة العليا',
      sections: ['overview', 'key-metrics', 'recommendations'],
      format: 'pdf',
      isDefault: true,
      createdBy: 'النظام',
      createdAt: '2024-01-01',
      usageCount: 89
    },
    {
      id: 'operational',
      name: 'تقرير العمليات',
      description: 'تقرير مفصل للعمليات اليومية',
      sections: ['distribution', 'tasks', 'couriers', 'issues'],
      format: 'excel',
      isDefault: true,
      createdBy: 'النظام',
      createdAt: '2024-01-01',
      usageCount: 234
    }
  ];

  const stats = calculateStats();
  const regions = ['شمال غزة', 'مدينة غزة', 'الوسط', 'خان يونس', 'رفح'];

  // Generate comprehensive report data
  const reportData = useMemo(() => {
    return {
      overview: {
        totalBeneficiaries: stats.totalBeneficiaries,
        totalPackages: stats.totalPackages,
        deliveredPackages: stats.deliveredPackages,
        deliveryRate: stats.deliveryRate,
        activeTasks: stats.activeTasks,
        criticalAlerts: stats.criticalAlerts
      },
      beneficiariesAnalysis: {
        byRegion: regions.map(region => ({
          region,
          count: Math.floor(Math.random() * 200) + 50,
          verified: Math.floor(Math.random() * 150) + 40,
          pending: Math.floor(Math.random() * 30) + 5
        })),
        byStatus: {
          active: mockBeneficiaries.filter(b => b.status === 'active').length,
          pending: mockBeneficiaries.filter(b => b.status === 'pending').length,
          suspended: mockBeneficiaries.filter(b => b.status === 'suspended').length
        }
      },
      distributionAnalysis: {
        byPackageType: [
          { type: 'مواد غذائية', count: 987, percentage: 65 },
          { type: 'أدوية', count: 304, percentage: 20 },
          { type: 'ملابس', count: 152, percentage: 10 },
          { type: 'أخرى', count: 76, percentage: 5 }
        ],
        monthlyTrends: [
          { month: 'يناير', delivered: 1247, failed: 45 },
          { month: 'فبراير', delivered: 1356, failed: 32 },
          { month: 'مارس', delivered: 1489, failed: 28 },
          { month: 'أبريل', delivered: 1567, failed: 23 },
          { month: 'مايو', delivered: 1634, failed: 19 }
        ]
      },
      performanceMetrics: {
        averageDeliveryTime: 2.3,
        customerSatisfaction: 4.7,
        costPerPackage: 45,
        courierEfficiency: 87.5
      },
      recommendations: [
        'زيادة عدد المندوبين في منطقة رفح لتحسين معدل التسليم',
        'تحديث قاعدة بيانات العناوين لتقليل حالات العناوين الخاطئة',
        'تدريب المندوبين على التعامل مع الحالات الصعبة',
        'تطوير تطبيق جوال للمندوبين لتحسين التتبع'
      ]
    };
  }, [stats]);

  const handleGenerateReport = async () => {
    try {
      setNotification({ message: 'جاري إنشاء التقرير الشامل...', type: 'info' });
      
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const reportContent = {
        metadata: {
          title: reportTemplates.find(t => t.id === selectedTemplate)?.name || 'تقرير شامل',
          generatedAt: new Date().toISOString(),
          dateRange: dateRange.from && dateRange.to ? `${dateRange.from} إلى ${dateRange.to}` : 'جميع البيانات',
          regions: selectedRegions.includes('all') ? 'جميع المناطق' : selectedRegions.join(', '),
          organizations: selectedOrganizations.includes('all') ? 'جميع المؤسسات' : selectedOrganizations.length
        },
        data: reportData
      };

      await exportData([reportContent], {
        format: 'json',
        filename: `تقرير_شامل_${new Date().toISOString().split('T')[0]}`
      });

      setNotification({ message: 'تم إنشاء التقرير الشامل بنجاح', type: 'success' });
      setTimeout(() => setNotification(null), 3000);
      logInfo('تم إنشاء تقرير شامل', 'ComprehensiveReportsPage');
    } catch (error) {
      logError(error as Error, 'ComprehensiveReportsPage');
      setNotification({ message: 'حدث خطأ في إنشاء التقرير', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handlePreviewReport = () => {
    setModalType('preview');
    setShowModal(true);
  };

  const handleScheduleReport = () => {
    setModalType('schedule');
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-3 space-x-reverse ${
          notification.type === 'success' ? 'bg-green-100 border-green-200 text-green-800' :
          notification.type === 'error' ? 'bg-red-100 border-red-200 text-red-800' :
          'bg-blue-100 border-blue-200 text-blue-800'
        }`}>
          {notification.type === 'success' ? <CheckCircle className="w-5 h-5 text-green-600" /> :
           notification.type === 'error' ? <AlertTriangle className="w-5 h-5 text-red-600" /> :
           <Clock className="w-5 h-5 text-blue-600" />}
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
            <h1 className="text-2xl font-bold text-gray-900">التقارير الشاملة</h1>
            <p className="text-gray-600 mt-1">إنشاء تقارير مفصلة وشاملة لجميع جوانب العمليات</p>
          </div>
          <div className="flex space-x-3 space-x-reverse">
            <Button variant="secondary" icon={Eye} iconPosition="right" onClick={handlePreviewReport}>
              معاينة التقرير
            </Button>
            <Button variant="info" icon={Calendar} iconPosition="right" onClick={handleScheduleReport}>
              جدولة التقرير
            </Button>
            <Button variant="primary" icon={Download} iconPosition="right" onClick={handleGenerateReport}>
              إنشاء التقرير
            </Button>
          </div>
        </div>
      </Card>

      {/* Report Configuration */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Template Selection */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">اختيار القالب</h3>
          <div className="space-y-3">
            {reportTemplates.map((template) => (
              <div
                key={template.id}
                onClick={() => setSelectedTemplate(template.id)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedTemplate === template.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{template.name}</h4>
                  {template.isDefault && (
                    <Badge variant="info" size="sm">افتراضي</Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                <div className="flex items-center space-x-2 space-x-reverse text-xs text-gray-500">
                  <span>{template.sections.length} أقسام</span>
                  <span>•</span>
                  <span>استُخدم {template.usageCount} مرة</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Filters and Options */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">خيارات التقرير</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الفترة الزمنية</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">المناطق</label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <input
                    type="checkbox"
                    checked={selectedRegions.includes('all')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRegions(['all']);
                      } else {
                        setSelectedRegions([]);
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label className="text-sm text-gray-700">جميع المناطق</label>
                </div>
                {regions.map(region => (
                  <div key={region} className="flex items-center space-x-2 space-x-reverse">
                    <input
                      type="checkbox"
                      checked={selectedRegions.includes(region)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRegions(prev => prev.filter(r => r !== 'all').concat(region));
                        } else {
                          setSelectedRegions(prev => prev.filter(r => r !== region));
                        }
                      }}
                      disabled={selectedRegions.includes('all')}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label className="text-sm text-gray-700">{region}</label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">المؤسسات</label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <input
                    type="checkbox"
                    checked={selectedOrganizations.includes('all')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedOrganizations(['all']);
                      } else {
                        setSelectedOrganizations([]);
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label className="text-sm text-gray-700">جميع المؤسسات</label>
                </div>
                {mockOrganizations.slice(0, 5).map(org => (
                  <div key={org.id} className="flex items-center space-x-2 space-x-reverse">
                    <input
                      type="checkbox"
                      checked={selectedOrganizations.includes(org.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedOrganizations(prev => prev.filter(o => o !== 'all').concat(org.id));
                        } else {
                          setSelectedOrganizations(prev => prev.filter(o => o !== org.id));
                        }
                      }}
                      disabled={selectedOrganizations.includes('all')}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label className="text-sm text-gray-700">{org.name}</label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2 space-x-reverse">
                <input
                  type="checkbox"
                  checked={includeCharts}
                  onChange={(e) => setIncludeCharts(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label className="text-sm text-gray-700">تضمين الرسوم البيانية</label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <input
                  type="checkbox"
                  checked={includeRecommendations}
                  onChange={(e) => setIncludeRecommendations(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label className="text-sm text-gray-700">تضمين التوصيات</label>
              </div>
            </div>
          </div>
        </Card>

        {/* Report Preview */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">معاينة التقرير</h3>
          
          <div className="space-y-4">
            {/* Overview Section */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-3">نظرة عامة</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">إجمالي المستفيدين:</span>
                  <span className="font-bold text-blue-900 mr-1">{reportData.overview.totalBeneficiaries}</span>
                </div>
                <div>
                  <span className="text-blue-700">إجمالي الطرود:</span>
                  <span className="font-bold text-blue-900 mr-1">{reportData.overview.totalPackages}</span>
                </div>
                <div>
                  <span className="text-blue-700">معدل التسليم:</span>
                  <span className="font-bold text-blue-900 mr-1">{reportData.overview.deliveryRate}%</span>
                </div>
                <div>
                  <span className="text-blue-700">المهام النشطة:</span>
                  <span className="font-bold text-blue-900 mr-1">{reportData.overview.activeTasks}</span>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-3">مؤشرات الأداء</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-green-700">متوسط وقت التسليم:</span>
                  <span className="font-bold text-green-900 mr-1">{reportData.performanceMetrics.averageDeliveryTime} ساعة</span>
                </div>
                <div>
                  <span className="text-green-700">رضا المستفيدين:</span>
                  <span className="font-bold text-green-900 mr-1">{reportData.performanceMetrics.customerSatisfaction}/5</span>
                </div>
                <div>
                  <span className="text-green-700">التكلفة لكل طرد:</span>
                  <span className="font-bold text-green-900 mr-1">{reportData.performanceMetrics.costPerPackage} ₪</span>
                </div>
                <div>
                  <span className="text-green-700">كفاءة المندوبين:</span>
                  <span className="font-bold text-green-900 mr-1">{reportData.performanceMetrics.courierEfficiency}%</span>
                </div>
              </div>
            </div>

            {includeRecommendations && (
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <h4 className="font-semibold text-orange-800 mb-3">التوصيات</h4>
                <ul className="space-y-2 text-sm text-orange-700">
                  {reportData.recommendations.slice(0, 3).map((recommendation, index) => (
                    <li key={index} className="flex items-start space-x-2 space-x-reverse">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Report Statistics */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="bg-blue-50">
          <div className="text-center">
            <div className="bg-blue-100 p-3 rounded-xl mb-2">
              <FileText className="w-6 h-6 text-blue-600 mx-auto" />
            </div>
            <p className="text-sm text-blue-600">تقارير مُنشأة</p>
            <p className="text-2xl font-bold text-blue-900">156</p>
            <p className="text-xs text-blue-700">هذا الشهر</p>
          </div>
        </Card>

        <Card className="bg-green-50">
          <div className="text-center">
            <div className="bg-green-100 p-3 rounded-xl mb-2">
              <Calendar className="w-6 h-6 text-green-600 mx-auto" />
            </div>
            <p className="text-sm text-green-600">تقارير مجدولة</p>
            <p className="text-2xl font-bold text-green-900">12</p>
            <p className="text-xs text-green-700">نشطة</p>
          </div>
        </Card>

        <Card className="bg-orange-50">
          <div className="text-center">
            <div className="bg-orange-100 p-3 rounded-xl mb-2">
              <Download className="w-6 h-6 text-orange-600 mx-auto" />
            </div>
            <p className="text-sm text-orange-600">تحميلات</p>
            <p className="text-2xl font-bold text-orange-900">1,247</p>
            <p className="text-xs text-orange-700">إجمالي</p>
          </div>
        </Card>

        <Card className="bg-purple-50">
          <div className="text-center">
            <div className="bg-purple-100 p-3 rounded-xl mb-2">
              <Star className="w-6 h-6 text-purple-600 mx-auto" />
            </div>
            <p className="text-sm text-purple-600">تقييم التقارير</p>
            <p className="text-2xl font-bold text-purple-900">4.8</p>
            <p className="text-xs text-purple-700">من 5 نجوم</p>
          </div>
        </Card>
      </div>

      {/* Recent Reports */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">التقارير الأخيرة</h3>
          <Button variant="secondary" icon={RefreshCw} iconPosition="right">
            تحديث القائمة
          </Button>
        </div>
        
        <div className="space-y-3">
          {[
            { name: 'التقرير الشامل - ديسمبر 2024', date: '2024-12-21', size: '2.3 MB', downloads: 45 },
            { name: 'تقرير الأداء الأسبوعي', date: '2024-12-20', size: '1.8 MB', downloads: 23 },
            { name: 'تقرير التوزيع الجغرافي', date: '2024-12-19', size: '3.1 MB', downloads: 67 },
            { name: 'تقرير المستفيدين الشهري', date: '2024-12-18', size: '1.5 MB', downloads: 34 }
          ].map((report, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{report.name}</p>
                  <p className="text-sm text-gray-600">{report.date} • {report.size}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <span className="text-sm text-gray-600">{report.downloads} تحميل</span>
                <Button variant="secondary" size="sm">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Modal for Preview/Schedule */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={
            modalType === 'preview' ? 'معاينة التقرير' :
            modalType === 'schedule' ? 'جدولة التقرير' :
            'قالب التقرير'
          }
          size="lg"
        >
          <div className="p-6">
            {modalType === 'preview' && (
              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h4 className="text-lg font-bold text-gray-900 mb-4">
                    {reportTemplates.find(t => t.id === selectedTemplate)?.name}
                  </h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-semibold text-gray-800 mb-3">الإحصائيات الرئيسية</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>إجمالي المستفيدين:</span>
                          <span className="font-bold">{reportData.overview.totalBeneficiaries}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>معدل التسليم:</span>
                          <span className="font-bold text-green-600">{reportData.overview.deliveryRate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>متوسط وقت التسليم:</span>
                          <span className="font-bold">{reportData.performanceMetrics.averageDeliveryTime} ساعة</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-800 mb-3">التوزيع الجغرافي</h5>
                      <div className="space-y-2 text-sm">
                        {reportData.beneficiariesAnalysis.byRegion.slice(0, 3).map(region => (
                          <div key={region.region} className="flex justify-between">
                            <span>{region.region}:</span>
                            <span className="font-bold">{region.count} مستفيد</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 space-x-reverse justify-end">
                  <Button variant="secondary" onClick={() => setShowModal(false)}>
                    إغلاق
                  </Button>
                  <Button variant="primary" onClick={handleGenerateReport}>
                    إنشاء التقرير الكامل
                  </Button>
                </div>
              </div>
            )}

            {modalType === 'schedule' && (
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-blue-800 mb-2">جدولة التقرير التلقائي</h4>
                  <p className="text-blue-700 text-sm">سيتم إنشاء وإرسال التقرير تلقائياً حسب الجدولة المحددة</p>
                </div>

                <Input
                  label="اسم الجدولة"
                  type="text"
                  placeholder="أدخل اسم للجدولة..."
                />

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">التكرار</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="daily">يومي</option>
                      <option value="weekly">أسبوعي</option>
                      <option value="monthly">شهري</option>
                      <option value="quarterly">ربع سنوي</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">وقت الإرسال</label>
                    <input
                      type="time"
                      defaultValue="09:00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">المستلمين</label>
                  <div className="space-y-2">
                    <Input
                      type="email"
                      placeholder="أدخل البريد الإلكتروني..."
                    />
                    <Button variant="secondary" size="sm">
                      <Plus className="w-4 h-4 ml-1" />
                      إضافة مستلم آخر
                    </Button>
                  </div>
                </div>

                <div className="flex space-x-3 space-x-reverse justify-end">
                  <Button variant="secondary" onClick={() => setShowModal(false)}>
                    إلغاء
                  </Button>
                  <Button variant="primary" onClick={() => {
                    setNotification({ message: 'تم جدولة التقرير بنجاح', type: 'success' });
                    setTimeout(() => setNotification(null), 3000);
                    setShowModal(false);
                  }}>
                    جدولة التقرير
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
          data={[reportData]}
          title="التقرير الشامل"
          defaultFilename={`التقرير_الشامل_${new Date().toISOString().split('T')[0]}`}
          availableFields={[
            { key: 'overview', label: 'نظرة عامة' },
            { key: 'beneficiariesAnalysis', label: 'تحليل المستفيدين' },
            { key: 'distributionAnalysis', label: 'تحليل التوزيع' },
            { key: 'performanceMetrics', label: 'مؤشرات الأداء' },
            { key: 'recommendations', label: 'التوصيات' }
          ]}
          filters={{ selectedTemplate, dateRange, selectedRegions, selectedOrganizations }}
        />
      )}

      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3 space-x-reverse">
          <FileText className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-blue-800 mb-3">إرشادات التقارير الشاملة</h4>
            <ul className="text-sm text-blue-700 space-y-2">
              <li className="flex items-start space-x-2 space-x-reverse">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>اختر القالب المناسب حسب الجمهور المستهدف (تنفيذي، تشغيلي، شامل)</span>
              </li>
              <li className="flex items-start space-x-2 space-x-reverse">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>حدد الفترة الزمنية والمناطق للحصول على بيانات دقيقة</span>
              </li>
              <li className="flex items-start space-x-2 space-x-reverse">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>استخدم المعاينة للتأكد من محتوى التقرير قبل الإنشاء</span>
              </li>
              <li className="flex items-start space-x-2 space-x-reverse">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>يمكن جدولة التقارير للإرسال التلقائي للمستلمين المحددين</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}