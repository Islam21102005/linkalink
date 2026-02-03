import React from 'react'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  depth?: 'base' | 'elevated' | 'floating' | 'nav' | 'input'
  hoverEffect?: boolean
}

export function GlassCard({ children, className = '', depth = 'base', hoverEffect = false }: GlassCardProps) {
  const depthStyles = {
    base: 'bg-white/5 backdrop-blur-sm border border-white/10 shadow-xl',
    elevated: 'bg-white/10 backdrop-blur-md border border-white/15 shadow-2xl',
    floating: 'bg-white/10 backdrop-blur-lg border border-white/20 shadow-[0_16px_48px_rgba(0,0,0,0.4)]',
    nav: 'bg-white/5 backdrop-blur-xl border-b border-white/10 shadow-lg',
    input: 'bg-white/5 backdrop-blur-sm border border-white/10 focus-within:border-white/30 transition-colors',
  }
  
  const hoverStyles = hoverEffect ? 'hover:bg-white/15 hover:border-white/30 hover:-translate-y-1 transition-all duration-300' : ''

  return (
    <div className={`${depthStyles[depth]} ${hoverStyles} ${className} relative overflow-hidden`}>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />
      {children}
    </div>
  )
}