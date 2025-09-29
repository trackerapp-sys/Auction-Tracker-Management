'use client'

import { useState } from 'react'
import Layout from '@/components/layout/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { useAuctions } from '@/lib/hooks/useAuctions'
import { formatCurrency, formatDate, formatTime, getTimeRemaining, isAuctionActive } from '@/lib/utils'
import { Auction } from '@/lib/types'
import Link from 'next/link'
import { 
  EyeIcon, 
  PencilIcon, 
  TrashIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'

export default function AuctionsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const { auctions, loading, error, deleteAuction } = useAuctions(statusFilter === 'all' ? undefined : statusFilter, searchTerm)

  const handleDeleteAuction = async (id: string) => {
    if (confirm('Are you sure you want to delete this auction?')) {
      try {
        await deleteAuction(id)
      } catch (error) {
        console.error('Failed to delete auction:', error)
      }
    }
  }

  const getStatusColor = (status: Auction['status']) => {
    switch (status) {
      case 'active':
        return 'text-success-600 bg-success-50'
      case 'ended':
        return 'text-gray-600 bg-gray-50'
      case 'cancelled':
        return 'text-danger-600 bg-danger-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'ended', label: 'Ended' },
    { value: 'cancelled', label: 'Cancelled' },
  ]

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Auctions</h1>
            <p className="mt-2 text-gray-600">
              Manage and track your Facebook group auctions
            </p>
          </div>
          <Link href="/auctions/new">
            <Button>
              + New Auction
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search auctions..."
                    className="input pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="sm:w-48">
                <Select
                  options={statusOptions}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Auctions Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              All Auctions ({auctions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse">
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={`loading-${i}`} className="h-16 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-danger-600">Error loading auctions: {error}</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Group</TableHead>
                    <TableHead>Current Bid</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Time Remaining</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auctions.map((auction, index) => (
                    <TableRow key={auction.id || `auction-${index}`}>
                      <TableCell className="font-medium">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {auction.title}
                          </div>
                          <div className="text-xs text-gray-500">
                            {auction.totalBids} bids • {auction.description.length > 50 ? auction.description.substring(0, 50) + '...' : auction.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-900">
                          {auction.groupName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(auction.currentBid, auction.currency)}
                        </div>
                        {auction.highestBidder && (
                          <div className="text-xs text-gray-500">
                            by {auction.highestBidder}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            auction.status
                          )}`}
                        >
                          {auction.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        {auction.status === 'active' ? (
                          <div>
                            <div className="text-sm text-gray-900">
                              {getTimeRemaining(auction.endTime)}
                            </div>
                            <div className="text-xs text-gray-500">
                              ends {formatDate(auction.endTime)} at {formatTime(auction.endTime)}
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">
                            {formatDate(auction.endTime)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          {auction.id ? (
                            <Link
                              href={`/auctions/${auction.id}`}
                              className="inline-flex items-center justify-center p-2 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded-md transition-colors"
                              title="View auction details"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </Link>
                          ) : (
                            <span className="inline-flex items-center justify-center p-2 text-gray-400">
                              <EyeIcon className="h-4 w-4" />
                            </span>
                          )}
                          {auction.id ? (
                            <Link
                              href={`/auctions/${auction.id}/edit`}
                              className="inline-flex items-center justify-center p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                              title="Edit auction"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Link>
                          ) : (
                            <span className="inline-flex items-center justify-center p-2 text-gray-400">
                              <PencilIcon className="h-4 w-4" />
                            </span>
                          )}
                          <button 
                            className="inline-flex items-center justify-center p-2 text-danger-600 hover:text-danger-900 hover:bg-danger-50 rounded-md transition-colors"
                            onClick={() => handleDeleteAuction(auction.id)}
                            title="Delete auction"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}