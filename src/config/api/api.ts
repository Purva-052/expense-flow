const API = {
  auth: {
    login: '/admin/auth/login',
    register: 'auth/register',
    logout: 'auth/logout',
    adminProfile: '/admin/users/profile',
    venueOwnerProfile: '/venue/users/profile',
    sendOTP:"/admin/auth/send-otp",
    verifyOTP:"/admin/auth/verify-otp",
    resetPassword:"/admin/auth/reset-password"
  },
  operators: {
    list: 'user/list-operators',
    add: 'user/create-operator',
    update: 'operator/update',
    delete: 'operator/delete',
  },
  country: {
    list: '/admin/countries',
    create: '/admin/countries',
    update: '/admin/countries',
    delete: '/admin/countries',
  },
  state: {
    list: '/admin/states',
    create: '/admin/states',
    update: '/admin/states',
    delete: '/admin/states',
  },
  city: {
    list: '/admin/cities',
    create: '/admin/cities',
    update: '/admin/cities',
    delete: '/admin/cities',
  },
  locality: {
    list: '/admin/localities',
    create: '/admin/localities',
    update: '/admin/localities',
    delete: '/admin/localities',
  },
  venueTypes: {
    list: '/admin/venue-types',
    create: '/admin/venue-types',
    update: '/admin/venue-types',
    delete: '/admin/venue-types',
  },
  venueSectionTypes: {
    list: '/admin/venue-section-types',
    create: '/admin/venue-section-types',
    update: '/admin/venue-section-types',
    delete: '/admin/venue-section-types',
  },
  vendorVenueSectionTypes:{
    list :"/venue/venue-section-types",
    create :"/venue/venue-section-types",
    update :"/venue/venue-section-types",
    delete :"/venue/venue-section-types"
  },
  adminMenuCategories: {
    list: '/admin/menu-categories',
    create: '/admin/menu-categories',
    update: '/admin/menu-categories',
    delete: '/admin/menu-categories',
  },
  venueMenuCategories: {
    list: '/venue/menu-categories',
    create: '/venue/menu-categories',
    update: '/venue/menu-categories',
    delete: '/venue/menu-categories',
  },
  venue: {
    create: '/admin/venues',
    update: '/admin/venues',
    image: '/admin/venue-images',
    deleteImage:"/admin/venue-images",
    addSection: '/admin/venue-sections',
    updateSection: '/admin/venue-sections',
    deleteSection: '/admin/venue-sections',
    list: '/admin/venues',
    delete: '/admin/venues',
    country: '/admin/countries',
    state: '/admin/states',
    city: '/admin/cities',
    locality: '/admin/localities',
    venueTypes: '/admin/venue-types',
    venueSectionType: '/admin/venue-section-types',
    addState: '/admin/states',
    addCity: '/admin/cities',
    addLocality: '/admin/localities',
    addVenueType: '/admin/venue-types',
    addVenueSectionType: '/admin/venue-section-types',
    venueOwner:"/admin/users/venue-owner"
  },
  adminSetting:{
      list:"/admin/settings",
      update:"/admin/settings"
  },
  adminDashboard:{
    list :"/admin/dashboard/counts"
  },
  adminBookings:{
    list :"/admin/bookings",
    details:"/admin/bookings"
  },
  adminCustomer:{
    list :"/admin/bookings/unique-booking-users"
  },
  payment:{
    list:"/admin/bookings/all"
  },
  menu:{
    add: '/admin/menu-items',
    list: '/admin/menu-items/venue',
    update: '/admin/menu-items',
    delete: '/admin/menu-items',
  },
  projects: {
    add: 'project/create',
    list: 'project/list',
    update: 'project/update',
    delete: 'project/delete',
  },
  master: {
    machine: {
      type: {
        add: 'machine/type/create',
        list: 'machine/type/all',
        update: 'machine/type',
        delete: 'machine/type',
      },
    },
    products: {
      add: 'product/create-product',
      list: 'product/list',
      update: 'product/update',
      delete: 'products',
    },
  },
  vendor:{
    dashboard:{
      list :"/venue/venues/dashboard"
    },
    menu:{
      list :"/venue/menu-items/venue",
      add :"/venue/menu-items",
      update :"/venue/menu-items",
      delete :"/venue/menu-items",
      availability:"/venue/menu-items"
    },
    venueSection:{
      list :"/venue/venue-sections",
      add :"/venue/venue-sections",
      update :"/venue/venue-sections",
      delete :"/venue/venue-sections",
    },
    booking:{
      list :"/venue/bookings",
      update :"/venue/bookings",
      delete :"/venue/bookings",
      details:"/venue/bookings",
      block_date:"/venue/time-slots/blocks"
    },
    setting:{
      list:"/venue/time-slots/config",
      update:"/venue/time-slots/config"
    },
    customer:{
      list :"/venue/users/unique-booking-users",
    },
    coupons:{
      list:"/venue/coupons",
      create:"/venue/coupons",
      update:"/venue/coupons",
      delete:"/venue/coupons",
    },
    stripeAccountActive:{
      list :"/venue/users/venue-owner/get-stripe-onboarding-link"
    }
  }
}

Object.freeze(API)
export default API
