'use client'

import { Input } from '@/components/ui/input'
import { Listbox, ListboxLabel, ListboxOption } from '@/components/ui/listbox'
import { getCountries } from '@/data'
import Image from 'next/image'
import { useState } from 'react'

export function Address() {
  const countries = getCountries()
  const [country, setCountry] = useState(countries[0])

  return (
    <div className="grid grid-cols-2 gap-6">
      <Input
        aria-label="Street Address"
        name="address"
        placeholder="10 Downing Street"
        className="col-span-2"
      />
      <Input aria-label="City" name="city" placeholder="London" className="col-span-2" />
      <Listbox aria-label="Region" name="region" placeholder="England">
        {country.regions.map((region) => (
          <ListboxOption key={region} value={region}>
            <ListboxLabel>{region}</ListboxLabel>
          </ListboxOption>
        ))}
      </Listbox>
      <Input aria-label="Postal code" name="postal_code" placeholder="SW1A 2AA" />
      <Listbox
        aria-label="Country"
        name="country"
        placeholder="Country"
        by="code"
        value={country}
        onChange={(country) => setCountry(country)}
        className="col-span-2"
      >
        {countries.map((country) => (
          <ListboxOption key={country.code} value={country}>
            <Image className="w-5 sm:w-4" src={country.flagUrl} alt="" width={20} height={15} />
            <ListboxLabel>{country.name}</ListboxLabel>
          </ListboxOption>
        ))}
      </Listbox>
    </div>
  )
}
