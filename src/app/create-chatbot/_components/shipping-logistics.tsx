import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import React from 'react'
import { UseFormReturn } from 'react-hook-form'
import { z } from 'zod'
import { formSchema } from './form-wizard'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'

interface ShippingLogisticsProps {
  form: UseFormReturn<z.infer<typeof formSchema>>
}

export default function ShippingLogistics({ form }: ShippingLogisticsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          <h2>Shipping & Logistics</h2>
        </CardTitle>
        <CardDescription>
          <p>Provide details about your shipping policies and logistics.</p>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <FormField
          control={form.control}
          name="shippingLogistics.internationalShipping"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2">
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel>
                We offer international shipping
              </FormLabel>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='shippingLogistics.shippingMethods'
          render={({field}) => (
            <FormItem>
              <FormLabel>Shipping Methods*</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder='e.g., Standard shipping, international shipping, free shipping and express shipping' className='resize-none' />
              </FormControl>
              <FormMessage/>
            </FormItem>
          )}  
        />
        <FormField
          control={form.control}
          name='shippingLogistics.deliveryTimeframes'
          render={({field}) => (
            <FormItem>
              <FormLabel>Delivery Timeframes*</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder='e.g., Standard: 3-5 business days, Express: 1-2 business days' className='resize-none' />
              </FormControl>
              <FormMessage/>
            </FormItem>
          )}  
        />
        <FormField
          control={form.control}
          name='shippingLogistics.returnPolicy'
          render={({field}) => (
            <FormItem>
              <FormLabel>Return Policies*</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder='Describe your return and refund policies' className='resize-none' />
              </FormControl>
              <FormMessage/>
            </FormItem>
          )}  
        />
        <FormField
          control={form.control}
          name='shippingLogistics.shippingRestrictions'
          render={({field}) => (
            <FormItem>
              <FormLabel>Shipping Rerstrictions or Special Conditions</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="e.g., We don't ship to P.O. boxes, certain countries, or have restrictions on specific products" className='resize-none' />
              </FormControl>
              <FormMessage/>
            </FormItem>
          )}  
        />
      </CardContent>
    </Card>
  )
}
