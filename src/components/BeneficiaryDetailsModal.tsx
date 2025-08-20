import React from 'react';
import { X, User, Phone, MapPin, Calendar, Shield, FileText, Users, Briefcase, Heart } from 'lucide-react';
import { type Beneficiary } from '../data/mockData';
import { Badge } from './ui';

interface BeneficiaryDetailsModalProps {
  beneficiary: Beneficiary;
  onClose: () => void;
}

export default function BeneficiaryDetailsModal({ beneficiary, onClose }: BeneficiaryDetailsModalProps) {
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
      <div className="bg-white rounded-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="bg-blue-100 p-3 rounded-xl">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">تفاصيل المستفيد</h2>
              <p className="text-gray-600">{beneficiary.name}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
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

          {/* Social and Economic Information */}
          <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
            <h3 className="text-lg font-bold text-purple-800 mb-4 flex items-center">
              <Heart className="w-5 h-5 ml-2" />
              المعلومات الاجتماعية والاقتصادية
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-purple-700">الحالة الاجتماعية:</span>
                <span className="font-medium text-purple-900 mr-2">
                  {beneficiary.maritalStatus === 'single' ? 'أعزب' :
                   beneficiary.maritalStatus === 'married' ? 'متزوج' :
                   beneficiary.maritalStatus === 'divorced' ? 'مطلق' : 'أرمل'}
                </span>
              </div>
              <div>
                <span className="text-purple-700">المستوى الاقتصادي:</span>
                <span className="font-medium text-purple-900 mr-2">
                  {beneficiary.economicLevel === 'very_poor' ? 'فقير جداً' :
                   beneficiary.economicLevel === 'poor' ? 'فقير' :
                   beneficiary.economicLevel === 'moderate' ? 'متوسط' : 'ميسور'}
                </span>
              </div>
              <div>
                <span className="text-purple-700">عدد أفراد الأسرة:</span>
                <span className="font-medium text-purple-900 mr-2">{beneficiary.membersCount}</span>
              </div>
              <div>
                <span className="text-purple-700">إجمالي الطرود:</span>
                <span className="font-medium text-purple-900 mr-2">{beneficiary.totalPackages}</span>
              </div>
            </div>
          </div>

          {/* Status Information */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <Shield className="w-5 h-5 ml-2" />
              حالات النظام
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-gray-600 mb-2">حالة الهوية</p>
                <Badge variant={
                  beneficiary.identityStatus === 'verified' ? 'success' :
                  beneficiary.identityStatus === 'pending' ? 'warning' : 'error'
                }>
                  {beneficiary.identityStatus === 'verified' ? 'موثق' :
                   beneficiary.identityStatus === 'pending' ? 'بانتظار التوثيق' : 'مرفوض التوثيق'}
                </Badge>
              </div>
              <div className="text-center">
                <p className="text-gray-600 mb-2">حالة النشاط</p>
                <Badge variant={
                  beneficiary.status === 'active' ? 'success' :
                  beneficiary.status === 'pending' ? 'warning' : 'error'
                }>
                  {beneficiary.status === 'active' ? 'نشط' :
                   beneficiary.status === 'pending' ? 'معلق' : 'متوقف'}
                </Badge>
              </div>
              <div className="text-center">
                <p className="text-gray-600 mb-2">حالة الأهلية</p>
                <Badge variant={
                  beneficiary.eligibilityStatus === 'eligible' ? 'success' :
                  beneficiary.eligibilityStatus === 'under_review' ? 'warning' : 'error'
                }>
                  {beneficiary.eligibilityStatus === 'eligible' ? 'مؤهل' :
                   beneficiary.eligibilityStatus === 'under_review' ? 'تحت المراجعة' : 'مرفوض'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
            <h3 className="text-lg font-bold text-yellow-800 mb-4 flex items-center">
              <FileText className="w-5 h-5 ml-2" />
              معلومات إضافية
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-yellow-700">آخر استلام:</span>
                <span className="font-medium text-yellow-900 mr-2">
                  {new Date(beneficiary.lastReceived).toLocaleDateString('ar-SA')}
                </span>
              </div>
              <div>
                <span className="text-yellow-700">تاريخ التسجيل:</span>
                <span className="font-medium text-yellow-900 mr-2">
                  {new Date(beneficiary.createdAt).toLocaleDateString('ar-SA')}
                </span>
              </div>
              <div>
                <span className="text-yellow-700">أنشئ بواسطة:</span>
                <span className="font-medium text-yellow-900 mr-2">{beneficiary.createdBy}</span>
              </div>
              <div>
                <span className="text-yellow-700">آخر تحديث:</span>
                <span className="font-medium text-yellow-900 mr-2">
                  {new Date(beneficiary.updatedAt).toLocaleDateString('ar-SA')}
                </span>
              </div>
            </div>
            
            {beneficiary.notes && (
              <div className="mt-4">
                <span className="text-yellow-700">ملاحظات:</span>
                <p className="text-yellow-900 mt-1 bg-white p-3 rounded-lg border border-yellow-200">
                  {beneficiary.notes}
                </p>
              </div>
            )}
          </div>

          {/* Additional Documents */}
          {beneficiary.additionalDocuments && beneficiary.additionalDocuments.length > 0 && (
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <FileText className="w-5 h-5 ml-2" />
                الوثائق الإضافية
              </h3>
              <div className="space-y-3">
                {beneficiary.additionalDocuments.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                    <div>
                      <p className="font-medium text-gray-900">{doc.name}</p>
                      <p className="text-sm text-gray-600">نوع: {doc.type}</p>
                    </div>
                    <a 
                      href={doc.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      عرض الوثيقة
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex space-x-3 space-x-reverse justify-end">
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
    </div>
  );
}