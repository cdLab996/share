'use client'

import {
  Label,
  RadioGroup,
  RadioGroupItem,
  cn
} from '@nsiod/share-ui'
import { useRouter, usePathname } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { useTransition } from 'react'

interface LanguageSelectorProps {
  className?: string
}

export function LanguageSelector({ className }: LanguageSelectorProps) {
  const t = useTranslations('settings.general')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const handleLanguageChange = (newLocale: string) => {
    startTransition(() => {
      // Replace the locale in the pathname
      const newPathname = pathname.replace(`/${locale}`, `/${newLocale}`)
      router.replace(newPathname)
    })
  }

  const languages = [
    { code: 'en', label: t('languages.en') },
    { code: 'zh', label: t('languages.zh') }
  ]

  return (
    <div className={cn(
      'flex flex-col sm:flex-row items-start sm:items-center justify-between',
      'py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700 gap-2 sm:gap-0',
      className
    )}>
      <h3 className={cn('text-sm font-medium text-gray-900 dark:text-gray-100')}>
        {t('language')}
      </h3>
      <RadioGroup
        value={locale}
        onValueChange={handleLanguageChange}
        className={cn('flex flex-col sm:flex-row gap-3 sm:gap-4')}
        disabled={isPending}
      >
        {languages.map((language) => (
          <div key={language.code} className={cn('flex items-center space-x-2')}>
            <RadioGroupItem
              value={language.code}
              id={language.code}
              className={cn('border-gray-300 dark:border-gray-600 h-4 w-4 sm:h-5 sm:w-5')}
            />
            <Label 
              htmlFor={language.code} 
              className={cn('text-xs sm:text-sm')}
            >
              {language.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
}
