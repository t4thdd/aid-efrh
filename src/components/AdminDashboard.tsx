import React, { useState } from 'react';
import { 
  BarChart3, 
  Users, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  MapPin, 
  TrendingUp, 
  Activity, 
  Bell, 
  Shield, 
  Settings, 
  FileText, 
  Database,
  Calendar,
  Download,
  RefreshCw,
  Eye,
  Plus,
  MessageSquare,
  Mail,
  Phone,
  Building2,
  Send
} from 'lucide-react';
import { calculateStats, mockBeneficiaries, mockPackages, mockTasks, mockCouriers, mockAlerts } from '../data/mockData';
import { useAlerts } from '../context/AlertsContext';
import { useErrorLogger } from '../utils/errorLogger';
import GazaMap, { type MapPoint } from './GazaMap';
import BeneficiaryDetailsModal from './BeneficiaryDetailsModal';
import { Button, Card, Badge } from './ui';

// Import pages
import UserManagementPage from './pages/UserManagementPage';
import BeneficiariesListPage from './pages/BeneficiariesListPage';
import OrganizationsListPage from './pages/OrganizationsListPage';
import PackageListPage from './pages/PackageListPage';
import TrackingPage from './pages/TrackingPage';
import TasksManagementPage from './pages/TasksManagementPage';
import CouriersManagementPage from './pages/CouriersManagementPage';
import AlertsManagementPage from './pages/AlertsManagementPage';
import ActivityLogPage from './pages/ActivityLogPage';
import AdvancedReportsPage from './pages/AdvancedReportsPage';
import ComprehensiveReportsPage from './pages/ComprehensiveReportsPage';
import DistributionReportsPage from './pages/DistributionReportsPage';
import MessagesSettingsPage from './pages/MessagesSettingsPage';
import SystemSettingsPage from './pages/SystemSettingsPage';
import SecurityManagementPage from './pages/SecurityManagementPage';
import BackupManagementPage from './pages/BackupManagementPage';
import IndividualSendPage from './pages/IndividualSendPage';
import TestSupabasePage from './pages/TestSupabasePage';

import * as Sentry from '@sentry/react';

interface AdminDashboardProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function AdminDashboard({ activeTab, setActiveTab }: AdminDashboardProps) {
  const { unreadAlerts, criticalAlerts } = useAlerts();
  const { logInfo } = useErrorLogger();
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<any>(null);
  
  // حساب الإحصائيات
  const stats = calculateStats();
  
  // إعداد نقاط الخريطة
  const mapPoints: MapPoint[] = mockBeneficiaries
    .filter(beneficiary => beneficiary.location?.lat && beneficiary.location?.lng)
    .map(beneficiary => {
      const task = mockTasks.find(t => t.beneficiaryId === beneficiary.id);
      return {
        id: beneficiary.id,
        lat: beneficiary.location!.lat,
        lng: beneficiary.location!.lng,
        status: task?.status || 'pending',
        title: beneficiary.name,
        description: task ? mockPackages.find(p => p.id === task.packageId)?.name || 'طرد غير محدد' : 'لا توجد مهمة',
        data: beneficiary
      };
    });

  const menuItems = [
    { id: 'overview', name: 'نظرة عامة', icon: BarChart3, description: 'الإحصائيات والخريطة الرئيسية' },
    { id: 'beneficiaries', name: 'إدارة المستفيدين', icon: Users, description: 'إدارة وتتبع المستفيدين' },
    { id: 'organizations', name: 'إدارة المؤسسات', icon: Building2, description: 'إدارة المؤسسات الشريكة' },
    { id: 'packages', name: 'قوالب الطرود', icon: Package, description: 'إدارة قوالب الطرود' },
    { id: 'tracking', name: 'تتبع الإرسالات', icon: MapPin, description: 'تتبع الطرود والمهام' },
    { id: 'tasks', name: 'إدارة المهام', icon: Activity, description: 'إدارة مهام التوزيع' },
    { id: 'couriers', name: 'إدارة المندوبين', icon: Truck, description: 'إدارة المندوبين والسائقين' },
    { id: 'alerts', name: 'إدارة التنبيهات', icon: Bell, description: 'إدارة التنبيهات والإشعارات' },
    { id: 'activity-log', name: 'سجل الأنشطة', icon: FileText, description: 'سجل جميع الأنشطة' },
    { id: 'users', name: 'إدارة المستخدمين', icon: Users, description: 'إدارة المستخدمين والأدوار' },
    { id: 'reports', name: 'التقارير المتقدمة', icon: BarChart3, description: 'تقارير وتحليلات متقدمة' },
    { id: 'comprehensive-reports', name: 'التقارير الشاملة', icon: FileText, description: 'تقارير شاملة ومفصلة' },
    { id: 'distribution-reports', name: 'تقارير التوزيع', icon: TrendingUp, description: 'تقارير أداء التوزيع' },
    { id: 'messages', name: 'إعدادات الرسائل', icon: MessageSquare, description: 'إدارة قوالب الرسائل' },
    { id: 'system-settings', name: 'إعدادات النظام', icon: Settings, description: 'إعدادات النظام العامة' },
    { id: 'security', name: 'إدارة الأمان', icon: Shield, description: 'إعدادات الأمان والحماية' },
    { id: 'backup', name: 'النسخ الاحتياطي', icon: Database, description: 'إدارة النسخ الاحتياطية' },
    { id: 'individual-send', name: 'إرسال فردي', icon: Send, description: 'إرسال طرود فردية' },
    { id: 'test-supabase', name: 'اختبار النظام', icon: Database, description: 'اختبار اتصال قاعدة البيانات' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-blue-50">
                <div className="text-center">
                  <div className="bg-blue-100 p-3 rounded-xl mb-2">
                    <Users className="w-6 h-6 text-blue-600 mx-auto" />
                  </div>
                  <p className="text-sm text-blue-600">إجمالي المستفيدين</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.totalBeneficiaries}</p>
                </div>
              </Card>

              <Card className="bg-green-50">
                <div className="text-center">
                  <div className="bg-green-100 p-3 rounded-xl mb-2">
                    <Package className="w-6 h-6 text-green-600 mx-auto" />
                  </div>
                  <p className="text-sm text-green-600">إجمالي الطرود</p>
                  <p className="text-2xl font-bold text-green-900">{stats.totalPackages}</p>
                </div>
              </Card>

              <Card className="bg-orange-50">
                <div className="text-center">
                  <div className="bg-orange-100 p-3 rounded-xl mb-2">
                    <CheckCircle className="w-6 h-6 text-orange-600 mx-auto" />
                  </div>
                  <p className="text-sm text-orange-600">طرود مسلمة</p>
                  <p className="text-2xl font-bold text-orange-900">{stats.deliveredPackages}</p>
                </div>
              </Card>

              <Card className="bg-purple-50">
                <div className="text-center">
                  <div className="bg-purple-100 p-3 rounded-xl mb-2">
                    <TrendingUp className="w-6 h-6 text-purple-600 mx-auto" />
                  </div>
                  <p className="text-sm text-purple-600">معدل النجاح</p>
                  <p className="text-2xl font-bold text-purple-900">{stats.deliveryRate}%</p>
                </div>
              </Card>
            </div>

            {/* Gaza Map */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">خريطة غزة التفاعلية</h3>
                <div className="flex space-x-2 space-x-reverse">
                  <Button variant="secondary" size="sm" onClick={() => setActiveTab('tracking')}>
                    عرض التتبع المتقدم
                  </Button>
                </div>
              </div>
              
              <GazaMap
                points={mapPoints}
                onPointClick={(beneficiary) => setSelectedBeneficiary(beneficiary)}
                className="h-96"
              />
            </Card>

            {/* Recent Alerts */}
            {criticalAlerts.length > 0 && (
              <Card className="bg-red-50 border-red-200">
                <div className="flex items-center space-x-3 space-x-reverse mb-4">
                  <Bell className="w-6 h-6 text-red-600" />
                  <h3 className="text-lg font-bold text-red-800">تنبيهات حرجة</h3>
                </div>
                <div className="space-y-3">
                  {criticalAlerts.slice(0, 3).map((alert) => (
                    <div key={alert.id} className="bg-white p-4 rounded-lg border border-red-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{alert.title}</p>
                          <p className="text-sm text-gray-600">{alert.description}</p>
                        </div>
                        <Button variant="danger" size="sm" onClick={() => setActiveTab('alerts')}>
                          عرض التفاصيل
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        );
      
      case 'beneficiaries':
        return <BeneficiariesListPage />;
      case 'organizations':
        return <OrganizationsListPage />;
      case 'packages':
        return <PackageListPage />;
      case 'tracking':
        return <TrackingPage />;
      case 'tasks':
        return <TasksManagementPage />;
      case 'couriers':
        return <CouriersManagementPage />;
      case 'alerts':
        return <AlertsManagementPage />;
      case 'activity-log':
        return <ActivityLogPage />;
      case 'users':
        return <UserManagementPage />;
      case 'reports':
        return <AdvancedReportsPage />;
      case 'comprehensive-reports':
        return <ComprehensiveReportsPage />;
      case 'distribution-reports':
        return <DistributionReportsPage />;
      case 'messages':
        return <MessagesSettingsPage />;
      case 'system-settings':
        return <SystemSettingsPage />;
      case 'security':
        return <SecurityManagementPage />;
      case 'backup':
        return <BackupManagementPage />;
      case 'individual-send':
        return <IndividualSendPage />;
      case 'test-supabase':
        return <TestSupabasePage />;
      default:
        return (
          <div className="text-center py-12">
            <div className="bg-gray-100 p-8 rounded-xl mb-4">
              <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">الصفحة قيد التطوير</h3>
              <p className="text-gray-600">هذه الصفحة ستكون متاحة قريباً</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white border-l border-gray-200 min-h-screen">
          <div className="p-6">
            <div className="flex items-center space-x-3 space-x-reverse mb-8">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">لوحة الإدمن</h1>
                <p className="text-xs text-gray-600">إدارة شاملة</p>
              </div>
            </div>

            {/* Critical Alerts Badge */}
            {criticalAlerts.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Bell className="w-4 h-4 text-red-600" />
                  <span className="text-red-800 font-medium text-sm">
                    {criticalAlerts.length} تنبيه حرج
                  </span>
                </div>
              </div>
            )}

            {/* Navigation Menu */}
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 space-x-reverse px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {renderContent()}
        </div>
      </div>

      {/* Beneficiary Details Modal */}
      {selectedBeneficiary && (
        <BeneficiaryDetailsModal
          beneficiary={selectedBeneficiary}
          onClose={() => setSelectedBeneficiary(null)}
        />
      )}
    </div>
  );
}