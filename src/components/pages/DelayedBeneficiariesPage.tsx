import React, { useState, useMemo } from 'react';
import { Search, Clock, Phone, Edit, Calendar, FileText, Download, User, MapPin, Package } from 'lucide-react';
import { Card, Button, Input, Badge, Modal, StatCard, ExportModal } from '../ui';
import BeneficiaryForm from '../BeneficiaryForm';
import { useBeneficiaries } from '../../hooks/useBeneficiaries';
import { useErrorLogger } from '../../utils/errorLogger';
import { useExport } from '../../utils/exportUtils';
import { useAlerts } from '../../context/AlertsContext';
import * as Sentry from '@sentry/react';

interface BeneficiaryProfileModalProps {
  beneficiary: any;
  isOpen: boolean;
  onClose: () => void;
}

const BeneficiaryProfileModal: React.FC<BeneficiaryProfileModalProps> = ({ beneficiary, isOpen, onClose }) => {
  if (!beneficiary) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="ملف المستفيد">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل</label>
            <p className="text-gray-900">{beneficiary.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهوية</label>
            <p className="text-gray-900">{beneficiary.nationalId}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
            <p className="text-gray-900">{beneficiary.phone}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">العنوان</label>
            <p className="text-gray-900">{beneficiary.address}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">آخر استلام</label>
            <p className="text-gray-900">
              {beneficiary.lastReceived 
                ? new Date(beneficiary.lastReceived).toLocaleDateString('ar-SA')
                : 'لم يستلم بعد'
              }
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
            <Badge variant={beneficiary.status === 'نشط' ? 'success' : 'warning'}>
              {beneficiary.status}
            </Badge>
          </div>
        </div>
        
        {beneficiary.notes && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات</label>
            <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{beneficiary.notes}</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export const DelayedBeneficiariesPage: React.FC = () => {
  const { beneficiaries, loading, error, updateBeneficiary, refetch } = useBeneficiaries();
  const { logInfo, logError } = useErrorLogger();
  const { exportData } = useExport();
  const { addAlert } = useAlerts();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<any>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // تحديد المستفيدين المتأخرين (لم يستلموا لأكثر من 7 أيام)
  const delayedBeneficiaries = useMemo(() => {
    if (!beneficiaries) return [];
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 30); // Consider delayed if not received in last 30 days

    return beneficiaries.filter(beneficiary => {
      if (!beneficiary.lastReceived) return true; // لم يستلم أبداً
      
      const lastReceived = new Date(beneficiary.lastReceived);
      return lastReceived < sevenDaysAgo;
    });
  }, [beneficiaries]);

  // فلترة المستفيدين حسب البحث
  const filteredBeneficiaries = useMemo(() => {
    return delayedBeneficiaries.filter(beneficiary =>
      beneficiary.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      beneficiary.nationalId?.includes(searchTerm) ||
      beneficiary.phone?.includes(searchTerm)
    );
  }, [delayedBeneficiaries, searchTerm]);

  // حساب الإحصائيات
  const stats = useMemo(() => {
    const total = delayedBeneficiaries.length;
    const neverReceived = delayedBeneficiaries.filter(b => !b.lastReceived).length;
    const overdue = delayedBeneficiaries.filter(b => { // Overdue if not received in last 30 days
      if (!b.lastReceived) return false;
      const lastReceived = new Date(b.lastReceived);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return lastReceived < thirtyDaysAgo;
    }).length;
    const needsContact = delayedBeneficiaries.filter(b => b.status === 'يحتاج متابعة').length;
    
    return { total, neverReceived, overdue, needsContact };
  }, [delayedBeneficiaries]);

  const handleViewProfile = (beneficiary: any) => {
    setSelectedBeneficiary(beneficiary);
    setShowProfile(true);
    logInfo('عرض ملف المستفيد المتأخر', { beneficiaryId: beneficiary.id });
    Sentry.captureMessage(`Viewing delayed beneficiary profile: ${beneficiary.name}`, 'info');
  };

  const handleEditBeneficiary = (beneficiary: any) => {
    setSelectedBeneficiary(beneficiary);
    setShowEditForm(true);
    logInfo('تعديل بيانات المستفيد المتأخر', { beneficiaryId: beneficiary.id });
    Sentry.captureMessage(`Editing delayed beneficiary: ${beneficiary.name}`, 'info');
  };

  const handleContact = async (beneficiary: any) => {
    try {
      await updateBeneficiary(beneficiary.id, { notes: `تم التواصل في ${new Date().toLocaleDateString('ar-SA')}` });
      addAlert({
        type: 'success',
        message: `تم الاتصال بـ ${beneficiary.name} على الرقم ${beneficiary.phone}`,
        duration: 3000
      });
      logInfo(`اتصال بالمستفيد المتأخر: ${beneficiary.name}`, 'DelayedBeneficiariesPage');
      Sentry.captureMessage(`Contacted delayed beneficiary: ${beneficiary.name}`, 'info');
      refetch();
    } catch (err) {
      logError(err as Error, 'DelayedBeneficiariesPage');
      Sentry.captureException(err);
      addAlert({ type: 'error', message: 'فشل الاتصال بالمستفيد', duration: 3000 });
    }
  };

  const handleReschedule = async (beneficiary: any) => {
    try {
      await updateBeneficiary(beneficiary.id, { lastReceived: new Date().toISOString().split('T')[0], notes: `تم إعادة جدولة التسليم في ${new Date().toLocaleDateString('ar-SA')}` });
      addAlert({
        type: 'success',
        message: `تم إعادة جدولة التسليم للمستفيد ${beneficiary.name}`,
        duration: 3000
      });
      logInfo(`إعادة جدولة التسليم للمستفيد المتأخر: ${beneficiary.name}`, 'DelayedBeneficiariesPage');
      Sentry.captureMessage(`Rescheduled delivery for delayed beneficiary: ${beneficiary.name}`, 'info');
      refetch();
    } catch (err) {
      logError(err as Error, 'DelayedBeneficiariesPage');
      Sentry.captureException(err);
      addAlert({ type: 'error', message: 'فشل إعادة جدولة التسليم', duration: 3000 });
    }
  };

  const handleSendGroupReminder = () => {
    filteredBeneficiaries.forEach(b => {
      addAlert({ type: 'info', message: `تم إرسال تذكير لـ ${b.name}`, duration: 2000 });
    });
    addAlert({ type: 'success', message: `تم إرسال تذكير جماعي لـ ${filteredBeneficiaries.length} مستفيد`, duration: 5000 });
    logInfo(`إرسال تذكير جماعي لـ ${filteredBeneficiaries.length} مستفيد`, 'DelayedBeneficiariesPage');
    Sentry.captureMessage(`Sent group reminder to ${filteredBeneficiaries.length} delayed beneficiaries`, 'info');
    refetch();
  };

  const handleExport = () => {
    setShowExportModal(true);
  };

  if (loading) return <div>جاري التحميل...</div>;
  if (error) return <div>خطأ في تحميل البيانات</div>;

  return (
    <div className="space-y-6">
      {/* العنوان والإجراءات */}
      <Card>
        <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">المستفيدون المتأخرون</h1>
          <p className="text-gray-600">إدارة ومتابعة المستفيدين الذين لم يستلموا مساعداتهم في الوقت المحدد</p>
        </div>
        <Button onClick={handleExport} className="flex items-center space-x-2 space-x-reverse">
          <Download className="w-4 h-4" />
          <span>تصدير البيانات</span>
        </Button>
        </div>
      </Card>

      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="إجمالي المتأخرين (30+ يوم)"
          value={stats.total}
          icon={Clock}
          color="orange"
        />
        <StatCard
          title="لم يستلموا أبداً"
          value={stats.neverReceived}
          icon={Package}
          color="red"
        />
        <StatCard
          title="متأخرون جداً (60+ يوم)"
          value={stats.overdue}
          icon={Calendar}
          color="red"
        />
        <StatCard
          title="يحتاج متابعة"
          value={stats.needsContact}
          icon={Phone}
          color="yellow"
        />
      </div>

      {/* البحث والفلاتر */}
      <Card>
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="البحث بالاسم أو رقم الهوية أو الهاتف..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={Search}
              />
            </div>
            <div className="flex space-x-3 space-x-reverse">
              <select className="px-4 py-2 border border-gray-300 rounded-xl text-sm">
                <option value="">جميع الحالات</option>
                <option value="never">لم يستلم أبداً</option>
                <option value="overdue">متأخر جداً</option>
                <option value="needs-contact">يحتاج متابعة</option>
              </select>
            </div>
          </div>
        </div>
        <div className="flex space-x-3 space-x-reverse">
          <Button
            onClick={handleSendGroupReminder}
            className="bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-orange-700 transition-colors flex items-center"
          >
            إرسال تذكير جماعي ({filteredBeneficiaries.length})
          </Button>
        </div>
      </Card>

      {/* قائمة المستفيدين المتأخرين */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-right py-3 px-4 font-medium text-gray-700">المستفيد</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">معلومات الاتصال</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">آخر استلام</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">الحالة</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredBeneficiaries.map((beneficiary) => (
                <tr key={beneficiary.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{beneficiary.name}</div>
                        <div className="text-sm text-gray-500">هوية: {beneficiary.nationalId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm">
                      <div className="flex items-center space-x-2 space-x-reverse text-gray-900">
                        <Phone className="w-4 h-4" />
                        <span>{beneficiary.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse text-gray-500 mt-1">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate max-w-xs">{beneficiary.address}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm">
                      {beneficiary.lastReceived ? (
                        <div>
                          <div className="text-gray-900">
                            {new Date(beneficiary.lastReceived).toLocaleDateString('ar-SA')}
                          </div>
                          <div className="text-xs text-gray-500">
                            منذ {Math.floor((Date.now() - new Date(beneficiary.lastReceived).getTime()) / (1000 * 60 * 60 * 24))} يوماً
                          </div>
                        </div>
                      ) : (
                        <Badge variant="error" size="sm">لم يستلم أبداً</Badge>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <Badge 
                      variant={
                        beneficiary.status === 'نشط' ? 'success' :
                        beneficiary.status === 'يحتاج متابعة' ? 'warning' : 'neutral'
                      }
                      size="sm"
                    >
                      {beneficiary.status}
                    </Badge>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex space-x-2 space-x-reverse">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleViewProfile(beneficiary)}
                      >
                        <FileText className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleEditBeneficiary(beneficiary)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleContact(beneficiary)}
                      >
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => handleReschedule(beneficiary)}
                      >
                        <Calendar className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* نموذج تعديل المستفيد */}
      {showEditForm && selectedBeneficiary && (
        <Modal
          isOpen={showEditForm}
          onClose={() => {
            setShowEditForm(false);
            setSelectedBeneficiary(null);
          }}
          title="تعديل بيانات المستفيد"
        >
          <BeneficiaryForm
            beneficiary={selectedBeneficiary}
            onSubmit={(data) => {
              // Handle form submission
              setShowEditForm(false);
              setSelectedBeneficiary(null);
            }}
            onCancel={() => {
              setShowEditForm(false);
              setSelectedBeneficiary(null);
            }}
          />
        </Modal>
      )}

      {/* نموذج عرض ملف المستفيد */}
      <BeneficiaryProfileModal
        beneficiary={selectedBeneficiary}
        isOpen={showProfile}
        onClose={() => {
          setShowProfile(false);
          setSelectedBeneficiary(null);
        }}
      />

      {/* نموذج التصدير */}
      {showExportModal && (
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          data={filteredBeneficiaries}
          title="المستفيدون المتأخرون"
          defaultFilename={`المستفيدون_المتأخرون_${new Date().toISOString().split('T')[0]}`}
          availableFields={[
            { key: 'name', label: 'الاسم' },
            { key: 'nationalId', label: 'رقم الهوية' },
            { key: 'phone', label: 'رقم الهاتف' },
            { key: 'address', label: 'العنوان' },
            { key: 'lastReceived', label: 'آخر استلام' },
            { key: 'status', label: 'الحالة' },
            { key: 'notes', label: 'ملاحظات' }
          ]}
          filters={{ searchTerm }}
        />
      )}
    </div>
  );
};

export default DelayedBeneficiariesPage;