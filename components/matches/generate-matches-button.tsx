'use client'

import { useState } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface GenerateMatchesButtonProps {
  userId: string
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
}

export function GenerateMatchesButton({ 
  userId, 
  variant = 'default', 
  size = 'default',
  className = ''
}: GenerateMatchesButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const router = useRouter()

  const handleGenerateMatches = async () => {
    setIsGenerating(true)
    
    try {
      const response = await fetch('/api/matches/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      })

      const result = await response.json()
      
      if (result.success) {
        // Refresh the page to show new matches
        router.refresh()
      } else {
        console.error('Erro ao gerar matches:', result.error)
        // TODO: Show error toast
      }
    } catch (error) {
      console.error('Erro na requisição:', error)
      // TODO: Show error toast
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button
      onClick={handleGenerateMatches}
      disabled={isGenerating}
      variant={variant}
      size={size}
      className={`${className} ${
        variant === 'default' 
          ? 'bg-gradient-to-r from-[#D02E32] to-[#B91C1C] hover:from-[#B91C1C] hover:to-[#D02E32] text-white' 
          : ''
      }`}
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Gerando matches...
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4 mr-2" />
          Gerar Novos Matches
        </>
      )}
    </Button>
  )
} 