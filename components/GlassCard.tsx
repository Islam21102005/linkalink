import React from 'react'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  depth?: 'base' | 'elevated' | 'floating' | 'nav' | 'input'
  hoverEffect?: boolean
}

export function GlassCard({ children, className = '', depth = 'base', hoverEffect = false }: GlassCardProps) {
  const depthStyles = {
    base: 'bg-white/40 backdrop-blur-md border border-gray-200/60 shadow-[0_8px_32px_rgba(0,0,0,0.06)]',
    elevated: 'bg-white/50 backdrop-blur-lg border border-gray-200/70 shadow-[0_8px_32px_rgba(0,0,0,0.08)]',
    floating: 'bg-white/60 backdrop-blur-xl border border-gray-200/80 shadow-[0_16px_48px_rgba(0,0,0,0.1)]',
    nav: 'bg-white/70 backdrop-blur-xl border-b border-gray-200/60 shadow-lg',
    input: 'bg-white/40 backdrop-blur-md border border-gray-200/60 focus-within:border-blue-400/60 transition-colors',
  }
  
  const hoverStyles = hoverEffect ? 'hover:bg-white/60 hover:border-gray-300/70 hover:-translate-y-1 transition-all duration-300' : ''

  return (
    <div className={`${depthStyles[depth]} ${hoverStyles} ${className} relative overflow-hidden`}>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gray-400/30 to-transparent opacity-50" />
      {children}
    </div>
  )
}
