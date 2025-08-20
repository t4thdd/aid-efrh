import { useState, useEffect, useMemo } from 'react';
import { type Beneficiary, mockBeneficiaries } from '../data/mockData';
import { useErrorLogger } from '../utils/errorLogger';
import * as Sentry from '@sentry/react';

interface UseBeneficiariesOptions {
  searchTerm?: string;
  statusFilter?: string;
  regionFilter?: string;
  identityStatusFilter?: string;
}

export const useBeneficiaries = (options: UseBeneficiariesOptions = {}) => {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { logInfo, logError } = useErrorLogger();

  // جلب البيانات
  useEffect(() => {
    const fetchBeneficiaries = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // محاكاة تأخير الشبكة
        await new Promise(resolve => setTimeout(resolve, 300));
        
        setBeneficiaries([...mockBeneficiaries]);
        logInfo(`تم تحميل ${mockBeneficiaries.length} مستفيد`, 'useBeneficiaries');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'خطأ في تحميل المستفيدين';
        setError(errorMessage);
        Sentry.captureException(err instanceof Error ? err : new Error(errorMessage));
        logError(new Error(errorMessage), 'useBeneficiaries');
      } finally {
        setLoading(false);
      }
    };

    fetchBeneficiaries();
  }, [logInfo, logError]);

  // فلترة البيانات
  const filteredBeneficiaries = useMemo(() => {
    let filtered = [...beneficiaries];

    // فلترة البحث
    if (options.searchTerm) {
      const searchLower = options.searchTerm.toLowerCase();
      filtered = filtered.filter(ben => 
        ben.name.toLowerCase().includes(searchLower) ||
        ben.nationalId.includes(options.searchTerm!) ||
        ben.phone.includes(options.searchTerm!)
      );
    }

    // فلترة الحالة
    if (options.statusFilter && options.statusFilter !== 'all') {
      filtered = filtered.filter(ben => ben.status === options.statusFilter);
    }

    // فلترة المنطقة
    if (options.regionFilter && options.regionFilter !== 'all') {
      filtered = filtered.filter(ben => 
        ben.detailedAddress.governorate.includes(options.regionFilter!)
      );
    }

    // فلترة حالة الهوية
    if (options.identityStatusFilter && options.identityStatusFilter !== 'all') {
      filtered = filtered.filter(ben => ben.identityStatus === options.identityStatusFilter);
    }

    return filtered;
  }, [beneficiaries, options.searchTerm, options.statusFilter, options.regionFilter, options.identityStatusFilter]);

  // إحصائيات
  const statistics = useMemo(() => {
    return {
      total: beneficiaries.length,
      verified: beneficiaries.filter(ben => ben.identityStatus === 'verified').length,
      pending: beneficiaries.filter(ben => ben.identityStatus === 'pending').length,
      rejected: beneficiaries.filter(ben => ben.identityStatus === 'rejected').length,
      active: beneficiaries.filter(ben => ben.status === 'active').length,
      totalPackages: beneficiaries.reduce((sum, ben) => sum + ben.totalPackages, 0)
    };
  }, [beneficiaries]);

  // وظائف CRUD (محاكاة)
  const addBeneficiary = async (benData: Partial<Beneficiary>) => {
    try {
      setLoading(true);
      
      const newBeneficiary: Beneficiary = {
        id: `ben-${Date.now()}`,
        name: benData.name || '',
        nationalId: benData.nationalId || '',
        phone: benData.phone || '',
        address: benData.address || '',
        detailedAddress: benData.detailedAddress || {
          governorate: '',
          district: '',
          neighborhood: '',
          street: '',
          buildingNumber: '',
          floor: '',
          apartment: ''
        },
        familySize: benData.familySize || 1,
        totalPackages: 0,
        lastReceived: benData.lastReceived || null,
        status: 'pending',
        identityStatus: 'pending',
        notes: benData.notes || '',
        createdAt: new Date().toISOString()
      };

      setBeneficiaries(prev => [newBeneficiary, ...prev]);
      logInfo(`تم إضافة مستفيد جديد: ${newBeneficiary.name}`, 'useBeneficiaries');
      return newBeneficiary;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطأ في إضافة المستفيد';
      setError(errorMessage);
      logError(new Error(errorMessage), 'useBeneficiaries');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateBeneficiary = async (id: string, updates: Partial<Beneficiary>) => {
    try {
      setLoading(true);
      
      setBeneficiaries(prev => 
        prev.map(ben => 
          ben.id === id 
            ? { ...ben, ...updates }
            : ben
        )
      );
      
      logInfo(`تم تحديث المستفيد: ${id}`, 'useBeneficiaries');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطأ في تحديث المستفيد';
      setError(errorMessage);
      logError(new Error(errorMessage), 'useBeneficiaries');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteBeneficiary = async (id: string) => {
    try {
      setLoading(true);
      
      setBeneficiaries(prev => prev.filter(ben => ben.id !== id));
      logInfo(`تم حذف المستفيد: ${id}`, 'useBeneficiaries');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطأ في حذف المستفيد';
      setError(errorMessage);
      logError(new Error(errorMessage), 'useBeneficiaries');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    setBeneficiaries([...mockBeneficiaries]);
  };

  return {
    beneficiaries: filteredBeneficiaries,
    allBeneficiaries: beneficiaries,
    loading,
    error,
    statistics,
    addBeneficiary,
    updateBeneficiary,
    deleteBeneficiary,
    refetch
  };
};

// Hook للحصول على مستفيد واحد
export const useBeneficiary = (id: string) => {
  const [beneficiary, setBeneficiary] = useState<Beneficiary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      setLoading(true);
      const found = mockBeneficiaries.find(ben => ben.id === id);
      setBeneficiary(found || null);
      setError(found ? null : 'المستفيد غير موجود');
      setLoading(false);
    }
  }, [id]);

  return { beneficiary, loading, error };
};