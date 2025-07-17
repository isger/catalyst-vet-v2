'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { useTheme } from 'next-themes'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

interface DonutChartProps {
  title?: string
  description?: string
}

export function DonutChart({ 
  title = "Patient Traffic", 
  description = "Distribution of patient visits by type" 
}: DonutChartProps) {
  const [selectedDevices, setSelectedDevices] = useState<string[]>([])
  const { theme } = useTheme()

  const getChartOptions = () => {
    let series = [35.1, 23.5, 2.4, 5.4] // Default data
    
    if (selectedDevices.length > 0) {
      const lastSelected = selectedDevices[selectedDevices.length - 1]
      switch (lastSelected) {
        case 'routine':
          series = [15.1, 22.5, 4.4, 8.4]
          break
        case 'emergency':
          series = [25.1, 26.5, 1.4, 3.4]
          break
        case 'surgery':
          series = [45.1, 27.5, 8.4, 2.4]
          break
        default:
          series = [35.1, 23.5, 2.4, 5.4]
      }
    }

    return {
      series,
      chart: {
        height: 320,
        type: 'donut' as const,
        fontFamily: 'Inter, sans-serif',
        toolbar: {
          show: false
        }
      },
      colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'],
      stroke: {
        colors: ['transparent'],
        lineCap: 'butt' as const
      },
      plotOptions: {
        pie: {
          donut: {
            labels: {
              show: true,
              name: {
                show: true,
                fontFamily: 'Inter, sans-serif',
                offsetY: 20,
                color: theme === 'dark' ? '#e4e4e7' : '#374151'
              },
              total: {
                showAlways: true,
                show: true,
                label: 'Total Visits',
                fontFamily: 'Inter, sans-serif',
                color: theme === 'dark' ? '#e4e4e7' : '#374151',
                formatter: function (w: { globals: { seriesTotals: number[] } }) {
                  const sum = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0)
                  return sum.toFixed(0)
                },
              },
              value: {
                show: true,
                fontFamily: 'Inter, sans-serif',
                offsetY: -20,
                color: theme === 'dark' ? '#e4e4e7' : '#374151',
                formatter: function (value: string) {
                  return parseFloat(value).toFixed(1) + '%'
                },
              },
            },
            size: '80%',
          },
        },
      },
      grid: {
        padding: {
          top: -2,
        },
      },
      labels: ['Checkups', 'Vaccinations', 'Surgeries', 'Emergency'],
      dataLabels: {
        enabled: false,
      },
      legend: {
        position: 'bottom' as const,
        fontFamily: 'Inter, sans-serif',
        fontSize: '14px',
        labels: {
          useSeriesColors: true,
          colors: theme === 'dark' ? '#e4e4e7' : '#374151'
        }
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              height: 300
            },
            legend: {
              position: 'bottom' as const
            }
          }
        }
      ]
    }
  }

  const handleCheckboxChange = (value: string, checked: boolean) => {
    if (checked) {
      setSelectedDevices([value])
    } else {
      setSelectedDevices([])
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CardTitle className="text-xl font-bold">{title}</CardTitle>
            <svg 
              className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white cursor-pointer" 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm0 16a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm1-5.034V12a1 1 0 0 1-2 0v-1.418a1 1 0 0 1 1.038-.999 1.436 1.436 0 0 0 1.488-1.441 1.501 1.501 0 1 0-3-.116.986.986 0 0 1-1.037.961 1 1 0 0 1-.96-1.037A3.5 3.5 0 1 1 11 11.466Z"/>
            </svg>
          </div>
          <Button outline>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 16 18">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 1v11m0 0 4-4m-4 4L4 8m11 4v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-3"/>
            </svg>
            <span className="sr-only">Download data</span>
          </Button>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-wrap gap-4 mb-6">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              value="routine"
              checked={selectedDevices.includes('routine')}
              onChange={(e) => handleCheckboxChange('routine', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-300">Routine</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              value="emergency"
              checked={selectedDevices.includes('emergency')}
              onChange={(e) => handleCheckboxChange('emergency', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-300">Emergency</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              value="surgery"
              checked={selectedDevices.includes('surgery')}
              onChange={(e) => handleCheckboxChange('surgery', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-300">Surgery</span>
          </label>
        </div>

        <div className="h-80">
          <Chart
            options={getChartOptions()}
            series={getChartOptions().series}
            type="donut"
            height="100%"
          />
        </div>

        <div className="flex justify-between items-center pt-5 border-t border-gray-200 dark:border-gray-700">
          <select className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-transparent border-0 focus:ring-0">
            <option>Last 7 days</option>
            <option>Yesterday</option>
            <option>Today</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
          </select>
          
          <Button plain className="text-blue-600 hover:text-blue-700 dark:hover:text-blue-500">
            Patient Analysis
            <svg className="w-2.5 h-2.5 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 6 10">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
            </svg>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}