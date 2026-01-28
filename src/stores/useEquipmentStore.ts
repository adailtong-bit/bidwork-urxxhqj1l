import { create } from 'zustand'

export interface MaintenanceRecord {
  id: string
  date: Date
  description: string
  cost: number
  technician: string
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
    nextMaintenance: new Date(Date.now() + 86400000 * 15), // 15 days from now
    maintenanceHistory: [],
  },
  {
    id: 'eq-2',
    name: 'Betoneira 400L',
    type: 'Leve',
    serialNumber: 'BT-400-2022-A12',
    status: 'available',
    location: 'Depósito Central',
    purchaseDate: new Date('2022-05-20'),
    nextMaintenance: new Date(Date.now() - 86400000 * 2), // Overdue
    maintenanceHistory: [],
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
            status: 'available',
            location: 'Depósito Central',
            maintenanceHistory: [
              ...eq.maintenanceHistory,
              { ...record, id: Math.random().toString(36).substr(2, 9) },
            ],
            nextMaintenance: new Date(
              new Date().getTime() + 90 * 24 * 60 * 60 * 1000,
            ), // Schedule next for 90 days
          }
        }
        return eq
      }),
    })),
}))
