import type { BidIncrement } from '@/lib/types/database'

/**
 * Format currency in Crores (Cr) or Lakhs (LPA)
 */
export function formatCurrency(amountInCr: number, options?: { short?: boolean }): string {
  if (amountInCr >= 1) {
    const formatted = amountInCr % 1 === 0 ? amountInCr.toFixed(0) : amountInCr.toFixed(2)
    return `₹${formatted} Cr`
  }
  const lpa = amountInCr * 100
  const formatted = lpa % 1 === 0 ? lpa.toFixed(0) : lpa.toFixed(0)
  return options?.short ? `₹${formatted}L` : `₹${formatted} LPA`
}

/**
 * Format currency as pure number (for inputs)
 */
export function formatCurrencyNumber(amountInCr: number): string {
  return amountInCr.toFixed(2)
}

/**
 * Calculate the next valid bid increment based on current bid
 */
export function getNextBidIncrement(currentBid: number, increments: BidIncrement[]): number {
  for (const tier of increments) {
    if (currentBid >= tier.min && currentBid < tier.max) {
      return tier.increment
    }
  }
  // Default to last tier's increment
  return increments.length > 0 ? increments[increments.length - 1].increment : 0.10
}

/**
 * Calculate the next valid bid amount
 */
export function getNextBidAmount(currentBid: number, bidCount: number, increments: BidIncrement[]): number {
  if (bidCount === 0) {
    // First bid can be at base price
    return currentBid
  }
  const increment = getNextBidIncrement(currentBid, increments)
  return Math.round((currentBid + increment) * 100) / 100
}

/**
 * Validate if a bid amount is valid
 */
export function validateBidAmount(
  bidAmount: number,
  currentBid: number,
  bidCount: number,
  increments: BidIncrement[],
  teamPurse: number,
  teamPlayerCount: number,
  maxSquadSize: number,
  enforceMinAffordability: boolean,
  basePriceCr: number
): { valid: boolean; error?: string } {
  // Squad full
  if (teamPlayerCount >= maxSquadSize) {
    return { valid: false, error: `Squad is full. Maximum ${maxSquadSize} players.` }
  }

  // Minimum bid
  const minBid = getNextBidAmount(currentBid, bidCount, increments)
  if (bidAmount < minBid) {
    return { valid: false, error: `Bid must be at least ${formatCurrency(minBid)}` }
  }

  // Purse check
  if (bidAmount > teamPurse) {
    return { valid: false, error: `Insufficient purse. Available: ${formatCurrency(teamPurse)}` }
  }

  // Min squad affordability
  if (enforceMinAffordability) {
    const remainingSlots = maxSquadSize - teamPlayerCount - 1
    const minRequired = remainingSlots * basePriceCr
    if ((teamPurse - bidAmount) < minRequired) {
      return {
        valid: false,
        error: `Need ${formatCurrency(minRequired)} for ${remainingSlots} remaining slots at base price.`,
      }
    }
  }

  return { valid: true }
}

/**
 * Generate player code
 */
export function generatePlayerCode(index: number): string {
  return `INPL-P${String(index).padStart(3, '0')}`
}

/**
 * Format timestamp to readable time
 */
export function formatTime(timestamp: string): string {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

/**
 * Format timestamp to readable date
 */
export function formatDate(timestamp: string): string {
  const date = new Date(timestamp)
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Format timestamp to relative time
 */
export function timeAgo(timestamp: string): string {
  const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000)
  if (seconds < 5) return 'just now'
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return formatDate(timestamp)
}

/**
 * Cricket role icon/emoji
 */
export function getRoleEmoji(role: string): string {
  switch (role) {
    case 'Batter': return '🏏'
    case 'Bowler': return '🎯'
    case 'All-Rounder': return '⭐'
    case 'Wicketkeeper': return '🧤'
    default: return '🏏'
  }
}
