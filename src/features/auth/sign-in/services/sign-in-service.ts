/* eslint-disable no-console */
import Cookies from 'js-cookie'
import API from '@/config/api/api'
import usePostData from '@/hooks/use-post-data'
import { LoginUser } from '../types'

export const useLogin = (onSuccess: (data: LoginUser) => void) => {
  return usePostData({
    url: API.auth.login,
    onSuccess: (data: LoginUser) => {
      Cookies.set('token', data.token)
      onSuccess(data)
    },
  })
}
