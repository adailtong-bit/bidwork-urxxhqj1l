import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Camera, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { Badge } from '@/components/ui/badge'

export function ProfilePictureSettings({
  profile,
  onUpdate,
}: {
  profile: any
  onUpdate: (url: string) => void
}) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [uploading, setUploading] = useState(false)

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    try {
      setUploading(true)
      if (!event.target.files || event.target.files.length === 0)
        throw new Error('You must select an image.')
      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const filePath = `${user?.id}/${Math.random()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)
      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(filePath)

      await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user?.id)
      onUpdate(publicUrl)
      toast({ title: 'Success', description: 'Profile picture updated!' })
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error uploading',
        description: error.message,
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <div className="relative group">
            <Avatar className="h-32 w-32 border-4 border-muted">
              <AvatarImage
                src={
                  profile?.avatar_url ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.name}`
                }
              />
              <AvatarFallback>{profile?.name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <label
              htmlFor="avatar-upload"
              className="absolute inset-0 flex items-center justify-center bg-black/60 text-white opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-opacity"
            >
              {uploading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <Camera className="w-6 h-6" />
              )}
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
              disabled={uploading}
            />
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Click image to change. Recommended 256x256px.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Access Level</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <Badge
              variant={profile?.is_admin ? 'destructive' : 'default'}
              className="w-fit"
            >
              {profile?.is_admin ? 'Master Admin' : 'Standard User'}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Type:{' '}
              <strong className="uppercase">
                {profile?.entity_type || 'PF'}
              </strong>
            </span>
            <span className="text-sm text-muted-foreground capitalize">
              Role: <strong>{profile?.role || 'Contractor'}</strong>
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
