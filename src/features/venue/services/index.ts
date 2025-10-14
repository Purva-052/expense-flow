/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import API from '@/config/api/api'
import useDeleteData from '@/hooks/use-delete-data'
import useFetchData from '@/hooks/use-fetch-data'
import usePostData from '@/hooks/use-post-data'
import { useVenueStore } from '../stores/useVenueStore'
import usePutData from '@/hooks/use-put-data'
import { useAuthStore } from '@/stores/use-auth-store'

const GET_API_URL = API.venue.list

const GET_MENU_API_URL = API.menu.list

export const useCreateVenueData = (onsuccess: any) => {
  // Renamed from useCreateOperaator
  return usePostData({
    url: API.venue.create,
    refetchQueries: [GET_API_URL],
    onSuccess: (data) => {
      console.log('venue data', data)
      onsuccess(data)
    },
  })
}

export const useCreateVenueOwner = () => {
  return usePostData({
    url: API.venue.venueOwner,
    refetchQueries: [GET_API_URL],
    onSuccess: (data) => {
      console.log('venue data', data)
      // onsuccess(data)
    },
  })
}

export const useUpdateVenueData = (id: string) => {
  const { setOpen } = useVenueStore()
  return usePutData({
    url: `${API.venue.update}/${id}`,
    refetchQueries: [GET_API_URL],
    onSuccess: () => setOpen(null), // <-- ✅ correct place
  })
}

export const useAddVenueImage = (onsuccess: any) => {
  return usePostData({
    url: API.venue.image,
    refetchQueries: [GET_API_URL],
    onSuccess: (data) => {
      console.log('venue data', data)
      onsuccess(data)
    },
  })
}

export const useAddSection = (onsuccess: any) => {
  return usePostData({
    url: API.venue.addSection,
    refetchQueries: [GET_API_URL],
    onSuccess: (data) => {
      onsuccess(data)
    },
  })
}

export const useUpdateSectionData = (id: string,onsuccess:any) => {
  return usePutData({
    url: `${API.venue.updateSection}/${id}`,
    refetchQueries: [GET_MENU_API_URL],
    onSuccess: () => {
      onsuccess()
    } // <-- ✅ correct place
  })
}

export const useDeleteSectionData = (id: string,onsuccess:any) => {
  const { setOpen } = useVenueStore()
  return useDeleteData({
    url: `${API.venue.deleteSection}/${id}`,
    refetchQueries: [GET_API_URL],
    onSuccess: () => {
      setOpen(null)
      onsuccess()
    },
  })
}

export const useGetVenues = (params?: any) => {
  const {user} = useAuthStore() 
  const role = user?.user?.role?.name
  return useFetchData({ url: GET_API_URL, params ,enabled : role === "super_admin"})
}

export const useGetVenuesById = (id: any) => {
  return useFetchData({ url: `${GET_API_URL}/${id}`  })
}

export const useDeleteVenue = (id: string) => {
  const { setOpen } = useVenueStore()
  return useDeleteData({
    url: `${API.venue.delete}/${id}`,
    refetchQueries: [GET_API_URL],
    onSuccess: () => {
      setOpen(null)
    },
  })
}

export const useDeleteVenueImage = (id: string,onsuccess:any) => {
  const { setOpen } = useVenueStore()
  return useDeleteData({
    url: `${API.venue.deleteImage}/${id}`,
    onSuccess: () => {
      setOpen(null)
      onsuccess()
    },
  })
}

export const useGetMenuByVenueId = (id:any,params?: any) => {
  return useFetchData({ url: `${GET_MENU_API_URL}/${id}/menu-items`, params })
}

export const useCreateMenuData = (onsuccess: any) => {
  // Renamed from useCreateOperaator
  return usePostData({
    url: API.menu.add,
    refetchQueries: [GET_MENU_API_URL],
    onSuccess: (data) => {
      onsuccess(data)
    },
  })
}

export const useDeleteMenuData = (id: string,onsuccess:any) => {
  return useDeleteData({
    url: `${API.menu.delete}/${id}`,
    refetchQueries: [GET_MENU_API_URL],
    onSuccess: () => {
     onsuccess()
    },
  })
}


export const useUpdateMenuData = (id: string,onsuccess:any) => {
  return usePutData({
    url: `${API.menu.update}/${id}`,
    refetchQueries: [GET_MENU_API_URL],
    onSuccess: () => {
      onsuccess()
    } // <-- ✅ correct place
  })
}
