/* eslint-disable no-unused-vars */

import { Button } from '@nsiod/share-ui'
import { generateMnemonic, deriveKeyPair } from '@nsiod/share-utils'
import { ChevronLeft } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'

import { CreateKeyPairForm } from '@/components/Header/CreateKeyPairForm'
import { EmptyState } from '@/components/Header/EmptyState'
import { ImportKeyForm } from '@/components/Header/ImportKeyForm'
import { KeyPairTable } from '@/components/Header/KeyPairTable'
import { useKeyPairManagement } from '@/hooks'
import { KeyPair } from '@/types'

interface KeysTabProps {
  keyPairs: KeyPair[]
  setKeyPairs: (keys: KeyPair[]) => void
  showCreateKeyPair: boolean
  setShowCreateKeyPair: (show: boolean) => void
  editKeyPair: KeyPair | null
  setEditKeyPair: (keyPair: KeyPair | null | ((prev: KeyPair | null) => KeyPair | null)) => void
}

type KeyFormMode = 'list' | 'create' | 'import'

export const KeysTab = ({
  keyPairs,
  setKeyPairs,
  showCreateKeyPair,
  setShowCreateKeyPair,
  editKeyPair,
  setEditKeyPair
}: KeysTabProps) => {
  const t = useTranslations()
  const [formMode, setFormMode] = useState<KeyFormMode>('list')

  const {
    handleCreateKeyPair,
    handleSaveKeyPair,
    handleDeleteKeyPair,
    handleCopyKey,
    handleSaveNoteInTable
  } = useKeyPairManagement({
    keyPairs,
    setKeyPairs,
    setEditKeyPair,
    setShowCreateKeyPair
  })

  // Handle updating note
  const handleNoteChange = useCallback((value: string) => {
    setEditKeyPair((prev: KeyPair | null) =>
      prev ? { ...prev, note: value } : { publicKey: '', note: value }
    )
  }, [setEditKeyPair])

  // Handle updating public key
  const handlePublicKeyChange = useCallback((value: string) => {
    setEditKeyPair((prev: KeyPair | null) =>
      prev ? { ...prev, publicKey: value } : { publicKey: value, note: '' }
    )
  }, [setEditKeyPair])

  const handleMnemonicChange = useCallback((value: string) => {
    setEditKeyPair((prev: KeyPair | null) =>
      prev ? { ...prev, mnemonic: value } : { publicKey: '', mnemonic: value, note: '' }
    )
  }, [setEditKeyPair])

  // Handle saving with validation
  const handleSave = useCallback(() => {
    if (editKeyPair) {
      handleSaveKeyPair(editKeyPair)
      setFormMode('list')
    }
  }, [editKeyPair, handleSaveKeyPair])

  // Handle back button
  const handleBack = useCallback(() => {
    setFormMode('list')
    setShowCreateKeyPair(false)
    setEditKeyPair(null)
  }, [setShowCreateKeyPair, setEditKeyPair])

  // Handle create key button
  const handleCreateKey = useCallback(() => {
    // Auto-generate mnemonic and key pair when creating
    try {
      const newMnemonic = generateMnemonic(128) // 12 words
      const { publicKey: newPublicKey } = deriveKeyPair(newMnemonic)
      
      setEditKeyPair({ 
        publicKey: newPublicKey, 
        mnemonic: newMnemonic, 
        note: '' 
      })
      setFormMode('create')
      setShowCreateKeyPair(true)
    } catch (error) {
      console.error('Failed to generate key pair:', error)
      toast.error(t('messages.error.failedGenerateKeyPair'))
    }
  }, [setEditKeyPair, setShowCreateKeyPair, t])

  // Handle import key button
  const handleImportKey = useCallback(() => {
    setEditKeyPair({ publicKey: '', note: '', mnemonic: '' })
    setFormMode('import')
    setShowCreateKeyPair(true)
  }, [setEditKeyPair, setShowCreateKeyPair])

  // Render create key form
  if (formMode === 'create') {
    return (
      <div className="p-6">
        <div className="flex items-center mb-2">
          <Button variant="secondary" size="icon" onClick={handleBack}>
            <ChevronLeft className="size-4" />
          </Button>
          <span className="text-base font-medium text-gray-600 dark:text-gray-400">Back</span>
        </div>

        <div className="border p-4 rounded-lg">
          <CreateKeyPairForm
            keyPair={editKeyPair}
            onNoteChange={handleNoteChange}
            onPublicKeyChange={handlePublicKeyChange}
            onMnemonicChange={handleMnemonicChange}
            onSave={handleSave}
            onCancel={handleBack}
          />
        </div>
      </div>
    )
  }

  // Render import key form
  if (formMode === 'import') {
    return (
      <div className="p-6">
        <div className="flex items-center mb-2">
          <Button variant="secondary" size="icon" onClick={handleBack}>
            <ChevronLeft className="size-4" />
          </Button>
          <span className="text-base font-medium text-gray-600 dark:text-gray-400">Back</span>
        </div>

        <div className="border p-4 rounded-lg">
          <ImportKeyForm
            keyPair={editKeyPair}
            onNoteChange={handleNoteChange}
            onPublicKeyChange={handlePublicKeyChange}
            onMnemonicChange={handleMnemonicChange}
            onSave={handleSave}
            onCancel={handleBack}
          />
        </div>
      </div>
    )
  }

  // Render main list view
  return (
    <div className="p-6">
      {keyPairs.length === 0 ? (
        <EmptyState
          icon="/PublicKeys.svg"
          title={t('settings.ownerKeys.noKeys')}
          description={t('settings.ownerKeys.description')}
          showDualButtons={true}
          primaryButtonText={t('buttons.createKey')}
          secondaryButtonText={t('buttons.importKey')}
          onPrimaryClick={handleCreateKey}
          onSecondaryClick={handleImportKey}
        />
      ) : (
        <KeyPairTable
          keyPairs={keyPairs}
          onCopyPublic={(key) => handleCopyKey(key, 'public')}
          onCopyMnemonic={(mnemonic) => handleCopyKey(mnemonic, 'mnemonic')}
          onEditNote={(keyPair, index) => setEditKeyPair({ ...keyPair, index })}
          onDelete={handleDeleteKeyPair}
          onSaveNote={handleSaveNoteInTable}
        />
      )}

      {/* Action buttons - only show when there are existing keys */}
      {keyPairs.length > 0 && (
        <div className="flex justify-end gap-3 mt-6">
          <Button 
            variant="outline"
            className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400"
            onClick={handleImportKey}
          >
            {t('buttons.importKey')}
          </Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleCreateKey}
          >
            {t('buttons.createKey')}
          </Button>
        </div>
      )}
    </div>
  )
}
