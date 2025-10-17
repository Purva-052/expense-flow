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
   role:"/users/roles",
   available_developers:"/users/available-developers",
   remove_developer_from_project:"/developer-allocations/remove"
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
    assign_developers:"/developer-allocations",
  }
}

Object.freeze(API)
export default API
