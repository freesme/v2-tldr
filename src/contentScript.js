'use strict';

// Content script file will run in the context of web page.
// With content script you can manipulate the web pages using
// Document Object Model (DOM).
// You can also pass information to the parent extension.

// We execute this script by making an entry in manifest.json file
// under `content_scripts` property

// For more information on Content Scripts,
// See https://developer.chrome.com/extensions/content_scripts

import { GoogleGenerativeAI } from '@google/generative-ai';

// Log `title` of current active web page
// const pageTitle = document.head.getElementsByTagName('title')[0].innerHTML;
// console.log(
//   `Page title is: '${pageTitle}' - evaluated by Chrome extension's 'contentScript.js' file`
// );

// Communicate with background file by sending a message
chrome.runtime.sendMessage(
  {
    type: 'GREETINGS',
    payload: {
      message: 'Hello, my name is Con. I am from ContentScript.',
    },
  },
  (response) => {
    console.log(response.message);
  }
);

// 获取当前页面的URL
console.log('URL:', window.location.href);
// https://www.v2ex.com/t/1086357#reply70
// 截取URL中的数字1086357
const topicId = window.location.href.match(/\/t\/(\d+)/)[1];
console.log('Topic ID:', topicId);
// 等待处理结果
let jsonData = {};

chrome.runtime.sendMessage(
  {
    type: 'ANALYSIS',
    payload: {
      message: topicId,
    },
  },
  (response) => {
    console.log('RESPONSE==========>',response.message);
    jsonData = response.message;
  }
);

// Listen for message
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'COUNT') {
    console.log(`Current count is ${request.payload.count}`);
  }

  // Send an empty response
  // See https://github.com/mozilla/webextension-polyfill/issues/130#issuecomment-531531890
  sendResponse({});
  return true;
});

const legendColors = [
  '#f1e05a',
  '#563d7c',
  '#e34c26',
  '#2668e3',
  '#97c98f',
  '#ffc400',
];

// buildPageDom(jsonData.topic, jsonData.comments, legendColors);

/**
 * 构建页面DOM
 * @param topicSummery 标题
 * @param data 评论数据
 * @param legendColors 图例颜色
 */
function buildPageDom(topicSummery, data, legendColors) {
  // 在主题下面添加展示区域
  const parent = document.querySelector('#Main > div:nth-child(2)');

  console.log('find title');
  if (parent) {
    console.log('find', parent);
  }

  // 创建容器元素
  const container = document.createElement('div');
  container.className = 'cell';

  const topic = document.createElement('div');
  topic.innerHTML = `<h4 style="line-height: 1.2">${topicSummery}</h4>`;
  container.appendChild(topic);

  // 创建进度条容器
  const progressBar = document.createElement('div');
  progressBar.className = 'progress-bar';
  container.appendChild(progressBar);

  // 创建图例容器
  const legend = document.createElement('div');
  legend.className = 'legend';
  container.appendChild(legend);

  // 动态生成进度条和图例项
  data.forEach((item, index) => {
    // 进度条部分
    const bar = document.createElement('div');
    bar.className = 'bar';
    bar.style.width = `${item.percentage}%`;

    let color = legendColors[index % 7];

    bar.style.backgroundColor = color;
    progressBar.appendChild(bar);

    // 图例项部分
    const legendItem = document.createElement('div');
    legendItem.className = 'legend-item';

    const legendColor = document.createElement('div');
    legendColor.className = 'legend-color';
    legendColor.style.backgroundColor = color;

    // 创建 legendText，将标题和占比放在一行，详情在新行
    const legendText = document.createElement('div');
    legendText.className = 'legend-text';
    legendText.innerHTML = `<span><strong>${item.name}</strong> ${item.percentage}%</span><br><small>${item.details}</small>`;

    legendItem.appendChild(legendColor);
    legendItem.appendChild(legendText);
    legend.appendChild(legendItem);
  });
  // 将容器添加到页面的 body 中
  parent.appendChild(container);
}
