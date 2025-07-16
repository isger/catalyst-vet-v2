'use client'

import dynamic from 'next/dynamic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

interface BarChartProps {
  title?: string
  description?: string
}

export function BarChart({ 
  title = "Weekly Appointments", 
  description = "Appointment volume by day of the week" 
}: BarChartProps) {
  
  const getChartOptions = () => {
    return {
      chart: {
        type: 'bar' as const,
        height: 350,
        fontFamily: 'Inter, sans-serif',
        toolbar: {
          show: false
        }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '55%',
          borderRadius: 4,
          borderRadiusApplication: 'end' as const
        },
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        show: true,
        width: 2,
        colors: ['transparent']
      },
      colors: ['#3B82F6', '#10B981', '#F59E0B'],
      xaxis: {
        categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        labels: {
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
        title: {
          text: 'Number of Appointments',
          style: {
            fontSize: '12px',
            fontFamily: 'Inter, sans-serif'
          }
        },
        labels: {
          style: {
            fontSize: '12px',
            fontFamily: 'Inter, sans-serif'
          }
        }
      },
      fill: {
        opacity: 1
      },
      tooltip: {
        y: {
          formatter: function (val: number) {
            return val + " appointments"
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
      }
    }
  }

  const series = [
    {
      name: 'Checkups',
      data: [24, 28, 32, 35, 41, 22, 18]
    },
    {
      name: 'Surgeries',
      data: [8, 12, 15, 18, 22, 14, 6]
    },
    {
      name: 'Emergency',
      data: [4, 6, 8, 12, 15, 18, 12]
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
            type="bar"
            height="100%"
          />
        </div>

        <div className="flex justify-between items-center pt-5 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Checkups</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Surgeries</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Emergency</span>
            </div>
          </div>
          
          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 dark:hover:text-blue-500">
            Schedule Report
            <svg className="w-2.5 h-2.5 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 6 10">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
            </svg>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}