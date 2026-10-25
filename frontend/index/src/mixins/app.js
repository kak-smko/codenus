export const App = {
  data() {
    return {
      lang_added: false
    }
  },
  methods: {
    setLang() {
      this.$r.lang = this.$storage.get('lang', this.$r.lang)
      this.lang_loads(this.$r.lang)
      document.documentElement.setAttribute('lang', this.$r.lang)
    },
    lang_loads(lang) {
      this.$axios.get(`/api/translate/renusify,${this.$r.package}/${lang}`).then(({ data }) => {
        const d = {}
        const lng = data.length
        for (let i = 0; i < lng; i++) {
          d[data[i].key] = data[i][lang]
        }

        this.$translate.setMessages(d, lang)
        this.$translate.local = lang
      }).finally(() => {
        setTimeout(() => {
          this.lang_added = true
        }, 10)
      })
    },
    userInfo() {
      this.$r.store.user = { login: false, info: {} }
      this.$r.store.user_loaded = false
      if (this.$storage.get('auth.token', false)) {
        this.$r.store.user = this.$storage.get('user_login', {
          login: false,
          info: {}
        })
        this.$axios.get('/api/user').then(
          ({ data }) => {
            this.$r.store.user = data
            this.$storage.set('user_login', data)
            this.$r.store.user_loaded = true
          },
          () => {
            this.$r.store.user = {
              login: false,
              info: {}
            }
            this.$storage.remove('user_login')
            this.$r.store.user_loaded = true
          }
        )
      } else {
        this.$r.store.user_loaded = true
      }
    }
  }
}
