import Image from 'next/image'
import { Team } from '@/lib/types/database'

interface TeamAvatarProps {
  team: Pick<Team, 'name' | 'short_name' | 'logo_url' | 'color'>
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
}

export function TeamAvatar({ team, className, size = 'md' }: TeamAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-24 h-24 text-3xl'
  }

  if (team.logo_url) {
    return (
      <div 
        className={`relative rounded-xl overflow-hidden shadow-lg border border-white/10 shrink-0 bg-white flex items-center justify-center p-0.5 ${sizeClasses[size]} ${className || ''}`}
      >
        <Image
          src={team.logo_url}
          alt={`${team.name} logo`}
          fill
          className="object-contain p-1"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
    )
  }

  return (
    <div
      className={`rounded-xl flex items-center justify-center text-white font-bold font-display shadow-lg shrink-0 border border-white/10 ${sizeClasses[size]} ${className || ''}`}
      style={{ background: `linear-gradient(135deg, ${team.color}, ${team.color}88)` }}
    >
      {team.short_name?.[0] || team.name[0]}
    </div>
  )
}
