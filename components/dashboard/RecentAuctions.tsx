import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { formatCurrency, formatDate, formatTime } from '@/lib/utils'
import { Auction } from '@/lib/types'
import Link from 'next/link'
import { EyeIcon } from '@heroicons/react/24/outline'

interface RecentAuctionsProps {
  auctions: Auction[]
}

export default function RecentAuctions({ auctions }: RecentAuctionsProps) {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Auctions</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Group</TableHead>
              <TableHead>Current Bid</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ends</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {auctions.slice(0, 5).map((auction, index) => (
              <TableRow key={auction.id || `auction-${index}`}>
                <TableCell className="font-medium">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {auction.title}
                    </div>
                    <div className="text-xs text-gray-500">
                      {auction.totalBids} bids
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
                  <div className="text-sm text-gray-900">
                    {formatDate(auction.endTime)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatTime(auction.endTime)}
                  </div>
                </TableCell>
                <TableCell>
                  {auction.id ? (
                    <Link
                      href={`/auctions/${auction.id}`}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </Link>
                  ) : (
                    <span className="text-gray-400">
                      <EyeIcon className="h-4 w-4" />
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}