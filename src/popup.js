'use strict';

import './popup.css';

(function () {
  // We will make use of Storage API to get and store `count` value
  // More information on Storage API can we found at
  // https://developer.chrome.com/extensions/storage

  // To get storage access, we have to mention it in `permissions` property of manifest.json file
  // More information on Permissions can we found at
  // https://developer.chrome.com/extensions/declare_permissions
  document.addEventListener('DOMContentLoaded', () => {
    const apikeyInput = document.getElementById('apikey');
    const saveButton = document.getElementById('save');
    const statusDiv = document.getElementById('status');

    // 从存储中恢复 Apikey
    chrome.storage.sync.get(['apikey'], (result) => {
      if (result.apikey) {
        apikeyInput.value = result.apikey;
      }
    });

    // 保存 Apikey 到存储
    saveButton.addEventListener('click', () => {
      const apikey = apikeyInput.value.trim();
      chrome.storage.sync.set({ apikey }, () => {
        statusDiv.textContent = 'Apikey 已保存！';
        setTimeout(() => {
          statusDiv.textContent = '';
        }, 2000);
      });
    });
  });

  // function restoreCounter() {
  //   // Restore count value
  //   counterStorage.get((count) => {
  //     if (typeof count === 'undefined') {
  //       // Set counter value as 0
  //       counterStorage.set(0, () => {
  //         setupCounter(0);
  //       });
  //     } else {
  //       setupCounter(count);
  //     }
  //   });
  // }
  //
  // document.addEventListener('DOMContentLoaded', restoreCounter);
  //
  // // Communicate with background file by sending a message
  // chrome.runtime.sendMessage(
  //   {
  //     type: 'GREETINGS',
  //     payload: {
  //       message: 'Hello, my name is Pop. I am from Popup.',
  //     },
  //   },
  //   (response) => {
  //     console.log(response.message);
  //   }
  // );
})();
