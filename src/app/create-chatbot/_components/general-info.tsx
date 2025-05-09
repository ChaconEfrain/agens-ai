import React from 'react'
import { formSchema, type BusinessData } from './form-wizard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { UseFormReturn } from 'react-hook-form'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface GeneralInfoProps {
  data: BusinessData['generalInfo']
  form: UseFormReturn<z.infer<typeof formSchema>>
}

export default function GeneralInfo({ data, form }: GeneralInfoProps) {
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i)

  return (
    <Card>
      <CardHeader>
        <CardTitle  className="text-xl font-semibold">
          <h2>General Business Information</h2>
        </CardTitle>
        <CardDescription>
          <p>
            Tell us about your business to help create a personalized chatbot.
          </p>
        </CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-4'>
        <FormField
          control={form.control}
          name='generalInfo.businessName'
          render={({field}) => (
            <FormItem>
              <FormLabel>Business Name*</FormLabel>
              <FormControl>
                <Input
                  placeholder='Enter your business name'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='generalInfo.description'
          render={({field}) => (
            <FormItem>
              <FormLabel>Business Description*</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='Briefly describe your business and its offerings'
                  className='resize-none'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='generalInfo.website'
          render={({field}) => (
            <FormItem>
              <FormLabel>Website</FormLabel>
              <FormControl>
                <Input
                  placeholder='https://yourbusiness.com'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='generalInfo.foundedYear'
          render={({field}) => (
            <FormItem>
              <FormLabel>Year Founded</FormLabel>
              <FormControl>
                <Select {...field} onValueChange={field.onChange}>
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Select year' />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  )
}
