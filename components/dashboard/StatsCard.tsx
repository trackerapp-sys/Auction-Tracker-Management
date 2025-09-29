import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { formatCurrency } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    type: 'increase' | 'decrease'
  }
  icon: React.ReactNode
  format?: 'currency' | 'number' | 'text'
}

export default function StatsCard({ title, value, change, icon, format = 'text' }: StatsCardProps) {
  const formatValue = (val: string | number) => {
    if (format === 'currency') {
      return formatCurrency(Number(val))
    }
    if (format === 'number') {
      return Number(val).toLocaleString()
    }
    return val
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <div className="text-gray-400">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">
          {formatValue(value)}
        </div>
        {change && (
          <p className="text-xs text-gray-500 mt-1">
            <span
              className={
                change.type === 'increase'
                  ? 'text-success-600'
                  : 'text-danger-600'
              }
            >
              {change.type === 'increase' ? '+' : '-'}
              {Math.abs(change.value)}%
            </span>
            {' '}from last month
          </p>
        )}
      </CardContent>
    </Card>
  )
}

