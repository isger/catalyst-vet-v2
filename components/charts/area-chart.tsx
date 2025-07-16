'use client'

import dynamic from 'next/dynamic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

interface AreaChartProps {
  title?: string
  description?: string
}

export function AreaChart({ 
  title = "Revenue Trends", 
  description = "Monthly revenue over the past year" 
}: AreaChartProps) {
  
  const getChartOptions = () => {
    return {
      chart: {
        height: 350,
        type: 'area' as const,
        fontFamily: 'Inter, sans-serif',
        toolbar: {
          show: false
        },
        zoom: {
          enabled: false
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'smooth' as const,
        width: 2
      },
      colors: ['#3B82F6', '#10B981'],
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.9,
          stops: [0, 90, 100]
        }
      },
      grid: {
        borderColor: '#e7e7e7',
        strokeDashArray: 3,
        yaxis: {
          lines: {
            show: true
          }
        },
        xaxis: {
          lines: {
            show: false
          }
        }
      },
      xaxis: {
        type: 'datetime' as const,
        categories: [
          '2024-01-01T00:00:00.000Z',
          '2024-02-01T00:00:00.000Z',
          '2024-03-01T00:00:00.000Z',
          '2024-04-01T00:00:00.000Z',
          '2024-05-01T00:00:00.000Z',
          '2024-06-01T00:00:00.000Z',
          '2024-07-01T00:00:00.000Z',
          '2024-08-01T00:00:00.000Z',
          '2024-09-01T00:00:00.000Z',
          '2024-10-01T00:00:00.000Z',
          '2024-11-01T00:00:00.000Z',
          '2024-12-01T00:00:00.000Z'
        ],
        labels: {
          format: 'MMM yyyy',
          style: {
            fontSize: '12px',
            fontFamily: 'Inter, sans-serif'
          }
        },
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        }
      },
      yaxis: {
        labels: {
          formatter: function (value: number) {
            return '$' + value.toLocaleString()
          },
          style: {
            fontSize: '12px',
            fontFamily: 'Inter, sans-serif'
          }
        }
      },
      tooltip: {
        x: {
          format: 'MMM yyyy'
        },
        y: {
          formatter: function (value: number) {
            return '$' + value.toLocaleString()
          }
        }
      },
      legend: {
        position: 'top' as const,
        horizontalAlign: 'left' as const,
        fontFamily: 'Inter, sans-serif',
        fontSize: '14px',
        markers: {
          width: 8,
          height: 8
        }
      }
    }
  }

  const series = [
    {
      name: 'Revenue',
      data: [45000, 52000, 38000, 65000, 72000, 58000, 69000, 75000, 82000, 71000, 89000, 95000]
    },
    {
      name: 'Projected',
      data: [40000, 48000, 42000, 61000, 68000, 62000, 65000, 78000, 85000, 88000, 92000, 98000]
    }
  ]

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold">{title}</CardTitle>
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 16 18">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 1v11m0 0 4-4m-4 4L4 8m11 4v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-3"/>
            </svg>
            <span className="sr-only">Download data</span>
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="h-80">
          <Chart
            options={getChartOptions()}
            series={series}
            type="area"
            height="100%"
          />
        </div>

        <div className="flex justify-between items-center pt-5 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">This Year</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Projected</span>
            </div>
          </div>
          
          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 dark:hover:text-blue-500">
            Financial Report
            <svg className="w-2.5 h-2.5 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 6 10">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
            </svg>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}