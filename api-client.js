/* ============================================================
   WINLINE GIVEAWAY — клиент API (мост к бэкенду)
   Если WINLINE_CONFIG.apiBase пустой — WL_API.enabled()===false,
   и мини-апп работает в демо-режиме (localStorage). Когда указан —
   эти методы ходят на бэкенд (см. server/src/api.js).
   ============================================================ */
(function () {
  const tg = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;
  const base = () => (window.WINLINE_CONFIG && window.WINLINE_CONFIG.apiBase) || '';
  const initData = () => (tg && tg.initData) || '';

  async function call(path, method, body) {
    const res = await fetch(base() + path, {
      method: method || 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Init-Data': initData() },
      body: body ? JSON.stringify(body) : (method === 'GET' ? undefined : JSON.stringify({ initData: initData() })),
    });
    if (!res.ok) throw new Error('API ' + res.status);
    return res.json();
  }

  window.WL_API = {
    enabled: () => !!base(),
    // участник
    me: () => call('/api/me', 'POST', { initData: initData() }),
    giveaway: (code) => call('/api/giveaway/' + encodeURIComponent(code), 'GET'),
    participate: (d) => call('/api/participate', 'POST', Object.assign({ initData: initData() }, d)),
    mine: () => call('/api/mine', 'POST', { initData: initData() }),
    // админ
    adminList: () => call('/api/admin/giveaways', 'GET'),
    adminCreate: (draft) => call('/api/admin/giveaways', 'POST', { initData: initData(), draft }),
    adminStatus: (id, status) => call('/api/admin/giveaways/' + id + '/status', 'PATCH', { initData: initData(), status }),
    analytics: (id) => call('/api/admin/analytics/' + id, 'GET'),
    draw: (id) => call('/api/admin/draw/' + id, 'POST', { initData: initData() }),
    exportSheet: (id) => call('/api/admin/export/' + id, 'POST', { initData: initData() }),
    team: (payload) => call('/api/admin/team', 'POST', Object.assign({ initData: initData() }, payload)),
  };
})();
