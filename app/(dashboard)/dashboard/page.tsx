import { DonutChart } from '@/components/charts/donut-chart'
import { AreaChart } from '@/components/charts/area-chart'
import { BarChart } from '@/components/charts/bar-chart'
import { LineChart } from '@/components/charts/line-chart'
import { RadialBarChart } from '@/components/charts/radial-bar-chart'
import { DashboardStats } from '@/components/stats/dashboard-stats'

export default async function DashboardPage() {

  return (
    <>
      <div className="mb-8 md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl/7 font-bold text-zinc-950 dark:text-white sm:truncate sm:text-3xl sm:tracking-tight">
            Dashboard
          </h2>
        </div>
      </div>
      
      <div className="space-y-8">
        <DashboardStats />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DonutChart />
          <AreaChart />
          <BarChart />
          <LineChart />
        </div>

        <div className="grid grid-cols-1 gap-6">
          <RadialBarChart />
        </div>
      </div>
    </>
  )
}