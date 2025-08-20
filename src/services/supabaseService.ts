import { 
  mockBeneficiaries, 
  mockOrganizations, 
  mockFamilies, 
  mockPackages, 
  mockTasks, 
  mockAlerts, 
  mockActivityLog, 
  mockCouriers,
  mockPackageTemplates,
  mockRoles,
  mockSystemUsers,
  mockPermissions,
  calculateStats,
  type Beneficiary,
  type Organization,
  type Family,
  type Package as PackageType,
  type Task,
  type Alert,
  type ActivityLog,
  type Courier,
  type PackageTemplate,
  type Role,
  type SystemUser,
  type Permission
} from '../data/mockData';
import * as Sentry from '@sentry/react';

const simulateNetworkDelay = (ms: number = 500) => 
  new Promise(resolve => setTimeout(resolve, ms));

export const beneficiariesService = {
  async getAll(): Promise<Beneficiary[]> {
    await simulateNetworkDelay();
    return [...mockBeneficiaries];
  },

  async getAllDetailed(): Promise<Beneficiary[]> {
    await simulateNetworkDelay();
    return [...mockBeneficiaries];
  },

  async search(searchTerm: string): Promise<Beneficiary[]> {
    await simulateNetworkDelay();
    return mockBeneficiaries.filter(b => 
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.nationalId.includes(searchTerm) ||
      b.phone.includes(searchTerm)
    );
  },

  async getById(id: string): Promise<Beneficiary | null> {
    await simulateNetworkDelay();
    return mockBeneficiaries.find(b => b.id === id) || null;
  },

  async getByOrganization(organizationId: string): Promise<Beneficiary[]> {
    await simulateNetworkDelay();
    return mockBeneficiaries.filter(b => b.organizationId === organizationId);
  },

  async getByFamily(familyId: string): Promise<Beneficiary[]> {
    await simulateNetworkDelay();
    return mockBeneficiaries.filter(b => b.familyId === familyId);
  },

  async create(beneficiary: any): Promise<Beneficiary> {
    await simulateNetworkDelay();
    
    Sentry.addBreadcrumb({
      message: 'Creating new beneficiary',
      category: 'beneficiary',
      data: { name: beneficiary.name, nationalId: beneficiary.nationalId }
    });
    
    const newBeneficiary: Beneficiary = {
      id: `new-${Date.now()}`,
      name: beneficiary.name,
      fullName: beneficiary.fullName,
      nationalId: beneficiary.nationalId,
      dateOfBirth: beneficiary.dateOfBirth,
      gender: beneficiary.gender,
      phone: beneficiary.phone,
      address: beneficiary.address,
      detailedAddress: beneficiary.detailedAddress,
      location: beneficiary.location || { lat: 31.3469, lng: 34.3029 },
      organizationId: beneficiary.organizationId,
      familyId: beneficiary.familyId,
      relationToFamily: beneficiary.relationToFamily,
      profession: beneficiary.profession,
      maritalStatus: beneficiary.maritalStatus,
      economicLevel: beneficiary.economicLevel,
      membersCount: beneficiary.membersCount,
      additionalDocuments: beneficiary.additionalDocuments || [],
      identityStatus: 'pending',
      identityImageUrl: beneficiary.identityImageUrl,
      status: 'active',
      eligibilityStatus: 'under_review',
      lastReceived: new Date().toISOString().split('T')[0],
      totalPackages: 0,
      notes: beneficiary.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'admin',
      updatedBy: 'admin'
    };
    
    mockBeneficiaries.unshift(newBeneficiary);
    return newBeneficiary;
  },

  async update(id: string, updates: any): Promise<Beneficiary> {
    await simulateNetworkDelay();
    const index = mockBeneficiaries.findIndex(b => b.id === id);
    if (index === -1) {
      throw new Error('المستفيد غير موجود');
    }
    
    mockBeneficiaries[index] = {
      ...mockBeneficiaries[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    return mockBeneficiaries[index];
  },

  async delete(id: string): Promise<void> {
    await simulateNetworkDelay();
    const index = mockBeneficiaries.findIndex(b => b.id === id);
    if (index !== -1) {
      mockBeneficiaries.splice(index, 1);
    }
  }
};

export const organizationsService = {
  async getAll(): Promise<Organization[]> {
    await simulateNetworkDelay();
    return [...mockOrganizations];
  },

  async getActive(): Promise<Organization[]> {
    await simulateNetworkDelay();
    return mockOrganizations.filter(org => org.status === 'active');
  },

  async getById(id: string): Promise<Organization | null> {
    await simulateNetworkDelay();
    return mockOrganizations.find(org => org.id === id) || null;
  }
};

export const familiesService = {
  async getAll(): Promise<Family[]> {
    await simulateNetworkDelay();
    return [...mockFamilies];
  },

  async getById(id: string): Promise<Family | null> {
    await simulateNetworkDelay();
    return mockFamilies.find(f => f.id === id) || null;
  }
};

export const packagesService = {
  async getAll(): Promise<PackageType[]> {
    await simulateNetworkDelay();
    return [...mockPackages];
  },

  async getByBeneficiary(beneficiaryId: string): Promise<PackageType[]> {
    await simulateNetworkDelay();
    return mockPackages.filter(p => p.beneficiaryId === beneficiaryId);
  },

  async create(packageData: any): Promise<PackageType> {
    await simulateNetworkDelay();
    const newPackage: PackageType = {
      id: `pkg-${Date.now()}`,
      name: packageData.name,
      type: packageData.type,
      description: packageData.description,
      value: packageData.value,
      funder: packageData.funder,
      organizationId: packageData.organizationId,
      familyId: packageData.familyId,
      beneficiaryId: packageData.beneficiaryId,
      status: 'pending',
      createdAt: new Date().toISOString(),
      deliveredAt: packageData.deliveredAt,
      expiryDate: packageData.expiryDate
    };
    
    mockPackages.unshift(newPackage);
    return newPackage;
  }
};

export const packageTemplatesService = {
  async getAll(): Promise<PackageTemplate[]> {
    await simulateNetworkDelay();
    return [...mockPackageTemplates];
  },

  async getByOrganization(organizationId: string): Promise<PackageTemplate[]> {
    await simulateNetworkDelay();
    return mockPackageTemplates.filter(t => t.organization_id === organizationId);
  },

  async createWithItems(template: any, items: any[]): Promise<PackageTemplate> {
    await simulateNetworkDelay();
    const newTemplate: PackageTemplate = {
      id: `template-${Date.now()}`,
      name: template.name,
      type: template.type,
      organization_id: template.organization_id,
      description: template.description,
      contents: items,
      status: 'active',
      createdAt: new Date().toISOString(),
      usageCount: 0,
      totalWeight: items.reduce((sum, item) => sum + (item.weight || 0), 0),
      estimatedCost: template.estimatedCost || 0
    };
    
    mockPackageTemplates.unshift(newTemplate);
    return newTemplate;
  }
};

export const tasksService = {
  async getAll(): Promise<Task[]> {
    await simulateNetworkDelay();
    return [...mockTasks];
  },

  async getByBeneficiary(beneficiaryId: string): Promise<Task[]> {
    await simulateNetworkDelay();
    return mockTasks.filter(t => t.beneficiaryId === beneficiaryId);
  },

  async updateStatus(id: string, status: Task['status'], updates?: any): Promise<Task> {
    await simulateNetworkDelay();
    const index = mockTasks.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error('المهمة غير موجودة');
    }
    
    mockTasks[index] = {
      ...mockTasks[index],
      status,
      ...updates
    };
    
    return mockTasks[index];
  }
};

export const alertsService = {
  async getAll(): Promise<Alert[]> {
    await simulateNetworkDelay();
    return [...mockAlerts];
  },

  async getUnread(): Promise<Alert[]> {
    await simulateNetworkDelay();
    return mockAlerts.filter(a => !a.isRead);
  },

  async markAsRead(id: string): Promise<void> {
    await simulateNetworkDelay();
    const alert = mockAlerts.find(a => a.id === id);
    if (alert) {
      alert.isRead = true;
    }
  }
};

export const activityLogService = {
  async getAll(): Promise<ActivityLog[]> {
    await simulateNetworkDelay();
    return [...mockActivityLog];
  },

  async getByBeneficiary(beneficiaryId: string): Promise<ActivityLog[]> {
    await simulateNetworkDelay();
    return mockActivityLog.filter(a => a.beneficiaryId === beneficiaryId);
  }
};

export const couriersService = {
  async getAll(): Promise<Courier[]> {
    await simulateNetworkDelay();
    return [...mockCouriers];
  },

  async getAllWithPerformance(): Promise<Courier[]> {
    await simulateNetworkDelay();
    return [...mockCouriers];
  },

  async updateLocation(courierId: string, location: any): Promise<any> {
    await simulateNetworkDelay();
    const courier = mockCouriers.find(c => c.id === courierId);
    if (courier) {
      courier.currentLocation = { lat: location.latitude, lng: location.longitude };
    }
    return { success: true };
  }
};

export const rolesService = {
  async getAll(): Promise<Role[]> {
    await simulateNetworkDelay();
    return [...mockRoles];
  }
};

export const systemUsersService = {
  async getAll(): Promise<SystemUser[]> {
    await simulateNetworkDelay();
    return [...mockSystemUsers];
  }
};

export const permissionsService = {
  async getAll(): Promise<Permission[]> {
    await simulateNetworkDelay();
    return [...mockPermissions];
  }
};

export const statisticsService = {
  async getOverallStats(): Promise<any> {
    await simulateNetworkDelay();
    return calculateStats();
  },

  async getGeographicStats(): Promise<any[]> {
    await simulateNetworkDelay();
    return [
      { area_name: 'خان يونس', total_beneficiaries: 156, delivered_packages: 89, pending_packages: 23, success_rate: 79.5 },
      { area_name: 'غزة', total_beneficiaries: 234, delivered_packages: 187, pending_packages: 34, success_rate: 84.6 },
      { area_name: 'رفح', total_beneficiaries: 98, delivered_packages: 67, pending_packages: 18, success_rate: 78.8 },
      { area_name: 'الوسطى', total_beneficiaries: 123, delivered_packages: 95, pending_packages: 15, success_rate: 86.4 },
      { area_name: 'شمال غزة', total_beneficiaries: 87, delivered_packages: 62, pending_packages: 12, success_rate: 83.8 }
    ];
  },

  async generateComprehensiveReport(startDate?: string, endDate?: string): Promise<any> {
    await simulateNetworkDelay();
    const stats = calculateStats();
    return {
      period: {
        start_date: startDate || '2024-01-01',
        end_date: endDate || new Date().toISOString().split('T')[0]
      },
      beneficiaries: {
        total: stats.totalBeneficiaries,
        verified: Math.floor(stats.totalBeneficiaries * 0.85),
        active: Math.floor(stats.totalBeneficiaries * 0.92)
      },
      packages: {
        total: stats.totalPackages,
        delivered: stats.deliveredPackages,
        pending: stats.totalPackages - stats.deliveredPackages
      },
      performance: {
        delivery_rate: stats.deliveryRate,
        average_delivery_time: 2.3
      },
      geographic_distribution: await this.getGeographicStats()
    };
  }
};

export const systemService = {
  async createAutomaticAlerts(): Promise<void> {
    await simulateNetworkDelay();
  },

  async calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): Promise<number> {
    await simulateNetworkDelay();
    const R = 6371; // نصف قطر الأرض بالكيلومتر
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  },

  async generateTrackingNumber(): Promise<string> {
    await simulateNetworkDelay();
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `TRK-${date}-${random}`;
  }
};

export const inventoryService = {
  async getByDistributionCenter(centerId: string): Promise<any[]> {
    await simulateNetworkDelay();
    return [];
  },

  async getLowStock(): Promise<any[]> {
    await simulateNetworkDelay();
    return [];
  }
};

export const categoriesService = {
  async getAllBeneficiaryCategories(): Promise<any[]> {
    await simulateNetworkDelay();
    return [];
  }
};

export const notificationsService = {
  async send(notification: any): Promise<any> {
    await simulateNetworkDelay();
    return { success: true };
  },

  async getByUser(userId: string): Promise<any[]> {
    await simulateNetworkDelay();
    return [];
  }
};

export const feedbackService = {
  async create(feedback: any): Promise<any> {
    await simulateNetworkDelay();
    return { success: true };
  },

  async getByCourier(courierId: string): Promise<any[]> {
    await simulateNetworkDelay();
    return [];
  }
};

export const geographicService = {
  async getAllAreas(): Promise<any[]> {
    await simulateNetworkDelay();
    return [];
  },

  async getByType(type: string): Promise<any[]> {
    await simulateNetworkDelay();
    return [];
  }
};

export const distributionCentersService = {
  async getAll(): Promise<any[]> {
    await simulateNetworkDelay();
    return [];
  },

  async getActive(): Promise<any[]> {
    await simulateNetworkDelay();
    return [];
  }
};

export const settingsService = {
  async getSetting(category: string, key: string): Promise<any> {
    await simulateNetworkDelay();
    return null;
  },

  async updateSetting(category: string, key: string, value: string): Promise<any> {
    await simulateNetworkDelay();
    return { success: true };
  },

  async getByCategory(category: string): Promise<any[]> {
    await simulateNetworkDelay();
    return [];
  }
};

export const emergencyContactsService = {
  async getByBeneficiary(beneficiaryId: string): Promise<any[]> {
    await simulateNetworkDelay();
    return [];
  },

  async create(contact: any): Promise<any> {
    await simulateNetworkDelay();
    return { success: true };
  }
};

export const reportsService = {
  async generateReport(type: string, parameters: any = {}): Promise<any> {
    await simulateNetworkDelay();
    return await statisticsService.generateComprehensiveReport(
      parameters.start_date,
      parameters.end_date
    );
  }
};