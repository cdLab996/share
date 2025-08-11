import { Button } from '@nsiod/share-ui'
import Image from 'next/image'

interface EmptyStateProps {
  icon: string
  title: string
  description: string
  buttonText?: string
  onButtonClick?: () => void
  // New props for dual button support
  showDualButtons?: boolean
  primaryButtonText?: string
  secondaryButtonText?: string
  onPrimaryClick?: () => void
  onSecondaryClick?: () => void
}

export const EmptyState = ({
  icon,
  title,
  description,
  buttonText,
  onButtonClick,
  showDualButtons = false,
  primaryButtonText,
  secondaryButtonText,
  onPrimaryClick,
  onSecondaryClick
}: EmptyStateProps) => (
  <div className="flex flex-col items-center pt-10 pb-20">
    <Image
      src={icon}
      alt={title}
      width={40}
      height={40}
      className="size-10 sm:size-12 text-blue-500 mx-auto mb-2"
    />
    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 text-center">
      {description}
    </p>
    
    {showDualButtons ? (
      <div className="flex gap-3">
        <Button
          variant="outline"
          className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400"
          onClick={onSecondaryClick}
        >
          {secondaryButtonText}
        </Button>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={onPrimaryClick}
        >
          {primaryButtonText}
        </Button>
      </div>
    ) : (
      buttonText && onButtonClick && (
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={onButtonClick}
        >
          {buttonText}
        </Button>
      )
    )}
  </div>
)
