'use client'

import dynamic from 'next/dynamic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

interface RadialBarChartProps {
  title?: string
  description?: string
}

export function RadialBarChart({ 
  title = "Treatment Success Rate", 
  description = "Success rates across different treatment types" 
}: RadialBarChartProps) {
  
  const getChartOptions = () => {
    return {
      chart: {
        height: 350,
        type: 'radialBar' as const,
        fontFamily: 'Inter, sans-serif',
        toolbar: {
          show: false
        }
      },
      plotOptions: {
        radialBar: {
          offsetY: 0,
          startAngle: 0,
          endAngle: 270,
          hollow: {
            margin: 5,
            size: '30%',
            background: 'transparent',
            image: undefined,
          },
          dataLabels: {
            name: {
              show: false,
            },
            value: {
              show: false,
            }
          },
          barLabels: {
            enabled: true,
            useSeriesColors: true,
            margin: 8,
            fontSize: '16px',
            formatter: function(seriesName: string, opts: any) {
              return seriesName + ":  " + opts.w.globals.series[opts.seriesIndex] + "%"
            },
          },
        }
      },
      colors: ['#1ab7ea', '#0084ff', '#39539E', '#0077B5'],
      labels: ['Surgery', 'Vaccinations', 'General Care', 'Emergency'],
      responsive: [{
        breakpoint: 480,
        options: {
          legend: {
            show: false
          }
        }
      }]
    }
  }

  const series = [88, 95, 92, 78]

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
            type="radialBar"
            height="100%"
          />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">92%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Overall Success</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">456</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Cases</div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-5 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Last updated: {new Date().toLocaleDateString()}
          </div>
          
          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 dark:hover:text-blue-500">
            Quality Report
            <svg className="w-2.5 h-2.5 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 6 10">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
            </svg>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}