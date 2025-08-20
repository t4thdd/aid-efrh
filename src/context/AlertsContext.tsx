import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { mockAlerts, type Alert } from '../data/mockData';
import { useErrorLogger } from '../utils/errorLogger';

interface AlertsContextType {
  alerts: Alert[];
  unreadAlerts: Alert[];
  criticalAlerts: Alert[];
  highPriorityAlerts: Alert[];
  recentAlerts: Alert[];
  addAlert: (alert: Omit<Alert, 'id' | 'createdAt' | 'isRead'>) => void;
  markAsRead: (alertId: string) => void;
  markAllAsRead: () => void;
  removeAlert: (alertId: string) => void;
  clearAllAlerts: () => void;
  updateAlertPriority: (alertId: string, priority: Alert['priority']) => void;
  getAlertsByType: (type: Alert['type']) => Alert[];
  getAlertsByPriority: (priority: Alert['priority']) => Alert[];
  createAutomaticAlert: (type: Alert['type'], relatedId: string, relatedType: Alert['relatedType'], data: any) => void;
}

const AlertsContext = createContext<AlertsContextType | undefined>(undefined);

export const useAlerts = () => {
  const context = useContext(AlertsContext);
  if (context === undefined) {
    throw new Error('useAlerts must be used within an AlertsProvider');
  }
  return context;
};

interface AlertsProviderProps {
  children: ReactNode;
}

export const AlertsProvider: React.FC<AlertsProviderProps> = ({ children }) => {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const { logInfo, logWarning } = useErrorLogger();

  // Computed values
  const unreadAlerts = alerts.filter(alert => !alert.isRead);
  const criticalAlerts = alerts.filter(alert => alert.priority === 'critical' && !alert.isRead);
  const highPriorityAlerts = alerts.filter(alert => alert.priority === 'high' && !alert.isRead);
  const recentAlerts = alerts
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  const addAlert = (alertData: Omit<Alert, 'id' | 'createdAt' | 'isRead'>) => {
    const newAlert: Alert = {
      ...alertData,
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      isRead: false
    };

    setAlerts(prev => [newAlert, ...prev]);
    logInfo(`تم إضافة تنبيه جديد: ${newAlert.title}`, 'AlertsContext');

    // إشعار المتصفح للتنبيهات الحرجة
    if (newAlert.priority === 'critical' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(`تنبيه حرج: ${newAlert.title}`, {
          body: newAlert.description,
          icon: '/vite.svg'
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification(`تنبيه حرج: ${newAlert.title}`, {
              body: newAlert.description,
              icon: '/vite.svg'
            });
          }
        });
      }
    }
  };

  const markAsRead = (alertId: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, isRead: true }
          : alert
      )
    );
    logInfo(`تم وضع علامة كمقروء للتنبيه: ${alertId}`, 'AlertsContext');
  };

  const markAllAsRead = () => {
    const unreadCount = unreadAlerts.length;
    setAlerts(prev => 
      prev.map(alert => ({ ...alert, isRead: true }))
    );
    logInfo(`تم وضع علامة كمقروء لجميع التنبيهات (${unreadCount})`, 'AlertsContext');
  };

  const removeAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    logInfo(`تم حذف التنبيه: ${alertId}`, 'AlertsContext');
  };

  const clearAllAlerts = () => {
    const alertsCount = alerts.length;
    setAlerts([]);
    logWarning(`تم حذف جميع التنبيهات (${alertsCount})`, 'AlertsContext');
  };

  const updateAlertPriority = (alertId: string, priority: Alert['priority']) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, priority }
          : alert
      )
    );
    logInfo(`تم تحديث أولوية التنبيه ${alertId} إلى ${priority}`, 'AlertsContext');
  };

  const getAlertsByType = (type: Alert['type']) => {
    return alerts.filter(alert => alert.type === type);
  };

  const getAlertsByPriority = (priority: Alert['priority']) => {
    return alerts.filter(alert => alert.priority === priority);
  };

  const createAutomaticAlert = (
    type: Alert['type'], 
    relatedId: string, 
    relatedType: Alert['relatedType'], 
    data: any
  ) => {
    let title = '';
    let description = '';
    let priority: Alert['priority'] = 'medium';

    switch (type) {
      case 'delayed':
        title = 'طرد متأخر';
        description = `الطرد ${data.packageName || 'غير محدد'} متأخر عن الموعد المحدد`;
        priority = data.delayHours > 48 ? 'critical' : data.delayHours > 24 ? 'high' : 'medium';
        break;
      case 'failed':
        title = 'فشل في التسليم';
        description = `فشل تسليم الطرد ${data.packageName || 'غير محدد'} - ${data.reason || 'سبب غير محدد'}`;
        priority = 'high';
        break;
      case 'expired':
        title = 'انتهاء صلاحية';
        description = `الطرد ${data.packageName || 'غير محدد'} قارب على انتهاء الصلاحية`;
        priority = data.daysUntilExpiry <= 1 ? 'critical' : 'medium';
        break;
      case 'urgent':
        title = data.title || 'حالة عاجلة';
        description = data.description || 'تتطلب تدخل فوري';
        priority = 'critical';
        break;
    }

    addAlert({
      type,
      title,
      description,
      relatedId,
      relatedType,
      priority,
      isRead: false
    });
  };

  const value = {
    alerts,
    unreadAlerts,
    criticalAlerts,
    highPriorityAlerts,
    recentAlerts,
    addAlert,
    markAsRead,
    markAllAsRead,
    removeAlert,
    clearAllAlerts,
    updateAlertPriority,
    getAlertsByType,
    getAlertsByPriority,
    createAutomaticAlert
  };

  return (
    <AlertsContext.Provider value={value}>
      {children}
    </AlertsContext.Provider>
  );
};