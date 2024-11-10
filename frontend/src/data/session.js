import router from '@/router'
import { computed, reactive } from 'vue'
import { createResource } from 'frappe-ui'

import { userResource } from './user'

export function sessionUser() {
  const cookies = new URLSearchParams(document.cookie.split('; ').join('&'))
  let _sessionUser = cookies.get('user_id')
  if (_sessionUser === 'Guest') {
    _sessionUser = null
  }
  const _userImage = cookies.get('user_image') || null;
  return { userId: _sessionUser, userImage: _userImage }
}

export const session = reactive({
  login: createResource({
    url: 'login',
    makeParams({ email, password }) {
      return {
        usr: email,
        pwd: password,
      }
    },
    onSuccess(data) {
      userResource.reload()
      const { userId, userImage } = sessionUser() // Get both userId and userImage
      session.user = userId
      session.userImage = userImage // Assign userImage to the session
      session.login.reset()
      router.replace(data.default_route || '/')
    },
  }),
  logout: createResource({
    url: 'logout',
    onSuccess() {
      userResource.reset()
      const { userId, userImage } = sessionUser() // Get both userId and userImage
      session.user = userId
      session.userImage = userImage // Reset userImage as well
      router.replace({ name: 'Login' })
    },
  }),
  user: sessionUser().userId,
  userImage: sessionUser().userImage, // Store the user image in the session
  isLoggedIn: computed(() => !!session.user),
})
