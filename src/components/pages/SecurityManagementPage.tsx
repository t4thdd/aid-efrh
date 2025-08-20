import React, { useState } from 'react';
import { 
  Shield, 
  Lock, 
  Unlock, 
  Key, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Users, 
  Activity, 
  Database, 
  Settings, 
  Bell, 
  Mail, 
  Phone,
  FileText,
  Download,
  Upload,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  X,
  Save
} from 'lucide-react';
import { useErrorLogger } from '../../utils/errorLogger';
import { useExport } from '../../utils/exportUtils';
import { Button, Card, Input, Badge, Modal, ExportModal } from '../ui';
import { mockActivityLog, mockSystemUsers } from '../../data/mockData';

interface SecuritySetting {
  id: string;
  category: 'authentication' | 'authorization' | 'encryption' | 'audit' | 'backup';
  name: string;
  description: string;
  value: string | boolean;
  type: 'text' | 'boolean' | 'number' | 'password';
  isSecret?: boolean;
  lastModified: string;
  modifiedBy: string;
}

interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  resource: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export default function SecurityManagementPage() {
  const { logInfo, logError } = useErrorLogger();
  const { exportData } = useExport();
  
  const [activeTab, setActiveTab] = useState('authentication');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'add-setting' | 'edit-setting' | 'view-audit'>('add-setting');
  const [selectedSetting, setSelectedSetting] = useState<SecuritySetting | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showSecrets, setShowSecrets] = useState<{ [key: string]: boolean }>({});
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  // Mock security settings
  const [securitySettings, setSecuritySettings] = useState<SecuritySetting[]>([
    {
      id: '1',
      category: 'authentication',
      name: 'مهلة انتهاء الجلسة',
      description: 'المدة بالدقائق قبل انتهاء جلسة المستخدم تلقائياً',
      value: '60',
      type: 'number',
      lastModified: '2024-12-21',
      modifiedBy: 'أحمد الإدمن'
    },
    {
      id: '2',
      category: 'authentication',
      name: 'الحد الأقصى لمحاولات تسجيل الدخول',
      description: 'عدد المحاولات المسموحة قبل قفل الحساب',
      value: '5',
      type: 'number',
      lastModified: '2024-12-20',
      modifiedBy: 'أحمد الإدمن'
    },
    {
      id: '3',
      category: 'authentication',
      name: 'إجبار التحقق بخطوتين',
      description: 'إجبار جميع المستخدمين على استخدام التحقق بخطوتين',
      value: false,
      type: 'boolean',
      lastModified: '2024-12-19',
      modifiedBy: 'أحمد الإدمن'
    },
    {
      id: '4',
      category: 'encryption',
      name: 'مفتاح التشفير الرئيسي',
      description: 'مفتاح تشفير البيانات الحساسة في قاعدة البيانات',
      value: 'sk_live_51234567890abcdef',
      type: 'password',
      isSecret: true,
      lastModified: '2024-12-15',
      modifiedBy: 'أحمد الإدمن'
    },
    {
      id: '5',
      category: 'audit',
      name: 'تفعيل سجل التدقيق',
      description: 'تسجيل جميع العمليات الحساسة في سجل التدقيق',
      value: true,
      type: 'boolean',
      lastModified: '2024-12-21',
      modifiedBy: 'أحمد الإدمن'
    },
    {
      id: '6',
      category: 'backup',
      name: 'تشفير النسخ الاحتياطية',
      description: 'تشفير جميع النسخ الاحتياطية قبل التخزين',
      value: true,
      type: 'boolean',
      lastModified: '2024-12-20',
      modifiedBy: 'أحمد الإدمن'
    }
  ]);

  // Mock audit log
  const auditLog: AuditLogEntry[] = [
    {
      id: '1',
      timestamp: '2024-12-21T10:30:00',
      action: 'تسجيل دخول',
      user: 'أحمد الإدمن',
      resource: 'النظام',
      details: 'تسجيل دخول ناجح من IP: 192.168.1.100',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      severity: 'low'
    },
    {
      id: '2',
      timestamp: '2024-12-21T09:15:00',
      action: 'تعديل إعدادات الأمان',
      user: 'أحمد الإدمن',
      resource: 'إعدادات النظام',
      details: 'تم تغيير مهلة انتهاء الجلسة من 30 إلى 60 دقيقة',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      severity: 'medium'
    },
    {
      id: '3',
      timestamp: '2024-12-21T08:45:00',
      action: 'محاولة دخول فاشلة',
      user: 'مجهول',
      resource: 'النظام',
      details: 'محاولة دخول فاشلة بكلمة مرور خاطئة',
      ipAddress: '192.168.1.200',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      severity: 'high'
    }
  ];

  const tabs = [
    { id: 'authentication', name: 'المصادقة', icon: Lock },
    { id: 'authorization', name: 'التحكم بالوصول', icon: Shield },
    { id: 'audit', name: 'سجل التدقيق', icon: FileText },
    { id: 'encryption', name: 'التشفير', icon: Key },
    { id: 'backup', name: 'النسخ الاحتياطي', icon: Database }
  ];

  const filteredSettings = securitySettings.filter(setting => setting.category === activeTab);

  const handleSaveSetting = (settingId: string, newValue: string | boolean) => {
    setSecuritySettings(prev => 
      prev.map(setting => 
        setting.id === settingId 
          ? { 
              ...setting, 
              value: newValue, 
              lastModified: new Date().toISOString().split('T')[0],
              modifiedBy: 'أحمد الإدمن'
            }
          : setting
      )
    );
    
    const setting = securitySettings.find(s => s.id === settingId);
    setNotification({ 
      message: `تم تحديث إعداد "${setting?.name}" بنجاح`, 
      type: 'success' 
    });
    setTimeout(() => setNotification(null), 3000);
    logInfo(`تم تحديث إعداد الأمان: ${setting?.name}`, 'SecurityManagementPage');
  };

  const toggleSecretVisibility = (settingId: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [settingId]: !prev[settingId]
    }));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case 'critical': return 'حرجة';
      case 'high': return 'عالية';
      case 'medium': return 'متوسطة';
      case 'low': return 'منخفضة';
      default: return 'غير محدد';
    }
  };

  const renderSettingInput = (setting: SecuritySetting) => {
    switch (setting.type) {
      case 'boolean':
        return (
          <div className="flex items-center space-x-2 space-x-reverse">
            <input
              type="checkbox"
              checked={setting.value === true}
              onChange={(e) => handleSaveSetting(setting.id, e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">
              {setting.value === true ? 'مفعل' : 'معطل'}
            </span>
          </div>
        );

      case 'password':
        return (
          <div className="relative">
            <input
              type={showSecrets[setting.id] ? 'text' : 'password'}
              value={setting.value as string}
              onChange={(e) => handleSaveSetting(setting.id, e.target.value)}
              className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="أدخل القيمة..."
            />
            <button
              type="button"
              onClick={() => toggleSecretVisibility(setting.id)}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showSecrets[setting.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        );

      case 'number':
        return (
          <input
            type="number"
            value={setting.value as string}
            onChange={(e) => handleSaveSetting(setting.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="أدخل رقم..."
          />
        );

      default:
        return (
          <input
            type="text"
            value={setting.value as string}
            onChange={(e) => handleSaveSetting(setting.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="أدخل النص..."
          />
        );
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
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">إدارة الأمان والحماية</h1>
            <p className="text-gray-600 mt-1">إعدادات الأمان المتقدمة وحماية النظام</p>
          </div>
          <div className="flex space-x-3 space-x-reverse">
            <Button variant="success" icon={Download} iconPosition="right" onClick={() => setShowExportModal(true)}>
              تصدير سجل الأمان
            </Button>
            <Button variant="primary" icon={Plus} iconPosition="right">
              إضافة إعداد أمان
            </Button>
          </div>
        </div>

        {/* Security Status */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="bg-green-50 p-4 rounded-xl border border-green-200">
            <div className="flex items-center space-x-2 space-x-reverse">
              <Shield className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-800">حالة الأمان</span>
            </div>
            <p className="text-2xl font-bold text-green-900 mt-2">آمن</p>
            <p className="text-xs text-green-700">جميع الإعدادات محدثة</p>
          </div>

          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
            <div className="flex items-center space-x-2 space-x-reverse">
              <Lock className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-800">الجلسات النشطة</span>
            </div>
            <p className="text-2xl font-bold text-blue-900 mt-2">{mockSystemUsers.filter(u => u.status === 'active').length}</p>
            <p className="text-xs text-blue-700">مستخدم متصل</p>
          </div>

          <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
            <div className="flex items-center space-x-2 space-x-reverse">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <span className="font-medium text-orange-800">تنبيهات أمنية</span>
            </div>
            <p className="text-2xl font-bold text-orange-900 mt-2">2</p>
            <p className="text-xs text-orange-700">تحتاج مراجعة</p>
          </div>

          <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
            <div className="flex items-center space-x-2 space-x-reverse">
              <Activity className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-purple-800">أنشطة اليوم</span>
            </div>
            <p className="text-2xl font-bold text-purple-900 mt-2">{auditLog.length}</p>
            <p className="text-xs text-purple-700">عملية مسجلة</p>
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

      {/* Authentication Tab */}
      {activeTab === 'authentication' && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-gray-900">إعدادات المصادقة</h3>
          
          <div className="grid gap-4">
            {filteredSettings.map((setting) => (
              <Card key={setting.id}>
                <div className="grid md:grid-cols-3 gap-6 items-center">
                  <div>
                    <div className="flex items-center space-x-2 space-x-reverse mb-2">
                      <h4 className="font-semibold text-gray-900">{setting.name}</h4>
                      {setting.isSecret && (
                        <Lock className="w-4 h-4 text-red-500" title="إعداد سري" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{setting.description}</p>
                    <div className="text-xs text-gray-500 mt-2">
                      آخر تعديل: {new Date(setting.lastModified).toLocaleDateString('ar-SA')} بواسطة {setting.modifiedBy}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">القيمة</label>
                    {renderSettingInput(setting)}
                  </div>

                  <div className="text-center">
                    <Badge variant={setting.value === true || setting.value !== '' ? 'success' : 'neutral'} size="sm">
                      {setting.value === true || setting.value !== '' ? 'مفعل' : 'معطل'}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Authorization Tab */}
      {activeTab === 'authorization' && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-gray-900">التحكم بالوصول</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <h4 className="font-semibold text-gray-900 mb-4">الأدوار والصلاحيات</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">مدير النظام</p>
                    <p className="text-sm text-gray-600">صلاحيات كاملة</p>
                  </div>
                  <Badge variant="error" size="sm">2 مستخدم</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">مشرف المؤسسة</p>
                    <p className="text-sm text-gray-600">إدارة المؤسسة</p>
                  </div>
                  <Badge variant="info" size="sm">8 مستخدم</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">مندوب التوزيع</p>
                    <p className="text-sm text-gray-600">تحديث التسليمات</p>
                  </div>
                  <Badge variant="success" size="sm">15 مستخدم</Badge>
                </div>
              </div>
            </Card>

            <Card>
              <h4 className="font-semibold text-gray-900 mb-4">إعدادات الوصول</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">تقييد الوصول بالـ IP</p>
                    <p className="text-sm text-gray-600">السماح فقط لعناوين IP محددة</p>
                  </div>
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">تسجيل الدخول الموحد (SSO)</p>
                    <p className="text-sm text-gray-600">استخدام نظام مصادقة خارجي</p>
                  </div>
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">انتهاء كلمات المرور</p>
                    <p className="text-sm text-gray-600">إجبار تغيير كلمة المرور كل 90 يوم</p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Audit Log Tab */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">سجل التدقيق الأمني</h3>
            <Button variant="secondary" icon={Download} iconPosition="right">
              تصدير السجل
            </Button>
          </div>

          <Card padding="none" className="overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h4 className="text-lg font-semibold text-gray-900">الأنشطة الأمنية الأخيرة</h4>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الوقت
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الإجراء
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      المستخدم
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      المورد
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الخطورة
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      عنوان IP
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {auditLog.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(entry.timestamp).toLocaleString('ar-SA')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {entry.action}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {entry.user}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {entry.resource}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={
                          entry.severity === 'critical' ? 'error' :
                          entry.severity === 'high' ? 'warning' :
                          entry.severity === 'medium' ? 'info' : 'neutral'
                        } size="sm">
                          {getSeverityText(entry.severity)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                        {entry.ipAddress}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Encryption Tab */}
      {activeTab === 'encryption' && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-gray-900">إعدادات التشفير</h3>
          
          <div className="grid gap-4">
            {filteredSettings.map((setting) => (
              <Card key={setting.id}>
                <div className="grid md:grid-cols-3 gap-6 items-center">
                  <div>
                    <div className="flex items-center space-x-2 space-x-reverse mb-2">
                      <Key className="w-4 h-4 text-purple-600" />
                      <h4 className="font-semibold text-gray-900">{setting.name}</h4>
                      {setting.isSecret && (
                        <Lock className="w-4 h-4 text-red-500" title="إعداد سري" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{setting.description}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">القيمة</label>
                    {renderSettingInput(setting)}
                  </div>

                  <div className="text-center">
                    <Badge variant="success" size="sm">
                      مشفر
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Backup Tab */}
      {activeTab === 'backup' && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-gray-900">أمان النسخ الاحتياطية</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <h4 className="font-semibold text-gray-900 mb-4">إعدادات التشفير</h4>
              <div className="space-y-4">
                {filteredSettings.map((setting) => (
                  <div key={setting.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{setting.name}</p>
                      <p className="text-sm text-gray-600">{setting.description}</p>
                    </div>
                    {renderSettingInput(setting)}
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h4 className="font-semibold text-gray-900 mb-4">حالة الأمان</h4>
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                  <div className="flex items-center space-x-2 space-x-reverse text-green-600 mb-2">
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-medium">النسخ الاحتياطية مشفرة</span>
                  </div>
                  <p className="text-green-700 text-sm">جميع النسخ الاحتياطية محمية بتشفير AES-256</p>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <div className="flex items-center space-x-2 space-x-reverse text-blue-600 mb-2">
                    <Shield className="w-4 h-4" />
                    <span className="font-medium">التخزين الآمن</span>
                  </div>
                  <p className="text-blue-700 text-sm">النسخ محفوظة في مواقع متعددة مع تشفير نقل البيانات</p>
                </div>
                
                <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                  <div className="flex items-center space-x-2 space-x-reverse text-orange-600 mb-2">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">الاحتفاظ بالنسخ</span>
                  </div>
                  <p className="text-orange-700 text-sm">يتم الاحتفاظ بالنسخ لمدة 90 يوم مع حذف تلقائي للنسخ القديمة</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          data={auditLog}
          title="سجل التدقيق الأمني"
          defaultFilename={`سجل_التدقيق_الأمني_${new Date().toISOString().split('T')[0]}`}
          availableFields={[
            { key: 'timestamp', label: 'الوقت' },
            { key: 'action', label: 'الإجراء' },
            { key: 'user', label: 'المستخدم' },
            { key: 'resource', label: 'المورد' },
            { key: 'details', label: 'التفاصيل' },
            { key: 'severity', label: 'الخطورة' },
            { key: 'ipAddress', label: 'عنوان IP' },
            { key: 'userAgent', label: 'متصفح المستخدم' }
          ]}
          filters={{ activeTab }}
        />
      )}

      {/* Security Recommendations */}
      <Card className="bg-red-50 border-red-200">
        <div className="flex items-start space-x-3 space-x-reverse">
          <Shield className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-red-800 mb-3">توصيات أمنية مهمة</h4>
            <ul className="text-sm text-red-700 space-y-2">
              <li className="flex items-start space-x-2 space-x-reverse">
                <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <span>قم بتفعيل التحقق بخطوتين لجميع المستخدمين الإداريين</span>
              </li>
              <li className="flex items-start space-x-2 space-x-reverse">
                <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <span>راجع سجل التدقيق بانتظام للكشف عن الأنشطة المشبوهة</span>
              </li>
              <li className="flex items-start space-x-2 space-x-reverse">
                <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <span>تأكد من تشفير جميع البيانات الحساسة قبل التخزين</span>
              </li>
              <li className="flex items-start space-x-2 space-x-reverse">
                <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <span>قم بإنشاء نسخ احتياطية مشفرة بانتظام واختبر عملية الاستعادة</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}