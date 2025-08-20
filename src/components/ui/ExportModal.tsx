import React, { useState } from 'react';
import { Download, FileText, Database, File, Calendar, Filter, CheckCircle, AlertTriangle, X, Settings, Eye } from 'lucide-react';
import { Button, Card, Input, Badge, Modal } from './index'; // Import all necessary UI components
import { exportService, type ExportOptions, type ExportResult } from '../../utils/exportUtils';
import { useErrorLogger } from '../../utils/errorLogger';

export interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any[];
  title: string;
  defaultFilename?: string;
  availableFields: { key: string; label: string }[];
  filters?: Record<string, any>;
}

export default function ExportModal({ isOpen, onClose, data, title, defaultFilename, availableFields, filters = {} }: ExportModalProps) {
  const { logInfo, logError } = useErrorLogger();
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'csv',
    filename: defaultFilename || `تصدير_${new Date().toISOString().split('T')[0]}`,
    includeHeaders: true, // Default to including headers
    customFields: availableFields.length > 0 ? availableFields.slice(0, 5).map(f => f.key) : []
  });
  
  const [isExporting, setIsExporting] = useState(false);
  const [exportResult, setExportResult] = useState<ExportResult | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);

  const formatOptions = [
    { value: 'csv', label: 'CSV', icon: FileText, description: 'ملف نصي مفصول بفواصل' },
    { value: 'json', label: 'JSON', icon: Database, description: 'ملف بيانات منظم' },
    { value: 'pdf', label: 'PDF', icon: File, description: 'ملف PDF للطباعة' }, // PDF export option
    { value: 'excel', label: 'Excel', icon: FileText, description: 'ملف Excel للتحليل' }
  ];

  const handleExport = async () => {
    setIsExporting(true);
    setExportResult(null);

    try {
      logInfo(`بدء تصدير ${title} بصيغة ${exportOptions.format}`, 'ExportModal');

      // تطبيق الفلاتر
      let filteredData = [...data];
      
      // تطبيق فلترة التاريخ
      if (exportOptions.dateRange) {
        filteredData = filteredData.filter(item => {
          const itemDate = new Date(item.createdAt || item.date);
          const fromDate = exportOptions.dateRange!.from ? new Date(exportOptions.dateRange!.from) : null;
          const toDate = exportOptions.dateRange!.to ? new Date(exportOptions.dateRange!.to) : null;
          
          if (fromDate && itemDate < fromDate) return false;
          if (toDate && itemDate > toDate) return false;
          return true;
        });
      }

      const result = await exportService.exportWithOptions(filteredData, {
        ...exportOptions, // Pass all export options
        filters
      });

      setExportResult(result);
      
      if (!result.success) {
        logError(new Error(result.error || 'فشل التصدير'), 'ExportModal');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'خطأ في عملية التصدير'; // Catch any unexpected errors
      setExportResult({
        success: false,
        filename: '',
        downloadUrl: '',
        error: errorMessage
      });
      logError(error as Error, 'ExportModal');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePreview = () => {
    let filteredData = [...data]; // Start with a copy of the data
    
    // تطبيق فلترة التاريخ
    if (exportOptions.dateRange) {
      filteredData = filteredData.filter(item => {
        const itemDate = new Date(item.createdAt || item.date);
        const fromDate = exportOptions.dateRange!.from ? new Date(exportOptions.dateRange!.from) : null;
        const toDate = exportOptions.dateRange!.to ? new Date(exportOptions.dateRange!.to) : null;
        
        if (fromDate && itemDate < fromDate) return false;
        if (toDate && itemDate > toDate) return false;
        return true;
      });
    }

      // تطبيق فلترة الحقول المخصصة
      if (exportOptions.customFields && exportOptions.customFields.length > 0) {
        filteredData = filteredData.map(item => {
          const filtered: any = {};
          exportOptions.customFields!.forEach(field => { // Filter by custom fields
            filtered[field] = item[field];
          });
          return filtered;
        });
      }

    setPreviewData(filteredData.slice(0, 10)); // Show only first 10 records for preview
    setShowPreview(true); // Open preview modal
  };

  const handleFieldToggle = (fieldKey: string) => {
    setExportOptions(prev => ({
      ...prev,
      customFields: prev.customFields?.includes(fieldKey)
        ? prev.customFields.filter(f => f !== fieldKey)
        : [...(prev.customFields || []), fieldKey]
    })); // Toggle field selection
  };

  const getFormatIcon = (format: string) => {
    const option = formatOptions.find(f => f.value === format);
    return option ? option.icon : FileText;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`تصدير ${title}`} size="lg"> {/* Main modal component */}
      <div className="p-6 space-y-6">
        {/* Export Result */}
        {exportResult && (
          <div className={`p-4 rounded-lg border ${exportResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-center space-x-2 space-x-reverse">
              {exportResult.success ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600" />
              )}
              <span className={`font-medium ${exportResult.success ? 'text-green-800' : 'text-red-800'}`}>
                {exportResult.success ? 'تم التصدير بنجاح!' : `خطأ: ${exportResult.error}`}
              </span>
            </div>
          </div>
        )}

        {/* Export Format Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">صيغة التصدير</label>
          <div className="grid md:grid-cols-2 gap-3"> {/* Grid for format options */}
            {formatOptions.map((format) => {
              const IconComponent = format.icon;
              return (
                <div
                  key={format.value}
                  onClick={() => setExportOptions(prev => ({ ...prev, format: format.value as any }))}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    exportOptions.format === format.value
                      ? 'border-blue-500 bg-blue-50 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300'
                  }`} // Dynamic styling based on selection
                >
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <IconComponent className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{format.label}</p>
                      <p className="text-sm text-gray-600">{format.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Filename */}
        <Input
          label="اسم الملف"
          type="text"
          value={exportOptions.filename} // Filename input
          onChange={(e) => setExportOptions(prev => ({ ...prev, filename: e.target.value }))}
          placeholder="أدخل اسم الملف..."
        />

        {/* Date Range */}
        <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="من تاريخ"
              type="date"
              value={exportOptions.dateRange?.from || ''} // From date input
              onChange={(e) => setExportOptions(prev => ({
                ...prev,
                dateRange: { ...prev.dateRange, from: e.target.value, to: prev.dateRange?.to || '' }
              }))}
            />
            <Input
              label="إلى تاريخ"
              type="date"
              value={exportOptions.dateRange?.to || ''} // To date input
              onChange={(e) => setExportOptions(prev => ({
                ...prev,
                dateRange: { ...prev.dateRange, from: prev.dateRange?.from || '', to: e.target.value }
              }))}
            />
        </div>

        {/* Field Selection */}
        {availableFields.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">الحقول المراد تصديرها</label>
            <div className="grid md:grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-4">
              {availableFields.map((field) => ( // Checkbox for each available field
                <div key={field.key} className="flex items-center space-x-2 space-x-reverse">
                  <input
                    type="checkbox"
                    checked={exportOptions.customFields?.includes(field.key) || false}
                    onChange={() => handleFieldToggle(field.key)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label className="text-sm text-gray-700">{field.label}</label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Options */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2 space-x-reverse">
            <input
              type="checkbox" // Checkbox for including headers
              checked={exportOptions.includeHeaders !== false}
              onChange={(e) => setExportOptions(prev => ({ ...prev, includeHeaders: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label className="text-sm text-gray-700">تضمين رؤوس الأعمدة</label>
          </div>

          <Button
            variant="secondary"
            size="sm"
            icon={Eye}
            iconPosition="right"
            onClick={handlePreview}
            disabled={data.length === 0}
          >
            معاينة البيانات
          </Button>
        </div>

        {/* Actions */}
        <div className="flex space-x-3 space-x-reverse justify-end pt-4 border-t border-gray-200">
          <Button variant="secondary" onClick={onClose} disabled={isExporting}>
            إلغاء {/* Cancel button */}
          </Button>
          <Button 
            variant="primary" 
            icon={Download}
            iconPosition="right"
            onClick={handleExport}
            disabled={isExporting || data.length === 0}
            loading={isExporting} // Loading state for button
          >
            {isExporting ? 'جاري التصدير...' : `تصدير ${exportOptions.format.toUpperCase()}`}
          </Button>
        </div>

        {/* Preview Modal */}
        {showPreview && (
          <Modal
            isOpen={showPreview}
            onClose={() => setShowPreview(false)}
            title="معاينة البيانات"
            size="xl" // Large size for preview modal
          >
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  معاينة أول {Math.min(previewData.length, 10)} سجلات من إجمالي {data.length} سجل
                </p>
              </div>
              
              {previewData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {Object.keys(previewData[0]).map((key) => (
                          <th key={key} className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {availableFields.find(f => f.key === key)?.label || key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {previewData.map((row, index) => (
                        <tr key={index}>
                          {Object.values(row).map((value: any, cellIndex) => (
                            <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">لا توجد بيانات للمعاينة</p>
                </div>
              )}
              
              <div className="flex justify-end mt-6">
                <Button variant="secondary" onClick={() => setShowPreview(false)}>
                  إغلاق
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </Modal>
  );
}