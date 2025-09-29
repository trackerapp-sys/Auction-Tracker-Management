'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/layout/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useAuctions } from '@/lib/hooks/useAuctions'
import { useSettings } from '@/lib/hooks/useSettings'

export default function NewAuctionPage() {
  const router = useRouter()
  const { createAuction } = useAuctions()
  const { settings } = useSettings()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    groupName: '',
    groupUrl: '',
    startTime: '',
    endTime: '',
    currentBid: 0,
    currency: settings?.currency || 'AUD',
    bidIncrement: settings?.defaultBidIncrement || 50,
    reservePrice: '',
    buyItNowPrice: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const auctionData = {
        ...formData,
        startTime: new Date(formData.startTime),
        endTime: new Date(formData.endTime),
        reservePrice: formData.reservePrice ? Number(formData.reservePrice) : undefined,
        buyItNowPrice: formData.buyItNowPrice ? Number(formData.buyItNowPrice) : undefined,
      }

      await createAuction(auctionData)
      router.push('/auctions')
    } catch (error) {
      console.error('Failed to create auction:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleUrlPaste = (url: string) => {
    // Extract group name from Facebook URL if possible
    const groupMatch = url.match(/\/groups\/([^\/]+)\//)
    if (groupMatch && !formData.groupName) {
      const groupName = groupMatch[1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      setFormData(prev => ({
        ...prev,
        groupName: groupName
      }))
    }
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Auction</h1>
          <p className="mt-2 text-gray-600">
            Add a new auction to track and manage
          </p>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Auction Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <Input
                  label="Auction Title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  required
                  placeholder="e.g., Vintage Rolex Submariner"
                />
                
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    required
                    rows={4}
                    className="input"
                    placeholder="Describe the item being auctioned..."
                  />
                </div>
              </div>

              {/* Group Information */}
              <div className="space-y-4">
                <Input
                  label="Facebook Group Name"
                  value={formData.groupName}
                  onChange={(e) => handleInputChange('groupName', e.target.value)}
                  required
                  placeholder="e.g., Luxury Watches Australia"
                />
                
                <Input
                  label="Facebook Auction Post URL"
                  value={formData.groupUrl}
                  onChange={(e) => {
                    handleInputChange('groupUrl', e.target.value)
                    handleUrlPaste(e.target.value)
                  }}
                  required
                  placeholder="https://www.facebook.com/groups/opaltradingpost/permalink/762284966516444/"
                />
                <p className="text-xs text-gray-500">
                  Paste the direct link to the Facebook auction post (not the group page)
                </p>
              </div>

              {/* Timing */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Start Time"
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => handleInputChange('startTime', e.target.value)}
                  required
                />
                
                <Input
                  label="End Time"
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => handleInputChange('endTime', e.target.value)}
                  required
                />
              </div>

              {/* Bidding */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Starting Bid"
                  type="number"
                  value={formData.currentBid}
                  onChange={(e) => handleInputChange('currentBid', Number(e.target.value))}
                  required
                  min="0"
                  step="0.01"
                />
                
                <Input
                  label="Bid Increment"
                  type="number"
                  value={formData.bidIncrement}
                  onChange={(e) => handleInputChange('bidIncrement', Number(e.target.value))}
                  required
                  min="1"
                  step="0.01"
                />
              </div>

              {/* Optional Fields */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Reserve Price (Optional)"
                  type="number"
                  value={formData.reservePrice}
                  onChange={(e) => handleInputChange('reservePrice', e.target.value)}
                  min="0"
                  step="0.01"
                  placeholder="Minimum acceptable bid"
                />
                
                <Input
                  label="Buy It Now Price (Optional)"
                  type="number"
                  value={formData.buyItNowPrice}
                  onChange={(e) => handleInputChange('buyItNowPrice', e.target.value)}
                  min="0"
                  step="0.01"
                  placeholder="Instant purchase price"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={isSubmitting}
                >
                  Create Auction
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}

