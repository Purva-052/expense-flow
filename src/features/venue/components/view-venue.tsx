/* eslint-disable @typescript-eslint/no-explicit-any */
import { useSearch } from '@tanstack/react-router'
import {
  IconArrowLeft,
  IconBuilding,
  IconClock,
  IconCurrencyDollar,
  IconInfoCircle,
  IconMapPin,
  IconPhone,
  IconStar,
} from '@tabler/icons-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import PageLayout from '@/components/layout/layout-provider'
import { useGetVenuesById } from '../services'
import MenuItems from './menu-items'
import SeatingArrangements from './seating-arrangement'
import VenueGallery from './venue-gallery'

const VenueViewPage = () => {
  const search: any = useSearch({ from: '/_authenticated/venue-view/' })
  const venueId = search.venueId

  const {
    data: venueData,
    isPending,
    isError,
    refetch,
  }: any = useGetVenuesById(venueId)

  const venue = venueData?.data || []

  const handleBack = () => {
    window.history.back()
  }

  const totalCapacity = venue?.venueSections?.reduce(
    (total: number, section: any) =>
      total + section.numberOfTables * section.seatingCapacity,
    0 // initial value
  )

  if (isPending) {
    return (
      <PageLayout>
        <div className='flex min-h-screen items-center justify-center'>
          <div className='flex flex-col items-center gap-3'>
            <div className='border-muted-foreground h-10 w-10 animate-spin rounded-full border-4 border-t-transparent'></div>
            <p className='text-muted-foreground'>Loading venue details...</p>
          </div>
        </div>
      </PageLayout>
    )
  }

  if (isError) {
    return (
      <PageLayout>
        <div className='flex min-h-screen items-center justify-center'>
          <p className='font-medium text-red-500'>
            Failed to load venue details. Please try again.
          </p>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className='bg-background min-h-screen'>
        {/* Header */}
        <div className='bg-card border-b'>
          <div className='container mx-auto px-4 py-4 sm:py-6'>
            <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
              <div className='flex items-start gap-4 sm:gap-6'>
                {/* Title + Description */}
                <div className='min-w-0'>
                  <h1 className='text-foreground truncate text-2xl font-bold sm:text-3xl'>
                    {venue?.name || 'Unnamed Venue'}
                  </h1>
                  <p className='text-muted-foreground mt-1 text-sm sm:text-base'>
                    {venue?.description ||
                      'Details about this venue will appear here once added.'}
                  </p>
                </div>
              </div>

              {/* Badges */}
              <div className='flex gap-4 lg:gap-14 xl:gap-14'>
                <div className='flex flex-wrap items-center gap-2'>
                  {venue?.rating > 0 && (
                    <Badge
                      variant='secondary'
                      className='flex items-center gap-1'
                    >
                      <IconStar className='h-3 w-3 fill-yellow-400 text-yellow-400' />
                      {venue.rating}
                    </Badge>
                  )}
                  {venue?.totalReviews && (
                    <Badge variant='outline'>
                      {venue.totalReviews} reviews
                    </Badge>
                  )}
                  {venue?.priceRange && (
                    <Badge variant='outline'>{venue.priceRange}</Badge>
                  )}
                </div>
                <div>
                  <Button
                    variant='outline'
                    size='lg'
                    onClick={handleBack}
                    className='flex shrink-0 items-center gap-2 bg-transparent'
                  >
                    <IconArrowLeft className='h-4 w-4' />
                    <span className='hidden sm:inline'>Back</span>
                  </Button>
                </div>
              </div>
              {/* Back Button */}
            </div>
          </div>
        </div>

        <div className='container mx-auto px-4 py-6 sm:py-8'>
          <div className='grid grid-cols-1 gap-6 lg:gap-8 xl:grid-cols-3'>
            {/* Main Content */}
            <div className='space-y-6 xl:col-span-2'>
              {/* Image Gallery */}
              <VenueGallery venue={venue} venueId={venueId} refetch={refetch} />
              {/* Sections & Capacity */}
              <div className='space-y-6'>
                <SeatingArrangements
                  refetch={refetch}
                  venue={venue}
                  venueId={venueId}
                  totalCapacity={totalCapacity}
                />
                {/* Menu Items */}
                <MenuItems refetch={refetch} venueId={venueId} />
              </div>
            </div>

            {/* Sidebar */}
            <div className='space-y-6'>
              {/* Quick Info */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <IconInfoCircle className='h-5 w-5' />
                    Quick Information
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  {venue?.venueType?.name ||
                  venue?.openingTime ||
                  venue?.closingTime ||
                  venue?.priceRange ||
                  (venue?.rating && venue?.totalReviews) ? (
                    <>
                      {/* Venue Type */}
                      {venue?.venueType?.name ? (
                        <div className='flex items-start gap-3'>
                          <IconBuilding className='text-muted-foreground mt-1 h-4 w-4 shrink-0' />
                          <div className='min-w-0'>
                            <p className='text-muted-foreground text-sm'>
                              Venue Type
                            </p>
                            <p className='font-medium'>
                              {venue.venueType.name}
                            </p>
                          </div>
                        </div>
                      ) : null}

                      {/* Operating Hours */}
                      {venue?.openingTime && venue?.closingTime ? (
                        <div className='flex items-start gap-3'>
                          <IconClock className='text-muted-foreground mt-1 h-4 w-4 shrink-0' />
                          <div className='min-w-0'>
                            <p className='text-muted-foreground text-sm'>
                              Operating Hours
                            </p>
                            <p className='font-medium'>
                              {venue.openingTime} - {venue.closingTime}
                            </p>
                          </div>
                        </div>
                      ) : null}

                      {/* Price Range */}
                      {venue?.priceRange ? (
                        <div className='flex items-start gap-3'>
                          <IconCurrencyDollar className='text-muted-foreground mt-1 h-4 w-4 shrink-0' />
                          <div className='min-w-0'>
                            <p className='text-muted-foreground text-sm'>
                              Price Range
                            </p>
                            <p className='font-medium'>{venue.priceRange}</p>
                          </div>
                        </div>
                      ) : null}

                      {/* Rating */}
                      {venue?.rating && venue?.totalReviews ? (
                        <div className='flex items-start gap-3'>
                          <IconStar className='text-muted-foreground mt-1 h-4 w-4 shrink-0' />
                          <div className='min-w-0'>
                            <p className='text-muted-foreground text-sm'>
                              Rating
                            </p>
                            <p className='font-medium'>
                              {venue.rating}/5 ({venue.totalReviews} reviews)
                            </p>
                          </div>
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <p className='text-muted-foreground flex flex-col items-center justify-center py-6 text-center'>
                      <IconInfoCircle className='mb-2 h-8 w-8' />
                      <span className='text-foreground font-medium'>
                        No quick information yet
                      </span>
                      <span className='text-sm'>
                        Add venue type, hours, price range, or ratings to help
                        users learn more.
                      </span>
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Description */}
              {venue.description && (
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                      <IconBuilding className='h-5 w-5' />
                      About This Venue
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className='text-muted-foreground leading-relaxed'>
                      {venue.description}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Location */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <IconMapPin className='h-5 w-5' />
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  {venue?.address ||
                  venue?.locality?.name ||
                  venue?.city?.name ||
                  venue?.state?.name ||
                  venue?.country?.name ? (
                    <div>
                      {venue?.address && (
                        <p className='text-foreground font-medium'>
                          {venue.address}
                        </p>
                      )}
                      <p className='text-muted-foreground text-sm'>
                        {venue?.locality?.name}
                        {venue?.locality?.name && venue?.city?.name ? ', ' : ''}
                        {venue?.city?.name}
                      </p>
                      <p className='text-muted-foreground text-sm'>
                        {venue?.state?.name}
                        {venue?.state?.name && venue?.country?.name ? ', ' : ''}
                        {venue?.country?.name}
                      </p>
                    </div>
                  ) : (
                    <p className='text-muted-foreground flex flex-col items-center justify-center py-6 text-center'>
                      <IconMapPin className='mb-2 h-8 w-8' />
                      <span className='text-foreground font-medium'>
                        Location not added
                      </span>
                      <span className='text-sm'>
                        Provide an address and city details so visitors can find
                        the venue.
                      </span>
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Contact */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <IconPhone className='h-5 w-5' />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  {venue?.phone ? (
                    <div className='flex items-start gap-3'>
                      <IconPhone className='text-muted-foreground mt-1 h-4 w-4 shrink-0' />
                      <div className='min-w-0'>
                        <p className='text-muted-foreground text-sm'>Phone</p>
                        <p className='font-medium break-all'>
                          {venue.phoneNumberCountryCode} {venue.phone}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className='text-muted-foreground flex flex-col items-center justify-center py-6 text-center'>
                      <IconPhone className='mb-2 h-8 w-8' />
                      <span className='text-foreground font-medium'>
                        No contact details
                      </span>
                      <span className='text-sm'>
                        Add a phone number to let people easily reach your
                        venue.
                      </span>
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}

export default VenueViewPage
