/* eslint-disable import/order */
'use client'

import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@nsiod/share-ui'
import { Settings, Lock, X } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useState, useCallback } from 'react'
import { toast } from 'sonner'

import { ExternalPublicKeysTab } from '@/components/Header/ExternalPublicKeysTab'
import { ImportDialog } from '@/components/Header/ImportDialog'
import { GeneralTab } from '@/components/Header/GeneralTab'
import { KeysTab } from '@/components/Header/KeysTab'
import { PublicKeyForm } from '@/components/Header/PublicKeyForm'
import { STORAGE_KEYS } from '@/constants'
import { useSecureLocalStorage } from '@/hooks'
import { validatePublicKey } from '@/lib/key'
import { PublicKey, KeyPair, TabType } from '@/types'

export default function Header() {
  const t = useTranslations('header')
  const tSettings = useTranslations('settings')
  const tMessages = useTranslations('messages')

  // Main state
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('General')

  // Import related state
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // Public key management state
  const [publicKeys, setPublicKeys, removePublicKeys] = useSecureLocalStorage<PublicKey[]>(STORAGE_KEYS.PUBLIC_KEYS, [])
  const [showAddKey, setShowAddKey] = useState(false)
  const [editKey, setEditKey] = useState<PublicKey | null>(null)
  const [validationError, setValidationError] = useState('')

  // Key pair management state
  const [keyPairs, setKeyPairs, removeKeyPairs] = useSecureLocalStorage<KeyPair[]>(STORAGE_KEYS.KEY_PAIRS, [])
  const [showCreateKeyPair, setShowCreateKeyPair] = useState(false)
  const [editKeyPair, setEditKeyPair] = useState<KeyPair | null>(null)

  // Password management state
  const [storedPasswordHash, setStoredPasswordHash, removePasswordHash] = useSecureLocalStorage<string | null>(STORAGE_KEYS.PASSWORD_HASH, null)
  const [showChangePassword, setShowChangePassword] = useState(false)

  // Reset all states function
  const resetAllStates = useCallback(() => {
    setShowImportDialog(false)
    setSelectedFile(null)
    setShowAddKey(false)
    setEditKey(null)
    setShowChangePassword(false)
    setShowCreateKeyPair(false)
    setEditKeyPair(null)
    setValidationError('')
  }, [])

  // Tab change handler
  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab as TabType)
    resetAllStates()
    if (tab === 'Security Password' && !storedPasswordHash) {
      setShowChangePassword(true)
    }
  }, [storedPasswordHash, resetAllStates])

  // Dialog close handler
  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false)
    resetAllStates()
  }, [resetAllStates])

  // File handling
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    setSelectedFile(file || null)
  }, [])

  const handleImport = useCallback(() => {
    setShowImportDialog(false)
    setSelectedFile(null)
    // Add import logic here
  }, [])

  // Handle saving a public key
  const handleSavePublicKey = useCallback(() => {
    if (!editKey) {
      setValidationError('No public key data provided')
      toast.error('No public key data provided')
      return
    }

    // Validate public key
    const validation = validatePublicKey(editKey.publicKey)
    if (!validation.isValid) {
      setValidationError(validation.error || 'Invalid public key')
      toast.error(validation.error || 'Invalid public key')
      return
    }

    const newPublicKeys = [...publicKeys]
    if (editKey.index !== undefined) {
      // Update existing key
      newPublicKeys[editKey.index] = {
        publicKey: editKey.publicKey,
        note: editKey.note || ''
      }
    } else {
      // Add new key
      newPublicKeys.push({
        publicKey: editKey.publicKey,
        note: editKey.note || ''
      })
    }

    setPublicKeys(newPublicKeys)
    toast.success(tMessages('success.publicKeySaved'))
    setShowAddKey(false)
    setEditKey(null)
    setValidationError('')
  }, [editKey, publicKeys, setPublicKeys, setShowAddKey, setEditKey, tMessages])

  // Get tab name with translation
  const getTabName = (tab: TabType) => {
    switch (tab) {
      case 'General':
        return tSettings('tabs.general')
      case 'Owner Keys':
        return tSettings('tabs.ownerKeys')
      case 'Receiver Keys':
        return tSettings('tabs.receiverKeys')
      case 'Security Password':
        return tSettings('tabs.securityPassword')
      default:
        return tab
    }
  }

  // Check if we should show sub-forms instead of tabs
  const showSubForm = showImportDialog || showAddKey || showChangePassword

  // Render main tab content
  const renderMainTabContent = () => {
    const tabProps = {
      publicKeys,
      setPublicKeys,
      removePublicKeys,
      keyPairs,
      setKeyPairs,
      removeKeyPairs,
      storedPasswordHash,
      setStoredPasswordHash,
      removePasswordHash,
      showCreateKeyPair,
      setShowCreateKeyPair,
      editKeyPair,
      setEditKeyPair,
      showChangePassword,
      setShowChangePassword,
      setShowImportDialog,
      setShowAddKey,
      setEditKey,
      setActiveTab
    }

    return (
      <div className="w-full">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full gap-0">
          <div className="px-6 pt-4 pb-0">
            <TabsList className="grid w-full grid-cols-3 bg-white dark:bg-gray-800 border rounded-lg h-10">
              <TabsTrigger
                value="General"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md px-4 py-2.5 text-sm font-medium transition-all h-8"
              >
                {getTabName('General')}
              </TabsTrigger>
              <TabsTrigger
                value="Owner Keys"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md px-4 py-2.5 text-sm font-medium transition-all h-8"
              >
                {getTabName('Owner Keys')}
              </TabsTrigger>
              <TabsTrigger
                value="Receiver Keys"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md px-4 py-2.5 text-sm font-medium transition-all h-8"
              >
                {getTabName('Receiver Keys')}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="General" className="mt-0 p-0">
            <div className="px-6 py-6">
              <div className='rounded-lg border-1'>
                <GeneralTab {...tabProps} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="Owner Keys" className="mt-0">
            <KeysTab {...tabProps} />
          </TabsContent>

          <TabsContent value="Receiver Keys" className="mt-0">
            <ExternalPublicKeysTab {...tabProps} />
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  // Render sub-form content
  const renderSubFormContent = () => {
    if (showImportDialog) {
      return (
        <ImportDialog
          selectedFile={selectedFile}
          onFileSelect={handleFileSelect}
          onImport={handleImport}
          onCancel={() => setShowImportDialog(false)}
          setPublicKeys={setPublicKeys}
          setKeyPairs={setKeyPairs}
          setStoredPasswordHash={setStoredPasswordHash}
        />
      )
    }

    if (showAddKey) {
      return (
        <div className="p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Button variant="ghost" size="icon" onClick={() => setShowAddKey(false)}>
              <span className="sr-only">Back</span>
              ←
            </Button>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {getTabName('Receiver Keys')}
            </h2>
          </div>
          <div className="flex justify-center text-center pt-2 pb-6">
            <PublicKeyForm
              editKey={editKey}
              validationError={validationError}
              onPublicKeyChange={(value) => setEditKey(prev => ({ ...prev || { publicKey: '', note: '' }, publicKey: value }))}
              onNoteChange={(value) => setEditKey(prev => ({ ...prev || { publicKey: '', note: '' }, note: value }))}
              onSave={handleSavePublicKey}
              onCancel={() => {
                setShowAddKey(false)
                setEditKey(null)
                setValidationError('')
              }}
            />
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <header className="relative w-full py-6 z-10 bg-[#0052D9] dark:bg-[#0E0F11] text-white dark:text-gray-200 overflow-hidden">
      <Lock className="hidden md:block absolute size-34 top-1/3 -left-12 text-[#4c85e4] dark:text-[#292929]" />

      <div className="relative max-w-6xl mx-auto flex flex-col md:flex-row items-center md:justify-between gap-4 p-4">
        <div className="flex-1 text-center space-y-2">
          <Image
            src="/logo.svg"
            alt="Secure Vault Logo"
            width={80}
            height={40}
            className="size-10 sm:size-12 text-blue-500 mx-auto mb-2 block dark:hidden"
          />
          <Image
            src="/logo_dark.svg"
            alt="Secure Vault Logo"
            width={80}
            height={40}
            className="size-10 sm:size-12 text-blue-500 mx-auto mb-2 hidden dark:block"
          />
          <h3 className="text-sm md:text-base font-medium text-white dark:text-gray-300">
            {t('title')}
          </h3>
        </div>

        <div className="flex items-center gap-2 justify-center md:justify-end w-full md:w-auto md:absolute md:right-4 md:top-1/2 md:-translate-y-1/2">
          <Button variant="ghost" size="icon" className="cursor-pointer" onClick={() => setIsDialogOpen(true)}>
            <Settings className="size-5" />
          </Button>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-[640px] max-w-[95vw] max-h-[90vh] overflow-hidden gap-0 p-0" showClose={false}>
              <DialogHeader className="border-b p-4 bg-white dark:bg-gray-900">
                <div className="flex justify-between items-center">
                  <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {tSettings('title')}
                  </DialogTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCloseDialog}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <X className="size-5" />
                  </Button>
                </div>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto bg-[#F9FAFB] dark:bg-gray-900">
                {showSubForm ? renderSubFormContent() : renderMainTabContent()}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  )
}
