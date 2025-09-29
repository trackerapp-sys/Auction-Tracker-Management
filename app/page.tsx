'use client'

import Layout from '@/components/layout/Layout'
import StatsCard from '@/components/dashboard/StatsCard'
import { useDashboard } from '@/lib/hooks/useDashboard'
import { useAuctions } from '@/lib/hooks/useAuctions'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import Link from 'next/link'
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ClockIcon,
  UserGroupIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import { formatCurrency, formatDate, formatTime, getTimeRemaining } from '@/lib/utils'

export default function Dashboard() {
  const { stats, loading: statsLoading, error: statsError } = useDashboard()
  const { auctions, loading: auctionsLoading, deleteAuction } = useAuctions()

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

  const handleDeleteAuction = async (auctionId: string) => {
    if (confirm('Are you sure you want to delete this auction?')) {
      try {
        await deleteAuction(auctionId)
      } catch (error) {
        console.error('Failed to delete auction:', error)
        alert('Failed to delete auction')
      }
    }
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Overview of your Facebook group auction activity
          </p>
        </div>

        {/* Stats Grid */}
        {statsLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={`stats-loading-${i}`} className="card p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : statsError ? (
          <div className="card p-6 text-center">
            <p className="text-danger-600">Error loading dashboard stats: {statsError}</p>
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Active Auctions"
              value={stats.activeAuctions}
              icon={<ChartBarIcon className="h-5 w-5" />}
              format="number"
            />
            <StatsCard
              title="Total Bids"
              value={stats.totalBids}
              icon={<UserGroupIcon className="h-5 w-5" />}
              format="number"
            />
            <StatsCard
              title="Total Value"
              value={stats.totalValue}
              icon={<CurrencyDollarIcon className="h-5 w-5" />}
              format="currency"
            />
            <StatsCard
              title="Ended Today"
              value={stats.auctionsEndedToday}
              icon={<ClockIcon className="h-5 w-5" />}
              format="number"
            />
          </div>
        ) : null}

        {/* All Auctions Table */}
        {auctionsLoading ? (
          <div className="card p-6">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={`auctions-loading-${i}`} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">All Auctions</h2>
              <Link href="/auctions/new" className="btn btn-primary">
                + Add New Auction
              </Link>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Auction</TableHead>
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
                            className="inline-flex items-center justify-center p-2 text-danger-600 hover:text-danger-900 hover:bg-danger-50 rounded-md transition-colors cursor-pointer"
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
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <div className="w-full">
                <Link 
                  href="/settings" 
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200 transition-colors cursor-pointer relative z-10"
                >
                  ⚙️ Settings
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Top Bidders
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-600">JS</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">John Smith</div>
                    <div className="text-xs text-gray-500">5 active bids</div>
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-900">
                  $8,500
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-success-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-success-600">SJ</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Sarah Johnson</div>
                    <div className="text-xs text-gray-500">3 active bids</div>
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-900">
                  $2,200
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-warning-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-warning-600">MC</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Mike Chen</div>
                    <div className="text-xs text-gray-500">2 active bids</div>
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-900">
                  $450
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
