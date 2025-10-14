// /* eslint-disable @typescript-eslint/no-explicit-any */
// import API from '@/config/api/api'
// import useDeleteData from '@/hooks/use-delete-data'
// import useFetchData from '@/hooks/use-fetch-data'
// import usePostData from '@/hooks/use-post-data'
// import usePutData from '@/hooks/use-put-data'
// import { useCouponsStore } from '../stores/useTechnologyStore'

// const GET_API_URL = API.vendor.coupons.list

// export const useCreateCouponsData = () => {
//   const { setOpen } = useCouponsStore()
//   return usePostData({
//     url: API.vendor.coupons.create,
//     refetchQueries: [GET_API_URL],
//     onSuccess: () => {
//       setOpen(null)
//     },
//   })
// }

// export const useUpdateCouponsData = (id: string) => {
//   const { setOpen } = useCouponsStore()
//   return usePutData({
//     url: `${API.vendor.coupons.update}/${id}`,
//     refetchQueries: [GET_API_URL],
//     onSuccess: () => setOpen(null), // <-- ✅ correct place
//   })
// }

// export const useGetCouponsData = (params?: any) => {
//   return useFetchData({ url: GET_API_URL, params })
// }

// export const useDeleteCouponsData = (id: string) => {
//   const { setOpen } = useCouponsStore()
//   return useDeleteData({
//     url: `${API.vendor.coupons.delete}/${id}`,
//     refetchQueries: [GET_API_URL],
//     onSuccess: () => {
//       setOpen(null)
//     },
//   })
// }
