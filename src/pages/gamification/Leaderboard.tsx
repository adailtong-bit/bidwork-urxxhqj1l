import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Trophy, Crown } from 'lucide-react'
import { useLanguageStore } from '@/stores/useLanguageStore'

interface RankedUser {
  id: string
  name: string
  role: string
  points: number
  badges: string[]
  avatar: string
  rank: number
}

const mockRankedUsers: RankedUser[] = [
  {
    id: 'u1',
    name: 'João Silva',
    role: 'Pedreiro Master',
    points: 4500,
    badges: ['5-Star Pro', 'Fast Delivery', 'Top Rated'],
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=20',
    rank: 1,
  },
  {
    id: 'u2',
    name: 'Maria Oliveira',
    role: 'Eletricista',
    points: 4200,
    badges: ['Safety First', 'High Quality'],
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=21',
    rank: 2,
  },
  {
    id: 'u3',
    name: 'Carlos Tech',
    role: 'Dev Fullstack',
    points: 3900,
    badges: ['Code Ninja', 'Bug Hunter'],
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=22',
    rank: 3,
  },
  {
    id: 'u4',
    name: 'Ana Souza',
    role: 'Arquiteta',
    points: 3100,
    badges: ['Design Guru'],
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=23',
    rank: 4,
  },
  {
    id: 'u5',
    name: 'Roberto Santos',
    role: 'Encanador',
    points: 2800,
    badges: ['Quick Fix'],
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=24',
    rank: 5,
  },
]

export default function Leaderboard() {
  const { t } = useLanguageStore()
  const [category, setCategory] = useState('general')

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col gap-2 text-center md:text-left">
        <h1 className="text-3xl font-bold tracking-tight flex items-center justify-center md:justify-start gap-3">
          <Trophy className="h-8 w-8 text-yellow-500" />{' '}
          {t('leaderboard.title')}
        </h1>
        <p className="text-muted-foreground">{t('leaderboard.desc')}</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <div className="flex justify-center md:justify-start mb-6">
          <TabsList>
            <TabsTrigger value="general">
              {t('leaderboard.tab.general')}
            </TabsTrigger>
            <TabsTrigger value="construction">
              {t('leaderboard.tab.construction')}
            </TabsTrigger>
            <TabsTrigger value="tech">{t('leaderboard.tab.tech')}</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="general" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Top 2 */}
            <Card className="order-2 md:order-1 mt-4 md:mt-8 border-slate-200 bg-slate-50/50">
              <CardContent className="flex flex-col items-center pt-6">
                <div className="relative mb-4">
                  <Avatar className="h-20 w-20 border-4 border-slate-300">
                    <AvatarImage src={mockRankedUsers[1].avatar} />
                    <AvatarFallback>U2</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-3 -right-3 bg-slate-300 text-slate-800 rounded-full h-8 w-8 flex items-center justify-center font-bold border-2 border-white">
                    2
                  </div>
                </div>
                <h3 className="font-bold text-lg">{mockRankedUsers[1].name}</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {mockRankedUsers[1].role}
                </p>
                <Badge variant="secondary" className="mb-2">
                  {mockRankedUsers[1].points} {t('leaderboard.points')}
                </Badge>
              </CardContent>
            </Card>

            {/* Top 1 */}
            <Card className="order-1 md:order-2 border-yellow-200 bg-yellow-50/30 shadow-lg scale-105 z-10">
              <CardContent className="flex flex-col items-center pt-8">
                <Crown className="h-8 w-8 text-yellow-500 mb-2 animate-bounce" />
                <div className="relative mb-4">
                  <Avatar className="h-24 w-24 border-4 border-yellow-400">
                    <AvatarImage src={mockRankedUsers[0].avatar} />
                    <AvatarFallback>U1</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-3 -right-3 bg-yellow-400 text-yellow-900 rounded-full h-10 w-10 flex items-center justify-center font-bold border-2 border-white text-lg">
                    1
                  </div>
                </div>
                <h3 className="font-bold text-xl">{mockRankedUsers[0].name}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {mockRankedUsers[0].role}
                </p>
                <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white mb-2 px-3 py-1 text-base">
                  {mockRankedUsers[0].points} {t('leaderboard.points')}
                </Badge>
                <div className="flex gap-1 mt-2">
                  {mockRankedUsers[0].badges.map((b, i) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className="text-[10px] px-1 bg-white"
                    >
                      {b}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top 3 */}
            <Card className="order-3 border-orange-200 bg-orange-50/50 mt-4 md:mt-8">
              <CardContent className="flex flex-col items-center pt-6">
                <div className="relative mb-4">
                  <Avatar className="h-20 w-20 border-4 border-orange-300">
                    <AvatarImage src={mockRankedUsers[2].avatar} />
                    <AvatarFallback>U3</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-3 -right-3 bg-orange-300 text-orange-900 rounded-full h-8 w-8 flex items-center justify-center font-bold border-2 border-white">
                    3
                  </div>
                </div>
                <h3 className="font-bold text-lg">{mockRankedUsers[2].name}</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {mockRankedUsers[2].role}
                </p>
                <Badge variant="secondary" className="mb-2">
                  {mockRankedUsers[2].points} {t('leaderboard.points')}
                </Badge>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('leaderboard.complete_ranking')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockRankedUsers.slice(3).map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="font-bold text-muted-foreground w-6 text-center">
                        {user.rank}
                      </div>
                      <Avatar>
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold">{user.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {user.role}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="hidden md:flex gap-1">
                        {user.badges.map((b, i) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className="text-xs text-muted-foreground"
                          >
                            {b}
                          </Badge>
                        ))}
                      </div>
                      <div className="font-bold text-primary">
                        {user.points} {t('leaderboard.points')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {/* Placeholders for other tabs */}
        <TabsContent value="construction">
          <div className="text-center py-10 text-muted-foreground">
            {t('loading')}
          </div>
        </TabsContent>
        <TabsContent value="tech">
          <div className="text-center py-10 text-muted-foreground">
            {t('loading')}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
