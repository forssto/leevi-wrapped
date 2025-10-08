import { ReactNode } from 'react'

interface CardWrapperProps {
  children?: ReactNode
  backgroundImage?: string
  isLoading?: boolean
  error?: string
}

export default function CardWrapper({ children, backgroundImage, isLoading, error }: CardWrapperProps) {
  const randomBackground = backgroundImage || `/backgrounds/tausta_${Math.floor(Math.random() * 16) + 1}.jpg`
  
  if (isLoading) {
    return (
      <div className="relative w-full min-h-[60vh] flex flex-col items-center justify-center p-6">
        <div className="text-white text-xl flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          Loading...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="relative w-full min-h-[60vh] flex flex-col items-center justify-center p-6">
        <div className="text-white text-xl text-center">
          <div className="text-red-500 mb-2">Error:</div>
          <div>{error}</div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="relative w-full min-h-[60vh] flex flex-col items-center justify-center p-6">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-15 rounded-2xl overflow-hidden"
        style={{
          backgroundImage: `url('${randomBackground}')`
        }}
      />
      
      <div className="relative z-10 text-center max-w-5xl w-full">
        {children}
      </div>
    </div>
  )
}
