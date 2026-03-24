import { create } from 'zustand'

export interface MaintenanceRecord {
  id: string
  date: Date
  description: string
  cost: number
  technician: string
  receiptUrl?: string
  projectId?: string
}

export interface Equipment {
  id: string
  name: string
  type: string
  serialNumber: string
  status: 'available' | 'in_use' | 'maintenance'
  location: string
  projectId?: string
  projectName?: string
  purchaseDate: Date
  nextMaintenance: Date
  maintenanceHistory: MaintenanceRecord[]
  // Rental Fields
  rentalCondition?: string
  rentalValue?: number
  rentalStartDate?: Date
  rentalEndDate?: Date
  annualDepreciation?: number
  rentalDocumentUrl?: string
  // Preventive Maintenance Fields
  maintenanceThresholdHours?: number
  currentUsageHours?: number
}

interface EquipmentState {
  equipment: Equipment[]
  addEquipment: (item: Omit<Equipment, 'id' | 'maintenanceHistory'>) => void
  assignToProject: (
    equipmentId: string,
    projectId: string,
    projectName: string,
    location: string,
  ) => void
  returnEquipment: (equipmentId: string) => void
  scheduleMaintenance: (equipmentId: string, date: Date) => void
  performMaintenance: (
    equipmentId: string,
    record: Omit<MaintenanceRecord, 'id'>,
  ) => void
  updateEquipment: (id: string, data: Partial<Equipment>) => void
}

const mockEquipment: Equipment[] = [
  {
    id: 'eq-1',
    name: 'Retroescavadeira CAT 416',
    type: 'Pesado',
    serialNumber: 'CAT-416-2023-X99',
    status: 'in_use',
    location: 'Barueri, SP',
    projectId: 'proj-1',
    projectName: 'Residencial Alphaville',
    purchaseDate: new Date('2023-01-15'),
    nextMaintenance: new Date(Date.now() + 86400000 * 15),
    maintenanceHistory: [],
    rentalCondition: 'Nova',
    rentalValue: 2500,
    annualDepreciation: 15000,
    maintenanceThresholdHours: 500,
    currentUsageHours: 480, // Alert condition for testing
  },
  {
    id: 'eq-2',
    name: 'Betoneira 400L',
    type: 'Leve',
    serialNumber: 'BT-400-2022-A12',
    status: 'available',
    location: 'Depósito Central',
    purchaseDate: new Date('2022-05-20'),
    nextMaintenance: new Date(Date.now() - 86400000 * 2), // Late maintenance alert
    maintenanceHistory: [],
    annualDepreciation: 500,
    maintenanceThresholdHours: 1000,
    currentUsageHours: 600,
  },
  {
    id: 'eq-3',
    name: 'Andaime Tubular (Kit)',
    type: 'Estrutura',
    serialNumber: 'AND-2023-B55',
    status: 'maintenance',
    location: 'Oficina Mecânica',
    purchaseDate: new Date('2023-08-10'),
    nextMaintenance: new Date(Date.now() + 86400000 * 5),
    maintenanceHistory: [],
    rentalValue: 150,
  },
]

export const useEquipmentStore = create<EquipmentState>((set) => ({
  equipment: mockEquipment,
  addEquipment: (item) =>
    set((state) => ({
      equipment: [
        ...state.equipment,
        {
          ...item,
          id: Math.random().toString(36).substr(2, 9),
          maintenanceHistory: [],
        },
      ],
    })),
  assignToProject: (equipmentId, projectId, projectName, location) =>
    set((state) => ({
      equipment: state.equipment.map((eq) =>
        eq.id === equipmentId
          ? { ...eq, status: 'in_use', projectId, projectName, location }
          : eq,
      ),
    })),
  returnEquipment: (equipmentId) =>
    set((state) => ({
      equipment: state.equipment.map((eq) =>
        eq.id === equipmentId
          ? {
              ...eq,
              status: 'available',
              location: 'Depósito Central',
              projectId: undefined,
              projectName: undefined,
            }
          : eq,
      ),
    })),
  scheduleMaintenance: (equipmentId, date) =>
    set((state) => ({
      equipment: state.equipment.map((eq) =>
        eq.id === equipmentId ? { ...eq, nextMaintenance: date } : eq,
      ),
    })),
  performMaintenance: (equipmentId, record) =>
    set((state) => ({
      equipment: state.equipment.map((eq) => {
        if (eq.id === equipmentId) {
          return {
            ...eq,
            status: eq.projectId ? 'in_use' : 'available',
            location: eq.projectId ? eq.location : 'Depósito Central',
            maintenanceHistory: [
              ...eq.maintenanceHistory,
              { ...record, id: Math.random().toString(36).substr(2, 9) },
            ],
            nextMaintenance: new Date(
              new Date().getTime() + 90 * 24 * 60 * 60 * 1000,
            ),
            currentUsageHours: 0, // Reset usage
          }
        }
        return eq
      }),
    })),
  updateEquipment: (id, data) =>
    set((state) => ({
      equipment: state.equipment.map((e) =>
        e.id === id ? { ...e, ...data } : e,
      ),
    })),
}))
