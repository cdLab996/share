/* eslint-disable no-unused-vars */

import { Button } from '@nsiod/share-ui'
import { ChevronLeft } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCallback } from 'react'

import { CreateKeyPairForm } from '@/components/Header/CreateKeyPairForm'
import { EmptyState } from '@/components/Header/EmptyState'
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

export const KeysTab = ({
  keyPairs,
  setKeyPairs,
  showCreateKeyPair,
  setShowCreateKeyPair,
  editKeyPair,
  setEditKeyPair
}: KeysTabProps) => {
  const t = useTranslations()

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
    }
  }, [editKeyPair, handleSaveKeyPair])

  // Handle back button
  const handleBack = useCallback(() => {
    setShowCreateKeyPair(false)
    setEditKeyPair(null)
  }, [setShowCreateKeyPair, setEditKeyPair])

  if (showCreateKeyPair) {
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

  return (
    <div className="p-6">
      {keyPairs.length === 0 ? (
        <EmptyState
          icon="/PublicKeys.svg"
          title={t('settings.ownerKeys.noKeys')}
          description={t('settings.ownerKeys.description')}
          buttonText={t('buttons.createKey')}
          onButtonClick={handleCreateKeyPair}
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

      {keyPairs.length > 0 && (
        <div className="flex justify-end gap-3 mt-6">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" size="sm" onClick={handleCreateKeyPair}>
            {t('buttons.createKey')}
          </Button>
        </div>
      )}
    </div>
  )
}
