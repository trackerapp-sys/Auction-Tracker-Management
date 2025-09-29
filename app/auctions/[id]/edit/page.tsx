'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Layout from '@/components/layout/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useSettings } from '@/lib/hooks/useSettings'

export default function EditAuctionPage() {
  const params = useParams()
  const router = useRouter()
  const auctionId = params.id as string
  const { settings } = useSettings()
  
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    groupName: '',
    groupUrl: '',
    startTime: '',
    endTime: '',
    currentBid: 0,
    currency: 'AUD',
    bidIncrement: 50,
    reservePrice: '',
    buyItNowPrice: '',
    status: 'active'
  })

  useEffect(() => {
    if (auctionId) {
      fetchAuction()
    }
  }, [auctionId])

  const fetchAuction = async () => {
    try {
      const response = await fetch(`/api/auctions/${auctionId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch auction')
      }
      const auction = await response.json()
      
      // Format dates for datetime-local inputs
      const startTime = new Date(auction.startTime).toISOString().slice(0, 16)
      const endTime = new Date(auction.endTime).toISOString().slice(0, 16)
      
      setFormData({
        title: auction.title || '',
        description: auction.description || '',
        groupName: auction.groupName || '',
        groupUrl: auction.groupUrl || '',
        startTime,
        endTime,
        currentBid: auction.currentBid || 0,
        currency: auction.currency || 'AUD',
        bidIncrement: auction.bidIncrement || 50,
        reservePrice: auction.reservePrice ? auction.reservePrice.toString() : '',
        buyItNowPrice: auction.buyItNowPrice ? auction.buyItNowPrice.toString() : '',
        status: auction.status || 'active'
      })
    } catch (error) {
      console.error('Error fetching auction:', error)
      setError('Failed to load auction')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/auctions/${auctionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          startTime: new Date(formData.startTime),
          endTime: new Date(formData.endTime),
          reservePrice: formData.reservePrice ? Number(formData.reservePrice) : undefined,
          buyItNowPrice: formData.buyItNowPrice ? Number(formData.buyItNowPrice) : undefined,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update auction')
      }

      router.push(`/auctions/${auctionId}`)
    } catch (error) {
      console.error('Failed to update auction:', error)
      setError('Failed to update auction')
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

  if (loading) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
            <p className="text-gray-600 mb-8">{error}</p>
            <Button onClick={() => router.push('/auctions')}>
              Back to Auctions
            </Button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Auction</h1>
          <p className="mt-2 text-gray-600">
            Update auction details and settings
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

              {/* Pricing */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    label="Current Bid"
                    type="number"
                    value={formData.currentBid}
                    onChange={(e) => handleInputChange('currentBid', Number(e.target.value))}
                    min="0"
                    step="0.01"
                    required
                  />
                  
                  <Select
                    label="Currency"
                    value={formData.currency}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
                    options={[
                      { value: 'AUD', label: 'AUD - Australian Dollar' },
                      { value: 'USD', label: 'USD - US Dollar' },
                      { value: 'EUR', label: 'EUR - Euro' },
                      { value: 'GBP', label: 'GBP - British Pound' },
                    ]}
                  />
                </div>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    label="Bid Increment"
                    type="number"
                    value={formData.bidIncrement}
                    onChange={(e) => handleInputChange('bidIncrement', Number(e.target.value))}
                    min="1"
                    step="0.01"
                    required
                  />
                  
                  <Select
                    label="Status"
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    options={[
                      { value: 'active', label: 'Active' },
                      { value: 'ended', label: 'Ended' },
                      { value: 'cancelled', label: 'Cancelled' },
                    ]}
                  />
                </div>
                
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
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-6 border-t">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.push(`/auctions/${auctionId}`)}
                >
                  Cancel
                </Button>
                
                <Button
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Updating...' : 'Update Auction'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
