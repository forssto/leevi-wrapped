import { ReactNode } from 'react'

interface CardWrapperProps {
  children: ReactNode
  backgroundImage?: string
  isLoading?: boolean
  error?: string
}

export default function CardWrapper({ children, backgroundImage, isLoading, error }: CardWrapperProps) {
  const randomBackground = backgroundImage || `/backgrounds/tausta_${Math.floor(Math.random() * 16) + 1}.jpg`
  
  if (isLoading) {
    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center p-6">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center p-6">
        <div className="text-white text-xl text-center">
          <div className="text-red-400 mb-2">Error:</div>
          <div>{error}</div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-6">
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
