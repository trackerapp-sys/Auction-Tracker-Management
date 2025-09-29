'use client'

import { useState, useEffect } from 'react'
import Layout from '@/components/layout/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useSettings } from '@/lib/hooks/useSettings'
import { Settings } from '@/lib/types'

export default function SettingsPage() {
  const { settings, loading, error, updateSettings } = useSettings()
  const [isSaving, setIsSaving] = useState(false)
  const [localSettings, setLocalSettings] = useState<Settings | null>(null)

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings)
    }
  }, [settings])

  const timezoneOptions = [
    { value: 'Australia/Sydney', label: 'Australia/Sydney (AEST/AEDT)' },
    { value: 'Australia/Melbourne', label: 'Australia/Melbourne (AEST/AEDT)' },
    { value: 'Australia/Brisbane', label: 'Australia/Brisbane (AEST)' },
    { value: 'Australia/Perth', label: 'Australia/Perth (AWST)' },
    { value: 'Australia/Adelaide', label: 'Australia/Adelaide (ACST/ACDT)' },
    { value: 'Australia/Darwin', label: 'Australia/Darwin (ACST)' },
    { value: 'UTC', label: 'UTC' },
    { value: 'America/New_York', label: 'America/New_York (EST/EDT)' },
    { value: 'Europe/London', label: 'Europe/London (GMT/BST)' },
  ]

  const languageOptions = [
    { value: 'en-AU', label: 'English (Australia)' },
    { value: 'en-US', label: 'English (United States)' },
    { value: 'en-GB', label: 'English (United Kingdom)' },
  ]

  const currencyOptions = [
    { value: 'AUD', label: 'Australian Dollar (AUD)' },
    { value: 'USD', label: 'US Dollar (USD)' },
    { value: 'EUR', label: 'Euro (EUR)' },
    { value: 'GBP', label: 'British Pound (GBP)' },
  ]

  const dateFormatOptions = [
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (Australian)' },
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US)' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO)' },
  ]

  const timeFormatOptions = [
    { value: '24h', label: '24 Hour (14:30)' },
    { value: '12h', label: '12 Hour (2:30 PM)' },
  ]

  const handleSave = async () => {
    if (!localSettings) return
    
    setIsSaving(true)
    try {
      await updateSettings(localSettings)
      // Show success message
    } catch (error) {
      console.error('Failed to save settings:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleNotificationChange = (key: keyof Settings['notifications'], value: boolean) => {
    if (!localSettings) return
    
    setLocalSettings(prev => ({
      ...prev!,
      notifications: {
        ...prev!.notifications,
        [key]: value
      }
    }))
  }

  if (loading) {
    return (
      <Layout>
        <div className="space-y-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={`settings-loading-${i}`} className="card p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="space-y-4">
                  {[...Array(4)].map((_, j) => (
                    <div key={`settings-field-${i}-${j}`} className="h-10 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="card p-6 text-center">
          <p className="text-danger-600">Error loading settings: {error}</p>
        </div>
      </Layout>
    )
  }

  if (!localSettings) {
    return (
      <Layout>
        <div className="card p-6 text-center">
          <p className="text-gray-600">No settings found</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-gray-600">
            Configure your auction management preferences
          </p>
        </div>

        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Select
                label="Timezone"
                options={timezoneOptions}
                value={localSettings.timezone}
                onChange={(e) => setLocalSettings(prev => ({ ...prev!, timezone: e.target.value }))}
                helperText="Default timezone for displaying dates and times"
              />
              <Select
                label="Language"
                options={languageOptions}
                value={localSettings.language}
                onChange={(e) => setLocalSettings(prev => ({ ...prev!, language: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Select
                label="Currency"
                options={currencyOptions}
                value={localSettings.currency}
                onChange={(e) => setLocalSettings(prev => ({ ...prev!, currency: e.target.value }))}
              />
              <Select
                label="Date Format"
                options={dateFormatOptions}
                value={localSettings.dateFormat}
                onChange={(e) => setLocalSettings(prev => ({ ...prev!, dateFormat: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Select
                label="Time Format"
                options={timeFormatOptions}
                value={localSettings.timeFormat}
                onChange={(e) => setLocalSettings(prev => ({ ...prev!, timeFormat: e.target.value as '12h' | '24h' }))}
              />
              <Input
                label="Default Bid Increment"
                type="number"
                value={localSettings.defaultBidIncrement}
                onChange={(e) => setLocalSettings(prev => ({ ...prev!, defaultBidIncrement: Number(e.target.value) }))}
                helperText="Default minimum bid increment for new auctions"
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900">New Bid Notifications</div>
                  <div className="text-sm text-gray-500">Get notified when new bids are placed</div>
                </div>
                <input
                  type="checkbox"
                  checked={localSettings.notifications.newBid}
                  onChange={(e) => handleNotificationChange('newBid', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900">Auction Ending Notifications</div>
                  <div className="text-sm text-gray-500">Get notified when auctions are about to end</div>
                </div>
                <input
                  type="checkbox"
                  checked={localSettings.notifications.auctionEnding}
                  onChange={(e) => handleNotificationChange('auctionEnding', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900">Auction Ended Notifications</div>
                  <div className="text-sm text-gray-500">Get notified when auctions end</div>
                </div>
                <input
                  type="checkbox"
                  checked={localSettings.notifications.auctionEnded}
                  onChange={(e) => handleNotificationChange('auctionEnded', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900">Email Notifications</div>
                  <div className="text-sm text-gray-500">Receive notifications via email</div>
                </div>
                <input
                  type="checkbox"
                  checked={localSettings.notifications.email}
                  onChange={(e) => handleNotificationChange('email', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900">Push Notifications</div>
                  <div className="text-sm text-gray-500">Receive push notifications in browser</div>
                </div>
                <input
                  type="checkbox"
                  checked={localSettings.notifications.push}
                  onChange={(e) => handleNotificationChange('push', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Input
                label="Auto Archive Days"
                type="number"
                value={localSettings.autoArchiveDays}
                onChange={(e) => setLocalSettings(prev => ({ ...prev!, autoArchiveDays: Number(e.target.value) }))}
                helperText="Automatically archive ended auctions after this many days"
              />
            </div>
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900">Export Data</div>
                  <div className="text-sm text-gray-500">Download all auction data as CSV</div>
                </div>
                <Button variant="outline" size="sm">
                  Export CSV
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} isLoading={isSaving}>
            Save Settings
          </Button>
        </div>
      </div>
    </Layout>
  )
}
