/* eslint-disable no-unused-vars */

import { Button } from '@nsiod/share-ui'
import { ChevronLeft } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'

import { EmptyState } from '@/components/Header/EmptyState'
import { PublicKeyForm } from '@/components/Header/PublicKeyForm'
import { PublicKeyTable } from '@/components/Header/PublicKeyTable'
import { usePublicKeyManagement } from '@/hooks'
import { validatePublicKey } from '@/lib/key'
import { PublicKey } from '@/types'

interface ExternalPublicKeysTabProps {
  publicKeys: PublicKey[]
  setPublicKeys: (keys: PublicKey[]) => void
}

export const ExternalPublicKeysTab = ({
  publicKeys,
  setPublicKeys
}: ExternalPublicKeysTabProps) => {
  const t = useTranslations()

  // Local state for add/edit form
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingKey, setEditingKey] = useState<PublicKey | null>(null)
  const [validationError, setValidationError] = useState('')

  const {
    handleDeleteKey,
    handleCopy,
    handleSaveNoteInTable
  } = usePublicKeyManagement({ publicKeys, setPublicKeys })

  const handleAddPublicKey = useCallback(() => {
    setEditingKey({ publicKey: '', note: '' })
    setValidationError('')
    setShowAddForm(true)
  }, [])

  const handleEditPublicKey = useCallback((key: PublicKey, index: number) => {
    setEditingKey({ ...key, index })
    setValidationError('')
    setShowAddForm(true)
  }, [])

  const handleSavePublicKey = useCallback(() => {
    if (!editingKey?.publicKey.trim()) {
      setValidationError(t('messages.error.enterPublicKey'))
      toast.error(t('messages.error.enterPublicKey'))
      return
    }

    // Validate public key
    const validation = validatePublicKey(editingKey.publicKey.trim())
    if (!validation.isValid) {
      setValidationError(validation.error || t('messages.error.invalidPublicKey'))
      toast.error(validation.error || t('messages.error.invalidPublicKey'))
      return
    }

    const newPublicKeys = [...publicKeys]
    if (editingKey?.index !== undefined) {
      // Update existing key
      newPublicKeys[editingKey.index] = {
        publicKey: editingKey.publicKey.trim(),
        note: editingKey.note?.trim() || ''
      }
      toast.success(t('messages.success.publicKeyUpdated'))
    } else {
      // Add new key
      newPublicKeys.push({
        publicKey: editingKey.publicKey.trim(),
        note: editingKey.note?.trim() || ''
      })
      toast.success(t('messages.success.publicKeySaved'))
    }

    setPublicKeys(newPublicKeys)
    setShowAddForm(false)
    setEditingKey(null)
    setValidationError('')
  }, [editingKey, publicKeys, setPublicKeys, t])

  const handleCancelForm = useCallback(() => {
    setShowAddForm(false)
    setEditingKey(null)
    setValidationError('')
  }, [])

  const handlePublicKeyChange = useCallback((value: string) => {
    setEditingKey(prev => prev ? { ...prev, publicKey: value } : { publicKey: value, note: '' })
    setValidationError('')
  }, [])

  const handleNoteChange = useCallback((value: string) => {
    setEditingKey(prev => prev ? { ...prev, note: value } : { publicKey: '', note: value })
  }, [])

  if (showAddForm) {
    return (
      <div className="p-6">
        <div className="flex items-center mb-2">
          <Button variant="secondary" size="icon" onClick={handleCancelForm}>
            <ChevronLeft className="size-4" />
          </Button>
          <span className="text-base font-medium text-gray-600 dark:text-gray-400">Back</span>
        </div>

        <div className="border p-4 rounded-lg">
          <PublicKeyForm
            editKey={editingKey}
            validationError={validationError}
            onPublicKeyChange={handlePublicKeyChange}
            onNoteChange={handleNoteChange}
            onSave={handleSavePublicKey}
            onCancel={handleCancelForm}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {publicKeys.length === 0 ? (
        <EmptyState
          icon="/PublicKeys.svg"
          title={t('settings.receiverKeys.noKeys')}
          description={t('settings.receiverKeys.description')}
          buttonText={t('buttons.addReceiverKeys')}
          onButtonClick={handleAddPublicKey}
        />
      ) : (
        <PublicKeyTable
          publicKeys={publicKeys}
          onCopy={handleCopy}
          onEditNote={handleEditPublicKey}
          onDelete={handleDeleteKey}
          onSaveNote={handleSaveNoteInTable}
        />
      )}

      {publicKeys.length > 0 && (
        <div className="flex justify-end gap-3 mt-6">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleAddPublicKey}>
            {t('buttons.addReceiverKeys')}
          </Button>
        </div>
      )}
    </div>
  )
}
