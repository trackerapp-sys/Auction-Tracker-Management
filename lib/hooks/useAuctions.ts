'use client'

import { useState, useEffect } from 'react'
import { Auction } from '@/lib/types'

export function useAuctions(status?: string, search?: string) {
  const [auctions, setAuctions] = useState<Auction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const params = new URLSearchParams()
        if (status) params.append('status', status)
        if (search) params.append('search', search)
        
        const response = await fetch(`/api/auctions?${params}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch auctions')
        }
        
        const data = await response.json()
        setAuctions(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchAuctions()
  }, [status, search])

  const createAuction = async (auctionData: Partial<Auction>) => {
    try {
      const response = await fetch('/api/auctions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(auctionData),
      })

      if (!response.ok) {
        throw new Error('Failed to create auction')
      }

      const newAuction = await response.json()
      setAuctions(prev => [newAuction, ...prev])
      return newAuction
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create auction')
      throw err
    }
  }

  const updateAuction = async (id: string, auctionData: Partial<Auction>) => {
    try {
      const response = await fetch(`/api/auctions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(auctionData),
      })

      if (!response.ok) {
        throw new Error('Failed to update auction')
      }

      const updatedAuction = await response.json()
      setAuctions(prev => 
        prev.map(auction => 
          auction.id === id ? updatedAuction : auction
        )
      )
      return updatedAuction
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update auction')
      throw err
    }
  }

  const deleteAuction = async (id: string) => {
    try {
      const response = await fetch(`/api/auctions/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete auction')
      }

      setAuctions(prev => prev.filter(auction => auction.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete auction')
      throw err
    }
  }

  return {
    auctions,
    loading,
    error,
    createAuction,
    updateAuction,
    deleteAuction,
  }
}

