import { useState } from 'react'
import { useTrainingStore } from '@/stores/useTrainingStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { GraduationCap, Clock, CheckCircle2, PlayCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function TrainingCenter() {
  const { user } = useAuthStore()
  const { courses, userCertifications, completeCourse } = useTrainingStore()
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState('courses')

  const handleStart = (id: string) => {
    toast({
      title: 'Inscrição realizada',
      description: 'Você pode começar o curso agora.',
    })
  }

  const handleCompleteMock = (id: string) => {
    if (!user) return
    completeCourse(user.id, id)
    toast({
      title: 'Curso Concluído!',
      description: 'Seu certificado foi emitido.',
    })
  }

  const isCompleted = (courseId: string) =>
    userCertifications.some((c) => c.courseId === courseId)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Centro de Treinamento
        </h1>
        <p className="text-muted-foreground">
          Cursos e certificações para impulsionar sua carreira.
        </p>
      </div>

      <Tabs
        defaultValue="courses"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList>
          <TabsTrigger value="courses">Cursos Disponíveis</TabsTrigger>
          <TabsTrigger value="my-certs">Meus Certificados</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card key={course.id} className="flex flex-col overflow-hidden">
                <div className="aspect-video bg-muted relative">
                  <img
                    src={course.imageUrl}
                    alt={course.title}
                    className="object-cover w-full h-full"
                  />
                  <Badge className="absolute top-2 left-2">
                    {course.category}
                  </Badge>
                </div>
                <CardHeader>
                  <CardTitle className="text-lg line-clamp-1">
                    {course.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {course.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" /> {course.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <GraduationCap className="h-4 w-4" /> {course.level}
                    </span>
                  </div>
                  <div className="text-sm">
                    Instrutor:{' '}
                    <span className="font-medium">{course.instructor}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  {isCompleted(course.id) ? (
                    <Button variant="secondary" className="w-full" disabled>
                      <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />{' '}
                      Concluído
                    </Button>
                  ) : (
                    <div className="flex gap-2 w-full">
                      <Button
                        className="flex-1"
                        onClick={() => handleStart(course.id)}
                      >
                        Inscrever-se
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleCompleteMock(course.id)}
                        title="Mock Complete"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="my-certs" className="mt-6">
          {userCertifications.length === 0 ? (
            <div className="text-center py-12 bg-muted/20 rounded-lg border-dashed border-2">
              <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">
                Nenhum certificado ainda
              </h3>
              <p className="text-muted-foreground">
                Complete cursos para ganhar certificações reconhecidas.
              </p>
              <Button className="mt-4" onClick={() => setActiveTab('courses')}>
                Ver Cursos
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {userCertifications.map((cert) => (
                <Card
                  key={cert.id}
                  className="flex flex-row items-center p-4 gap-4"
                >
                  <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                    <Trophy className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-lg">{cert.courseTitle}</h4>
                    <p className="text-sm text-muted-foreground">
                      Concluído em {cert.date.toLocaleDateString()}
                    </p>
                  </div>
                  <Button variant="outline">Baixar PDF</Button>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function Trophy(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  )
}
