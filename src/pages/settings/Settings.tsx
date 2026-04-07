import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'
import { ShieldAlert, ShieldCheck, Loader2, Camera } from 'lucide-react'

export default function Settings() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  const [mfaEnrolled, setMfaEnrolled] = useState(false)
  const [qrCode, setQrCode] = useState<string>('')
  const [verifyCode, setVerifyCode] = useState('')
  const [factorId, setFactorId] = useState('')
  const [secret, setSecret] = useState('')

  useEffect(() => {
    if (user) {
      fetchProfile()
      checkMfaStatus()
    }
  }, [user])

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error: any) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const checkMfaStatus = async () => {
    const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    if (data?.currentLevel === 'aal2' || data?.nextLevel === 'aal2') {
      setMfaEnrolled(true)
    } else {
      setMfaEnrolled(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: profile.name,
          phone: profile.phone,
        })
        .eq('id', user?.id)

      if (error) throw error
      toast({ title: 'Success', description: 'Profile updated successfully.' })
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      })
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    try {
      setUploading(true)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image.')
      }

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
      setProfile({ ...profile, avatar_url: publicUrl })

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

  const enrollMfa = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
      })
      if (error) throw error
      setFactorId(data.id)
      setQrCode(data.totp.qr_code)
      setSecret(data.totp.secret)
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'MFA Error',
        description: error.message,
      })
    }
  }

  const verifyMfa = async () => {
    try {
      const challenge = await supabase.auth.mfa.challenge({ factorId })
      if (challenge.error) throw challenge.error

      const verify = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.data.id,
        code: verifyCode,
      })

      if (verify.error) throw verify.error

      toast({ title: 'Success', description: 'MFA activated successfully!' })
      setMfaEnrolled(true)
      setQrCode('')
      setSecret('')
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Verification Error',
        description: error.message,
      })
    }
  }

  const disableMfa = async () => {
    try {
      const { data } = await supabase.auth.mfa.listFactors()
      const totpFactor = data?.totp[0]
      if (totpFactor) {
        const { error } = await supabase.auth.mfa.unenroll({
          factorId: totpFactor.id,
        })
        if (error) throw error
        setMfaEnrolled(false)
        toast({
          title: 'MFA Disabled',
          description: 'Two-factor authentication has been removed.',
        })
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      })
    }
  }

  if (loading)
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your profile and security options.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
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
                  <AvatarFallback>
                    {profile?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
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

        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your basic details.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid gap-2">
                  <Label>Email (Login)</Label>
                  <Input
                    value={user?.email || ''}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Full Name</Label>
                  <Input
                    value={profile?.name || ''}
                    onChange={(e) =>
                      setProfile({ ...profile, name: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Phone / Mobile</Label>
                  <Input
                    value={profile?.phone || ''}
                    onChange={(e) =>
                      setProfile({ ...profile, phone: e.target.value })
                    }
                  />
                </div>
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Security <ShieldAlert className="w-5 h-5 text-primary" />
              </CardTitle>
              <CardDescription>
                Protect your account with multi-factor authentication (MFA).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium flex items-center gap-2">
                    2-Step Authentication
                    {mfaEnrolled && (
                      <ShieldCheck className="w-4 h-4 text-green-500" />
                    )}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {mfaEnrolled
                      ? 'MFA is active on your account.'
                      : 'Add an extra layer of security.'}
                  </p>
                </div>
                {mfaEnrolled ? (
                  <Button variant="destructive" onClick={disableMfa}>
                    Disable MFA
                  </Button>
                ) : (
                  <Button onClick={enrollMfa}>Configure MFA</Button>
                )}
              </div>

              {qrCode && !mfaEnrolled && (
                <div className="p-4 border rounded-lg space-y-4 bg-muted/30">
                  <h4 className="font-medium">1. Scan the QR Code</h4>
                  <p className="text-sm text-muted-foreground">
                    Open your authenticator app (Google Authenticator, Authy,
                    etc) and scan the image below:
                  </p>
                  <div
                    className="bg-white p-4 w-fit rounded-md mx-auto"
                    dangerouslySetInnerHTML={{ __html: qrCode }}
                  />
                  <p className="text-xs text-center text-muted-foreground break-all">
                    Secret: {secret}
                  </p>

                  <div className="pt-4 border-t space-y-4">
                    <h4 className="font-medium">2. Enter the generated code</h4>
                    <div className="flex items-center gap-4">
                      <Input
                        placeholder="000000"
                        value={verifyCode}
                        onChange={(e) => setVerifyCode(e.target.value)}
                        className="max-w-[150px] text-center tracking-widest font-mono"
                        maxLength={6}
                      />
                      <Button
                        onClick={verifyMfa}
                        disabled={verifyCode.length < 6}
                      >
                        Verify and Activate
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
