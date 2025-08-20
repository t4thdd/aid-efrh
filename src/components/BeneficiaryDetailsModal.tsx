import React from 'react';
import { X, User, Phone, MapPin, Calendar, Shield, Package, FileText, Activity, Star } from 'lucide-react';
import { type Beneficiary, mockTasks, mockPackages } from '../data/mockData';

interface BeneficiaryDetailsModalProps {
  beneficiary: Beneficiary;
  onClose: () => void;
}

export default function BeneficiaryDetailsModal({ beneficiary, onClose }: BeneficiaryDetailsModalProps) {
  // الحصول على المهام والطرود المرتبطة بالمستفيد
  const beneficiaryTasks = mockTasks.filter(task => task.beneficiaryId === beneficiary.id);
  const beneficiaryPackages = mockPackages.filter(pkg => pkg.beneficiaryId === beneficiary.id);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getIdentityColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEligibilityColor = (status: string) => {
    switch (status) {
      case 'eligible': return 'bg-green-100 text-green-800';
      case 'under_review': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" dir="rtl">
      <div className="bg-white rounded-2xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="bg-blue-100 p-3 rounded-xl">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">ملف المستفيد</h2>
              <p className="text-gray-600">تفاصيل شاملة للمستفيد</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Beneficiary Info */}
        <div className="space-y-6">
          {/* Personal Information */}
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
            <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center">
              <User className="w-5 h-5 ml-2" />
              المعلومات الشخصية
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-700">الاسم الكامل:</span>
                <span className="font-medium text-blue-900 mr-2">{beneficiary.fullName}</span>
              </div>
              <div>
                <span className="text-blue-700">رقم الهوية:</span>
                <span className="font-medium text-blue-900 mr-2">{beneficiary.nationalId}</span>
              </div>
              <div>
                <span className="text-blue-700">تاريخ الميلاد:</span>
                <span className="font-medium text-blue-900 mr-2">
                  {new Date(beneficiary.dateOfBirth).toLocaleDateString('ar-SA')}
                </span>
              </div>
              <div>
                <span className="text-blue-700">الجنس:</span>
                <span className="font-medium text-blue-900 mr-2">
                  {beneficiary.gender === 'male' ? 'ذكر' : 'أنثى'}
                </span>
              </div>
              <div>
                <span className="text-blue-700">الهاتف:</span>
                <span className="font-medium text-blue-900 mr-2">{beneficiary.phone}</span>
              </div>
              <div>
                <span className="text-blue-700">المهنة:</span>
                <span className="font-medium text-blue-900 mr-2">{beneficiary.profession}</span>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-green-50 p-6 rounded-xl border border-green-200">
            <h3 className="text-lg font-bold text-green-800 mb-4 flex items-center">
              <MapPin className="w-5 h-5 ml-2" />
              معلومات العنوان
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-green-700">المحافظة:</span>
                <span className="font-medium text-green-900 mr-2">{beneficiary.detailedAddress.governorate}</span>
              </div>
              <div>
                <span className="text-green-700">المدينة:</span>
                <span className="font-medium text-green-900 mr-2">{beneficiary.detailedAddress.city}</span>
              </div>
              <div>
                <span className="text-green-700">الحي:</span>
                <span className="font-medium text-green-900 mr-2">{beneficiary.detailedAddress.district}</span>
              </div>
              <div>
                <span className="text-green-700">الشارع:</span>
                <span className="font-medium text-green-900 mr-2">{beneficiary.detailedAddress.street}</span>
              </div>
              <div className="md:col-span-2">
                <span className="text-green-700">معلومات إضافية:</span>
                <span className="font-medium text-green-900 mr-2">{beneficiary.detailedAddress.additionalInfo}</span>
              </div>
            </div>
          </div>

          {/* Status Information */}
          <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
            <h3 className="text-lg font-bold text-purple-800 mb-4 flex items-center">
              <Shield className="w-5 h-5 ml-2" />
              حالة المستفيد
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="mb-2">
                  <span className="text-purple-700 text-sm">حالة الهوية</span>
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getIdentityColor(beneficiary.identityStatus)}`}>
                  {beneficiary.identityStatus === 'verified' ? 'موثق' :
                   beneficiary.identityStatus === 'pending' ? 'بانتظار التوثيق' : 'مرفوض التوثيق'}
                </span>
              </div>
              <div className="text-center">
                <div className="mb-2">
                  <span className="text-purple-700 text-sm">حالة النشاط</span>
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(beneficiary.status)}`}>
                  {beneficiary.status === 'active' ? 'نشط' :
                   beneficiary.status === 'pending' ? 'معلق' : 'متوقف'}
                </span>
              </div>
              <div className="text-center">
                <div className="mb-2">
                  <span className="text-purple-700 text-sm">حالة الأهلية</span>
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getEligibilityColor(beneficiary.eligibilityStatus)}`}>
                  {beneficiary.eligibilityStatus === 'eligible' ? 'مؤهل' :
                   beneficiary.eligibilityStatus === 'under_review' ? 'تحت المراجعة' : 'مرفوض'}
                </span>
              </div>
            </div>
          </div>

          {/* Family Information */}
          <div className="bg-orange-50 p-6 rounded-xl border border-orange-200">
            <h3 className="text-lg font-bold text-orange-800 mb-4 flex items-center">
              <Activity className="w-5 h-5 ml-2" />
              المعلومات العائلية
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-orange-700">الحالة الاجتماعية:</span>
                <span className="font-medium text-orange-900 mr-2">
                  {beneficiary.maritalStatus === 'single' ? 'أعزب' :
                   beneficiary.maritalStatus === 'married' ? 'متزوج' :
                   beneficiary.maritalStatus === 'divorced' ? 'مطلق' : 'أرمل'}
                </span>
              </div>
              <div>
                <span className="text-orange-700">عدد أفراد الأسرة:</span>
                <span className="font-medium text-orange-900 mr-2">{beneficiary.membersCount}</span>
              </div>
              <div>
                <span className="text-orange-700">المستوى الاقتصادي:</span>
                <span className="font-medium text-orange-900 mr-2">
                  {beneficiary.economicLevel === 'very_poor' ? 'فقير جداً' :
                   beneficiary.economicLevel === 'poor' ? 'فقير' :
                   beneficiary.economicLevel === 'moderate' ? 'متوسط' : 'ميسور'}
                </span>
              </div>
              <div>
                <span className="text-orange-700">إجمالي الطرود:</span>
                <span className="font-medium text-orange-900 mr-2">{beneficiary.totalPackages}</span>
              </div>
            </div>
          </div>

          {/* Package History */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <Package className="w-5 h-5 ml-2" />
              تاريخ الطرود ({beneficiaryPackages.length})
            </h3>
            {beneficiaryPackages.length > 0 ? (
              <div className="space-y-3">
                {beneficiaryPackages.map((pkg) => (
                  <div key={pkg.id} className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{pkg.name}</p>
                        <p className="text-sm text-gray-600">النوع: {pkg.type} - القيمة: {pkg.value} ₪</p>
                        <p className="text-xs text-gray-500">
                          تاريخ الإنشاء: {new Date(pkg.createdAt).toLocaleDateString('ar-SA')}
                        </p>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        pkg.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        pkg.status === 'in_delivery' ? 'bg-blue-100 text-blue-800' :
                        pkg.status === 'assigned' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {pkg.status === 'delivered' ? 'تم التسليم' :
                         pkg.status === 'in_delivery' ? 'قيد التوصيل' :
                         pkg.status === 'assigned' ? 'معين' : 'في الانتظار'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>لا توجد طرود مسجلة لهذا المستفيد</p>
              </div>
            )}
          </div>

          {/* Additional Notes */}
          {beneficiary.notes && (
            <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
              <h3 className="text-lg font-bold text-yellow-800 mb-4 flex items-center">
                <FileText className="w-5 h-5 ml-2" />
                ملاحظات إضافية
              </h3>
              <p className="text-yellow-700">{beneficiary.notes}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex space-x-3 space-x-reverse justify-end mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
          >
            إغلاق
          </button>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
            تعديل البيانات
          </button>
        </div>
      </div>
    </div>
  );
}

export default BeneficiaryDetailsModal