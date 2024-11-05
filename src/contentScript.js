'use strict';

// Content script file will run in the context of web page.
// With content script you can manipulate the web pages using
// Document Object Model (DOM).
// You can also pass information to the parent extension.

// We execute this script by making an entry in manifest.json file
// under `content_scripts` property

// For more information on Content Scripts,
// See https://developer.chrome.com/extensions/content_scripts
// Log `title` of current active web page
// const pageTitle = document.head.getElementsByTagName('title')[0].innerHTML;
// console.log(
//   `Page title is: '${pageTitle}' - evaluated by Chrome extension's 'contentScript.js' file`
// );

// 获取当前页面的URL
console.log('URL:', window.location.href);
// https://www.v2ex.com/t/1086357#reply70
// 截取URL中的数字1086357
const topicId = window.location.href.match(/\/t\/(\d+)/)[1];
console.log('Topic ID:', topicId);
// 等待处理结果
let jsonData = {};
const legendColors = [
  '#f1e05a',
  '#563d7c',
  '#e34c26',
  '#2668e3',
  '#97c98f',
  '#ffc400',
];

chrome.runtime.sendMessage(
  {
    type: 'FETCH_DATA',
    payload: {
      topicId: topicId,
    },
  },
  (response) => {
    // 检查是否有错误
    if (chrome.runtime.lastError) {
      console.error('消息处理出错:', chrome.runtime.lastError.message);
      return;
    }
    // 处理来自 background.js 的响应
    if (response && response.success) {
      console.log('接收到的数据:', response.data);
      jsonData = response.data;
      buildPageDom(jsonData.topic, jsonData.comments, legendColors);
    } else if (response && !response.success) {
      console.error('后台返回的错误:', response.error);
      if (response.error === 'API_KEY_INVALID') {
        alert('请检查Gemini API Key是否正确');
      } else {
        alert('后台返回的错误:', response.error);
      }
    } else {
      console.error('无效的响应:', response);
    }
  }
);

/**
 * 构建页面DOM
 * @param topicSummery 标题
 * @param data 评论数据
 * @param legendColors 图例颜色
 */
function buildPageDom(topicSummery, data, legendColors) {
  console.log('构建页面DOM:', topicSummery, data, legendColors);
  // 在主题下面添加展示区域
  // const parent = document.querySelector('#Main > div:nth-child(2)');
  const parent = document.querySelector('#Rightbar');

  console.log('find title');
  if (parent) {
    console.log('find', parent);
  }

  // 创建容器元素
  const container = document.createElement('div');
  // container.className = 'cell';
  container.className = 'cell box';

  const topic = document.createElement('div');
  topic.innerHTML = `<h4 style="line-height: 1.4">${topicSummery}</h4>`;
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
    legendText.innerHTML = `<!--<span><strong>${item.name}</strong> ${item.percentage}%</span><br><small>${item.details}</small>-->`;
    legendText.innerHTML = `<span><strong>${item.name}</strong></span><br><small>${item.details}</small>`;

    legendItem.appendChild(legendColor);
    legendItem.appendChild(legendText);
    legend.appendChild(legendItem);
  });
  // 将容器添加到页面的 body 中
  parent.appendChild(container);
}
