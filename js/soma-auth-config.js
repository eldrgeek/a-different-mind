// SOMA Auth config for A Different Mind.
// Publishable key — safe in client-side code.
//
// Auth is OPTIONAL here and always will be. The whole point of this site is
// meeting someone who is wary; demanding an account at the door would be the
// single most self-defeating thing it could do. Signing in unlocks exactly two
// things:
//
//   1. An invite link/QR that carries YOUR NAME to whoever you send it to.
//      An anonymous invite works too — it just says so, honestly.
//   2. For app admins: in-place copy editing (SOMA App Standard §17).
//
// Reading, ranking, and the entire conversation need no account, ever.
window.SOMA_AUTH_CONFIG = {
  url: 'https://omfwcodoimjmbrhssvfl.supabase.co',
  anonKey: 'sb_publishable_vi2qDWjozUJ5mi9dwirkLA_rj6UaqLf',

  methods: {
    magicLink: true,
    emailOtp:  false,
    password:  false,
    phone:     false,
    oauth:     ['google']
  }
};
