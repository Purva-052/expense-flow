
const API = {
  auth: {
    login: '/auth/login',
    forgotPassword:"/auth/forgot-password",
    resetPassword:"/auth/change-password"
  },
  users: {
   list:"/users",
   create:"/users",
   delete:"/users",
   role:"/users/roles",
   available_developers:"/users/available-developers",
   all_developers:"/users/resources",
   remove_developer_from_project:"/developer-allocations/remove",
   reallocate_developer:"/developer-allocations/reallocate",
   project_handler:"/users/handled-projects",
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
    status_change:"project-status-logs"
  },
  project_types:{
    list : "/project-types",
    create : "/project-types",
    update:"/project-types",
    delete : "/project-types"
  },
  project_modules:{
    list : "/modules",
    create : "/modules",
    update:"/modules",
    delete : "/modules"
  }
}

Object.freeze(API)
export default API
