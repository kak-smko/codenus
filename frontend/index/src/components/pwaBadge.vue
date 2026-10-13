<script setup>
import { onBeforeUnmount } from 'vue'
import { useRegisterSW } from 'virtual:pwa-register/vue'

const updateCheckPeriod = 24 * 60 * 60 * 1000
let initialUpdateCheck
let updateCheckInterval

function registerPeriodicSync(swUrl, registration) {
  if (updateCheckPeriod <= 0 || updateCheckInterval) return

  const checkForUpdates = async () => {
    if ('onLine' in navigator && !navigator.onLine) return

    try {
      const response = await fetch(swUrl, {
        cache: 'no-store',
        headers: {
          'cache': 'no-store',
          'cache-control': 'no-cache'
        }
      })

      if (response.status === 200)
        await registration.update()
    } catch {
      // A failed network check will be retried at the next interval.
    }
  }

  initialUpdateCheck = setTimeout(checkForUpdates, 1000)
  updateCheckInterval = setInterval(checkForUpdates, updateCheckPeriod)
}

const { needRefresh, updateServiceWorker } = useRegisterSW({
  immediate: true,
  onRegisteredSW(swUrl, registration) {
    if (registration)
      registerPeriodicSync(swUrl, registration)
  }
})

function close() {
  needRefresh.value = false
}

onBeforeUnmount(() => {
  clearTimeout(initialUpdateCheck)
  clearInterval(updateCheckInterval)
})
</script>

<template>
  <r-modal
    v-model="needRefresh"
    :closebtn="false"
  >
    <div class="pa-3">
      <div class="title-1">{{ $t('new_content_please_refresh') }}</div>
      <div class="text-end mt-5">
        <r-btn class="color-info me-2" @click.prevent="updateServiceWorker()">
          {{ $t('ok') }}
        </r-btn>
        <r-btn @click.prevent="close()">
          {{ $t('cancel') }}
        </r-btn>
      </div>
    </div>
  </r-modal>
</template>

