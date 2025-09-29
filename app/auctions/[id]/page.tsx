'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Layout from '@/components/layout/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { formatCurrency, formatDateTime, getTimeRemaining, isAuctionActive } from '@/lib/utils'
import { Auction, Bid } from '@/lib/types'

export default function AuctionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const auctionId = params.id as string
  
  const [auction, setAuction] = useState<Auction | null>(null)
  const [bids, setBids] = useState<Bid[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmittingBid, setIsSubmittingBid] = useState(false)
  const [newBid, setNewBid] = useState({
    bidderName: '',
    amount: '',
    commentUrl: '',
    notes: ''
  })
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncStatus, setSyncStatus] = useState<string | null>(null)

  useEffect(() => {
    if (auctionId) {
      fetchAuction()
      fetchBids()
    }
  }, [auctionId])

  const fetchAuction = async () => {
    try {
      const response = await fetch(`/api/auctions/${auctionId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch auction')
      }
      const data = await response.json()
      setAuction(data)
    } catch (error) {
      console.error('Error fetching auction:', error)
      setError('Failed to load auction')
    }
  }

  const fetchBids = async () => {
    try {
      const response = await fetch(`/api/bids?auctionId=${auctionId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch bids')
      }
      const data = await response.json()
      setBids(data)
    } catch (error) {
      console.error('Error fetching bids:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitBid = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!auction || !newBid.bidderName || !newBid.amount) return

    setIsSubmittingBid(true)
    try {
      const response = await fetch('/api/bids', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          auctionId: auctionId,
          bidderName: newBid.bidderName,
          amount: Number(newBid.amount),
          commentUrl: newBid.commentUrl || undefined,
          notes: newBid.notes || undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit bid')
      }

      // Reset form
      setNewBid({
        bidderName: '',
        amount: '',
        commentUrl: '',
        notes: ''
      })

      // Refresh data
      await fetchAuction()
      await fetchBids()
    } catch (error) {
      console.error('Error submitting bid:', error)
      alert(error instanceof Error ? error.message : 'Failed to submit bid')
    } finally {
      setIsSubmittingBid(false)
    }
  }

  const handleSyncFacebookBids = async () => {
    if (!auction) return

    setIsSyncing(true)
    setSyncStatus('Syncing Facebook comments...')
    
    try {
      const response = await fetch('/api/facebook/auto-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          auctionId: auctionId
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to sync bids')
      }

      const result = await response.json()
      setSyncStatus(`Found ${result.detectedBids} bids, added ${result.newBids} new bids`)
      
      // Refresh data
      await fetchAuction()
      await fetchBids()
      
      // Clear status after 3 seconds
      setTimeout(() => setSyncStatus(null), 3000)
    } catch (error) {
      console.error('Error syncing Facebook bids:', error)
      setSyncStatus(`Error: ${error instanceof Error ? error.message : 'Failed to sync bids'}`)
      setTimeout(() => setSyncStatus(null), 5000)
    } finally {
      setIsSyncing(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'ended':
        return 'bg-gray-100 text-gray-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-gray-200 rounded"></div>
                <div className="h-96 bg-gray-200 rounded"></div>
              </div>
              <div className="space-y-6">
                <div className="h-48 bg-gray-200 rounded"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  if (error || !auction) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Auction Not Found</h1>
            <p className="text-gray-600 mb-8">{error || 'The auction you are looking for does not exist.'}</p>
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
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{auction.title}</h1>
              <p className="mt-2 text-gray-600">{auction.groupName}</p>
            </div>
            <div className="text-right">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(auction.status)}`}>
                {auction.status}
              </span>
              {isAuctionActive(auction) && (
                <p className="mt-2 text-sm text-gray-500">
                  {getTimeRemaining(auction.endTime)} remaining
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Auction Details */}
            <Card>
              <CardHeader>
                <CardTitle>Auction Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Description</h3>
                  <p className="mt-1 text-gray-900">{auction.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Start Time</h3>
                    <p className="mt-1 text-gray-900">{formatDateTime(auction.startTime)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">End Time</h3>
                    <p className="mt-1 text-gray-900">{formatDateTime(auction.endTime)}</p>
                  </div>
                </div>

                {auction.groupUrl && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Facebook Post</h3>
                    <a 
                      href={auction.groupUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="mt-1 text-primary-600 hover:text-primary-900 break-all"
                    >
                      {auction.groupUrl}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Bids History */}
            <Card>
              <CardHeader>
                <CardTitle>Bid History ({bids.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {bids.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No bids yet</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Bidder</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Time</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Confidence</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bids.map((bid) => (
                          <TableRow key={bid.id}>
                            <TableCell className="font-medium">{bid.bidderName}</TableCell>
                            <TableCell className="font-medium">
                              {formatCurrency(bid.amount, auction.currency)}
                            </TableCell>
                            <TableCell>{formatDateTime(bid.timestamp)}</TableCell>
                            <TableCell>
                              {bid.isWinning ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Winning
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  Outbid
                                </span>
                              )}
                              {bid.isIncrement && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ml-1">
                                  Increment
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              {bid.confidence ? (
                                <div className="flex items-center space-x-1">
                                  <div className="w-16 bg-gray-200 rounded-full h-2">
                                    <div 
                                      className={`h-2 rounded-full ${
                                        bid.confidence >= 0.8 ? 'bg-green-500' : 
                                        bid.confidence >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                                      }`}
                                      style={{ width: `${bid.confidence * 100}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    {Math.round(bid.confidence * 100)}%
                                  </span>
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400">Manual</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Current Bid */}
            <Card>
              <CardHeader>
                <CardTitle>Current Bid</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">
                    {formatCurrency(auction.currentBid, auction.currency)}
                  </div>
                  {auction.highestBidder && (
                    <p className="mt-2 text-sm text-gray-600">
                      by {auction.highestBidder}
                    </p>
                  )}
                  <p className="mt-4 text-sm text-gray-500">
                    {auction.totalBids} bid{auction.totalBids !== 1 ? 's' : ''}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Facebook Sync */}
            {auction.groupUrl && (
              <Card>
                <CardHeader>
                  <CardTitle>Facebook Bid Detection</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Automatically detect bids from Facebook post comments
                    </p>
                    <div className="flex items-center space-x-4">
                      <Button
                        onClick={handleSyncFacebookBids}
                        disabled={isSyncing}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {isSyncing ? 'Syncing...' : 'Sync Facebook Bids'}
                      </Button>
                      {syncStatus && (
                        <span className="text-sm text-gray-600">{syncStatus}</span>
                      )}
                    </div>
                    {auction.groupUrl && (
                      <div className="text-xs text-gray-500">
                        Post URL: <a href={auction.groupUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{auction.groupUrl}</a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Add Bid Form */}
            {isAuctionActive(auction) && (
              <Card>
                <CardHeader>
                  <CardTitle>Add Bid Manually</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitBid} className="space-y-4">
                    <Input
                      label="Bidder Name"
                      value={newBid.bidderName}
                      onChange={(e) => setNewBid(prev => ({ ...prev, bidderName: e.target.value }))}
                      required
                      placeholder="Enter bidder name"
                    />
                    
                    <Input
                      label="Bid Amount"
                      type="number"
                      value={newBid.amount}
                      onChange={(e) => setNewBid(prev => ({ ...prev, amount: e.target.value }))}
                      required
                      placeholder="0.00"
                      min={auction.currentBid + auction.bidIncrement}
                      step="0.01"
                    />
                    
                    <Input
                      label="Comment URL (Optional)"
                      value={newBid.commentUrl}
                      onChange={(e) => setNewBid(prev => ({ ...prev, commentUrl: e.target.value }))}
                      placeholder="Link to Facebook comment"
                    />
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">Notes (Optional)</label>
                      <textarea
                        value={newBid.notes}
                        onChange={(e) => setNewBid(prev => ({ ...prev, notes: e.target.value }))}
                        rows={3}
                        className="input mt-1"
                        placeholder="Additional notes..."
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isSubmittingBid}
                    >
                      {isSubmittingBid ? 'Submitting...' : 'Submit Bid'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Auction Info */}
            <Card>
              <CardHeader>
                <CardTitle>Auction Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Bid Increment:</span>
                  <span className="text-sm font-medium">{formatCurrency(auction.bidIncrement, auction.currency)}</span>
                </div>
                {auction.reservePrice && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Reserve Price:</span>
                    <span className="text-sm font-medium">{formatCurrency(auction.reservePrice, auction.currency)}</span>
                  </div>
                )}
                {auction.buyItNowPrice && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Buy It Now:</span>
                    <span className="text-sm font-medium">{formatCurrency(auction.buyItNowPrice, auction.currency)}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  )
}
