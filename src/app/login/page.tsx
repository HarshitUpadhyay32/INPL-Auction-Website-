'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { LogIn, Shield, Users, Eye, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'

type LoginMode = 'select' | 'admin' | 'team'

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 mr-2">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
)

export default function LoginPage() {
  const [mode, setMode] = useState<LoginMode>('select')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`
        }
      })
      if (error) throw error
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message || 'Error connecting to Google')
      } else {
        toast.error('Error connecting to Google')
      }
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        toast.error(error.message)
        return
      }

      // Get user role to redirect
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (profile?.role === 'ADMIN') {
          router.push('/admin')
        } else if (profile?.role === 'TEAM') {
          router.push('/team')
        } else {
          router.push('/')
        }
        toast.success('Logged in successfully')
      }
    } catch {
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 pt-28">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-inpl-neon/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-inpl-electric/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-inpl-neon to-inpl-neon-dark flex items-center justify-center">
              <span className="text-surface-primary font-bold text-lg font-display">IN</span>
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold font-display text-text-primary">INPL</h1>
              <p className="text-xs text-text-muted tracking-wider">SEASON 3</p>
            </div>
          </Link>
        </div>

        {/* Role Selection */}
        {mode === 'select' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <h2 className="text-xl font-semibold font-display text-text-primary text-center mb-6">
              Select Login Type
            </h2>

            <Card
              glass
              hover
              glow="gold"
              className="cursor-pointer"
              onClick={() => setMode('admin')}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-inpl-neon/10">
                  <Shield className="w-6 h-6 text-inpl-neon" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-text-primary font-display">Admin / Auctioneer</h3>
                  <p className="text-sm text-text-secondary">Manage the auction, teams, and players</p>
                </div>
                <ArrowLeft className="w-4 h-4 text-text-muted rotate-180" />
              </div>
            </Card>

            <Card
              glass
              hover
              glow="blue"
              className="cursor-pointer"
              onClick={() => setMode('team')}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-inpl-electric/10">
                  <Users className="w-6 h-6 text-inpl-electric" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-text-primary font-display">Team</h3>
                  <p className="text-sm text-text-secondary">Place bids and manage your squad</p>
                </div>
                <ArrowLeft className="w-4 h-4 text-text-muted rotate-180" />
              </div>
            </Card>

            <div className="text-center pt-4">
              <Link
                href="/live"
                className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors"
              >
                <Eye size={14} />
                Watch as spectator instead
              </Link>
            </div>
          </motion.div>
        )}

        {/* Login Form */}
        {(mode === 'admin' || mode === 'team') && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card glass glow={mode === 'admin' ? 'gold' : 'blue'} className="!p-6">
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={() => setMode('select')}
                  className="p-1.5 rounded-lg hover:bg-surface-hover text-text-muted hover:text-text-primary transition-colors"
                >
                  <ArrowLeft size={18} />
                </button>
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${mode === 'admin' ? 'bg-inpl-neon/10' : 'bg-inpl-electric/10'}`}>
                    {mode === 'admin' ? (
                      <Shield className={`w-5 h-5 text-inpl-neon`} />
                    ) : (
                      <Users className={`w-5 h-5 text-inpl-electric`} />
                    )}
                  </div>
                  <div>
                    <h2 className="font-semibold font-display text-text-primary">
                      {mode === 'admin' ? 'Admin Login' : 'Team Login'}
                    </h2>
                    <p className="text-xs text-text-muted">
                      {mode === 'admin' ? 'Auction management access' : 'Place bids and manage squad'}
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <Input
                  label="Email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
                <Input
                  label="Password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <Button
                  type="submit"
                  variant={mode === 'admin' ? 'gold' : 'primary'}
                  size="lg"
                  className="w-full"
                  loading={loading}
                  icon={<LogIn size={18} />}
                >
                  Sign In
                </Button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border-default"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-surface-elevated px-2 text-text-muted">Or continue with</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  className="w-full bg-white text-black hover:bg-gray-100 border-gray-200"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                >
                  <GoogleIcon />
                  Google
                </Button>
              </form>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </main>
  )
}
