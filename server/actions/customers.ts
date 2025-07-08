'use server'

import { getActiveCustomers } from '@/server/queries/customers'
import type { PaginationParams, PaginatedResult, CustomerWithPets } from '@/server/queries/customers'

export async function fetchPaginatedCustomers(params: PaginationParams): Promise<PaginatedResult<CustomerWithPets>> {
  return await getActiveCustomers(params)
}