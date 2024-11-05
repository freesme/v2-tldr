'use strict';

import './popup.css';

document.addEventListener('DOMContentLoaded', () => {
  const apikeyInput = document.getElementById('apikey');
  const v2tokenInput = document.getElementById('v2token');
  const saveButton = document.getElementById('save');
  const statusDiv = document.getElementById('status');

  // 從存儲中恢復 Apikey 和 V2 Token
  chrome.storage.sync.get(['apikey', 'v2token'], (result) => {
    if (result.apikey) apikeyInput.value = result.apikey;
    if (result.v2token) v2tokenInput.value = result.v2token;
  });

  // 保存 Apikey 和 V2 Token 到存儲
  saveButton.addEventListener('click', () => {
    const apikey = apikeyInput.value.trim();
    const v2token = v2tokenInput.value.trim();

    chrome.storage.sync.set({ apikey, v2token }, () => {
      statusDiv.textContent = 'API Key 和 V2 Token 已保存！';
      setTimeout(() => (statusDiv.textContent = ''), 2000);
    });
  });
});
