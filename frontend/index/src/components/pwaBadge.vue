<script setup>
import { ref } from 'vue'
import { useRegisterSW } from 'virtual:pwa-register/vue'

// check for updates every day
const period = 24 * 60 * 60 * 1000

const swActivated = ref(false)

/**
 * This function will register a periodic sync check every hour, you can modify the interval as needed.
 * @param {string} swUrl
 * @param {ServiceWorkerRegistration} r
 */
function registerPeriodicSync(swUrl, r) {
  if (period <= 0) return
  const reup=async () => {
    if ('onLine' in navigator && !navigator.onLine)
      return

    const resp = await fetch(swUrl, {
      cache: 'no-store',
      headers: {
        'cache': 'no-store',
        'cache-control': 'no-cache'
      }
    })

    if (resp?.status === 200)
      await r.update()
  }
  setTimeout(reup, 1000)
  setInterval(reup, period)
}


const { needRefresh, updateServiceWorker } = useRegisterSW({
  immediate: true,
  onRegisteredSW(swUrl, r) {
    if (period <= 0) return
    if (r?.active?.state === 'activated') {
      swActivated.value = true
      registerPeriodicSync(swUrl, r)
    } else if (r?.installing) {
      r.installing.addEventListener('statechange', (e) => {
        /** @type {ServiceWorker} */
        const sw = e.target
        swActivated.value = sw.state === 'activated'
        if (swActivated.value)
          registerPeriodicSync(swUrl, r)
      })
    }
  }
})

function close() {
  needRefresh.value = false
}
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

