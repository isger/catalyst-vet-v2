'use client'

import dynamic from 'next/dynamic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

interface LineChartProps {
  title?: string
  description?: string
}

export function LineChart({ 
  title = "Daily Patient Visits", 
  description = "Number of patients seen over the last 30 days" 
}: LineChartProps) {
  
  const getChartOptions = () => {
    return {
      chart: {
        height: 350,
        type: 'line' as const,
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
        width: 3
      },
      colors: ['#3B82F6', '#EF4444'],
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
        categories: Array.from({ length: 30 }, (_, i) => {
          const date = new Date()
          date.setDate(date.getDate() - (29 - i))
          return date.toISOString()
        }),
        labels: {
          format: 'dd MMM',
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
          text: 'Number of Patients',
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
      tooltip: {
        x: {
          format: 'dd MMM yyyy'
        }
      },
      legend: {
        position: 'top' as const,
        horizontalAlign: 'left' as const,
        fontFamily: 'Inter, sans-serif',
        fontSize: '14px',
        markers: {
          size: 8
        }
      },
      markers: {
        size: 4,
        colors: ['#3B82F6', '#EF4444'],
        strokeColors: '#fff',
        strokeWidth: 2,
        hover: {
          size: 6
        }
      }
    }
  }

  // Generate sample data for the last 30 days
  const generateDailyData = (baseValue: number, variance: number) => {
    return Array.from({ length: 30 }, () => {
      return Math.floor(baseValue + (Math.random() - 0.5) * variance)
    })
  }

  const series = [
    {
      name: 'Total Patients',
      data: generateDailyData(45, 20)
    },
    {
      name: 'Emergency Cases',
      data: generateDailyData(8, 6)
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
          <Button outline>
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
            type="line"
            height="100%"
          />
        </div>

        <div className="flex justify-between items-center pt-5 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Patients</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Emergency Cases</span>
            </div>
          </div>
          
          <Button plain className="text-blue-600 hover:text-blue-700 dark:hover:text-blue-500">
            Patient Trends
            <svg className="w-2.5 h-2.5 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 6 10">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
            </svg>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}