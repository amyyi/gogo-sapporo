// Split Bill API Client — Google Apps Script Backend + localStorage Cache
const SplitBill = (() => {
  // ⚠️ 部署 GAS web app 後，把 URL 貼在這裡
  const GAS_URL = window.SPLIT_BILL_GAS_URL || 'https://script.google.com/macros/s/AKfycbykra5Qimw8cBz5KD69m4eQYZ3_luC_f8cBIkVcCurlnOoJmQVAH_pr0eZSNf_ftIfssg/exec';

  const GROUP_MEMBERS = [
    { id: 'amy', name: 'Amy' },
    { id: 'luna', name: 'Luna' },
    { id: 'fish', name: 'Fish' },
    { id: 'tony', name: 'Tony' },
    { id: 'parker', name: 'Parker' },
    { id: 'awei', name: '阿維' },
    { id: 'wei', name: 'Wei' },
    { id: 'baoan', name: '保安' },
    { id: 'chen', name: '陳' },
    { id: 'liaojinwei', name: '廖晉緯' },
    { id: 'wangyixiang', name: '王奕翔' },
  ];

  const CACHE_KEYS = {
    expenses: 'split_bill_expenses',
    settlement: 'split_bill_settlement',
    pending: 'split_bill_pending',
    identity: 'split_bill_identity',
  };

  function getCache(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function setCache(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch { /* storage full */ }
  }

  // GAS web app redirects (302) so we need to follow it
  async function gasGet(params = {}) {
    const query = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('&');
    const url = GAS_URL + (query ? '?' + query : '');
    const res = await fetch(url, { redirect: 'follow' });
    if (!res.ok) throw new Error(`GAS error ${res.status}`);
    return res.json();
  }

  async function gasPost(body) {
    const res = await fetch(GAS_URL, {
      method: 'POST',
      redirect: 'follow',
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`GAS error ${res.status}`);
    return res.json();
  }

  async function getExpenses(day) {
    try {
      const params = { action: 'expenses' };
      if (day) params.day = day;
      const result = await gasGet(params);
      if (!day) setCache(CACHE_KEYS.expenses, result.data);
      return result.data;
    } catch {
      const cached = getCache(CACHE_KEYS.expenses);
      if (cached) {
        return day ? cached.filter(e => e.day === Number(day)) : cached;
      }
      return [];
    }
  }

  async function addExpense(data) {
    try {
      const result = await gasPost({ action: 'add_expense', data });
      if (!result.success) throw new Error(result.error);
      return result.data;
    } catch (err) {
      // Offline fallback
      const pending = getCache(CACHE_KEYS.pending) || [];
      const offlineExpense = {
        ...data,
        id: `offline_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        splitAmong: data.splitAmong || [],
        customAmounts: data.customAmounts || {},
        createdAt: new Date().toISOString(),
        _offline: true,
      };
      pending.push({ action: 'add_expense', data });
      setCache(CACHE_KEYS.pending, pending);

      const cached = getCache(CACHE_KEYS.expenses) || [];
      setCache(CACHE_KEYS.expenses, [offlineExpense, ...cached]);

      return offlineExpense;
    }
  }

  async function updateExpense(id, data) {
    const result = await gasPost({ action: 'update_expense', id, data });
    if (!result.success) throw new Error(result.error);
    return result;
  }

  async function deleteExpense(id) {
    try {
      await gasPost({ action: 'delete_expense', id });
    } catch { /* offline — just remove from cache */ }
    const cached = getCache(CACHE_KEYS.expenses) || [];
    setCache(CACHE_KEYS.expenses, cached.filter(e => e.id !== id));
    return true;
  }

  async function getSettlement() {
    try {
      const result = await gasGet({ action: 'settlement' });
      setCache(CACHE_KEYS.settlement, result.data);
      return result.data;
    } catch {
      return getCache(CACHE_KEYS.settlement) || { balances: {}, transfers: [] };
    }
  }

  async function getSettlementText() {
    try {
      const url = GAS_URL + '?action=settlement_text';
      const res = await fetch(url, { redirect: 'follow' });
      return res.text();
    } catch {
      return '無法載入結算摘要';
    }
  }

  async function syncPending() {
    const pending = getCache(CACHE_KEYS.pending) || [];
    if (pending.length === 0) return 0;

    let synced = 0;
    const remaining = [];

    for (const item of pending) {
      try {
        await gasPost(item);
        synced++;
      } catch {
        remaining.push(item);
      }
    }

    setCache(CACHE_KEYS.pending, remaining);
    return synced;
  }

  function getIdentity() {
    return getCache(CACHE_KEYS.identity);
  }

  function setIdentity(memberId) {
    setCache(CACHE_KEYS.identity, memberId);
  }

  function getPendingCount() {
    return (getCache(CACHE_KEYS.pending) || []).length;
  }

  function formatJPY(amount) {
    return `¥${Math.round(amount).toLocaleString('ja-JP')}`;
  }

  function getMemberName(id) {
    const member = GROUP_MEMBERS.find(m => m.id === id);
    return member ? member.name : id;
  }

  function getMemberInitial(id) {
    const member = GROUP_MEMBERS.find(m => m.id === id);
    if (!member) return '?';
    const name = member.name;
    if (/^[a-zA-Z]/.test(name)) return name[0].toUpperCase();
    return name[0];
  }

  return {
    GROUP_MEMBERS,
    getExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
    getSettlement,
    getSettlementText,
    syncPending,
    getIdentity,
    setIdentity,
    getPendingCount,
    formatJPY,
    getMemberName,
    getMemberInitial,
  };
})();
