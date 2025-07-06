
import {Heading, Subheading} from '@/components/ui/heading'
import {Divider} from "@/components/ui/divider";
import {Text} from "@/components/ui/text";
import {Input} from "@/components/ui/input";

export default function NewCustomerPage() {
  return (
      <form method="post" className="mx-auto max-w-4xl">
        <Heading>Add Customer</Heading>
        <Divider className="my-10 mt-6" />

        <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          <div className="space-y-1">
            <Subheading>Customer Details</Subheading>
          </div>
          <div className="space-y-4">
              <Input aria-label="First Name" name="first_name" defaultValue="John" />
              <Input aria-label="Last Name" name="last_name" defaultValue="Doe" />
              <Input type="email" aria-label="Customer Email" name="email" defaultValue="john.doe@example.com" />
              <Input type="number" aria-label="Customer Phone Number" name="phone_number" />
          </div>
        </section>
      </form>
  )
}

// Metadata for the page
export const metadata = {
  title: 'Add New Customer | Catalyst Vet',
  description: 'Create a new customer profile for pet owners in your veterinary practice.'
}