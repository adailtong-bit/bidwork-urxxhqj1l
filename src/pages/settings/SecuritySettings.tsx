import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { ShieldAlert, ShieldCheck } from 'lucide-react'

export function SecuritySettings() {
  const { toast } = useToast()
  const [mfaEnrolled, setMfaEnrolled] = useState(false)
  const [qrCode, setQrCode] = useState<string>('')
  const [verifyCode, setVerifyCode] = useState('')
  const [factorId, setFactorId] = useState('')
  const [secret, setSecret] = useState('')

  useEffect(() => {
    checkMfaStatus()
  }, [])

  const checkMfaStatus = async () => {
    const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    setMfaEnrolled(data?.currentLevel === 'aal2' || data?.nextLevel === 'aal2')
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

  return (
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
              2-Step Authentication{' '}
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
              Open your authenticator app and scan the image below:
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
                <Button onClick={verifyMfa} disabled={verifyCode.length < 6}>
                  Verify and Activate
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
