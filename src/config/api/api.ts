const API = {
  auth: {
    login: '/auth/login',
    register: 'auth/register',
    sendOTP:"/admin/auth/send-otp",
    verifyOTP:"/admin/auth/verify-otp",
    resetPassword:"/admin/auth/reset-password"
  },
  users: {
   list:"/users",
   create:"/users",
   delete:"/users",
   role:"/users/roles"
  },
  technology:{
    list :"/technology",
    create :"/technology",
    delete :"/technology",
  },
  clients:{
    list :"/clients",
    create :"/clients",
    delete :"/clients",
  },
  projects:{
    list:"/projects",
    create:"/projects",
    delete:"/projects",
  }
}

Object.freeze(API)
export default API
