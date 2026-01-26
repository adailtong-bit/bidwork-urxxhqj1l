import { create } from 'zustand'

export interface Course {
  id: string
  title: string
  category: string
  duration: string // e.g. "4h"
  level: 'Iniciante' | 'Intermediário' | 'Avançado'
  imageUrl: string
  description: string
  instructor: string
}

export interface Certification {
  id: string
  userId: string
  courseId: string
  courseTitle: string
  date: Date
  certificateUrl: string
}

interface TrainingState {
  courses: Course[]
  userCertifications: Certification[]
  enroll: (userId: string, courseId: string) => void
  completeCourse: (userId: string, courseId: string) => void
  getUserCertifications: (userId: string) => Certification[]
}

const mockCourses: Course[] = [
  {
    id: 'c-1',
    title: 'Segurança em Obras NR-18',
    category: 'Segurança',
    duration: '8h',
    level: 'Iniciante',
    imageUrl: 'https://img.usecurling.com/p/400/300?q=construction%20safety',
    description:
      'Curso obrigatório sobre normas de segurança no trabalho em construção civil.',
    instructor: 'Eng. Roberto Santos',
  },
  {
    id: 'c-2',
    title: 'Técnicas Avançadas de Alvenaria',
    category: 'Execução',
    duration: '12h',
    level: 'Avançado',
    imageUrl: 'https://img.usecurling.com/p/400/300?q=bricklayer%20working',
    description:
      'Aprenda métodos modernos para aumentar a produtividade e qualidade na alvenaria.',
    instructor: 'Mestre João Oliveira',
  },
  {
    id: 'c-3',
    title: 'Leitura de Projetos Estruturais',
    category: 'Engenharia',
    duration: '6h',
    level: 'Intermediário',
    imageUrl: 'https://img.usecurling.com/p/400/300?q=blueprint',
    description: 'Como interpretar plantas de forma e armação corretamente.',
    instructor: 'Arq. Maria Costa',
  },
]

export const useTrainingStore = create<TrainingState>((set, get) => ({
  courses: mockCourses,
  userCertifications: [
    {
      id: 'cert-1',
      userId: 'executor-1',
      courseId: 'c-1',
      courseTitle: 'Segurança em Obras NR-18',
      date: new Date(Date.now() - 86400000 * 60),
      certificateUrl: '#',
    },
  ],
  enroll: (userId, courseId) => {
    // Mock enrollment logic
    console.log(`User ${userId} enrolled in ${courseId}`)
  },
  completeCourse: (userId, courseId) =>
    set((state) => {
      const course = state.courses.find((c) => c.id === courseId)
      if (!course) return state

      return {
        userCertifications: [
          ...state.userCertifications,
          {
            id: Math.random().toString(36).substr(2, 9),
            userId,
            courseId,
            courseTitle: course.title,
            date: new Date(),
            certificateUrl: '#',
          },
        ],
      }
    }),
  getUserCertifications: (userId) =>
    get().userCertifications.filter((c) => c.userId === userId),
}))
