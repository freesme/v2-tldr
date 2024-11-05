'use strict';

// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages

import { GoogleGenerativeAI } from '@google/generative-ai';

let apiKey = null;

chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
  // 初始化 Apikey
  getApikey((result) => {
    apiKey = result;
  });
});

// 函数用于动态获取 apikey
function getApikey(callback) {
  chrome.storage.sync.get(['apikey'], (result) => {
    if (result.apikey) {
      console.log('已获取到 Apikey: ', result.apikey);
      if (callback) {
        callback(result.apikey);
      }
    } else {
      console.log('未找到已保存的 Apikey');
      if (callback) {
        callback(null);
      }
    }
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'FETCH_DATA') {
    console.log('接收到消息请求:', request);

    // 使用异步函数来处理数据获取
    (async () => {
      try {
        const data = await genimiAnalysis(request.payload.topicId);
        // 返回结果给 content.js
        sendResponse({ success: true, data });
      } catch (error) {
        console.error('获取数据时出错:', JSON.stringify(error));

        if (error.errorDetails[0].reason === 'API_KEY_INVALID') {
          sendResponse({ success: false, error: 'API_KEY_INVALID' });
        } else {
          sendResponse({ success: false, error: error });
        }
      }
    })();
    // 返回 true 表示 sendResponse 是异步调用
    return true;
  }
});

async function genimiAnalysis(topicId) {
  let topic = await v2Topic(topicId);
  const comments = await allComments(topicId);

  const prompt = buildPrompt(topic.title, topic.content, comments);
  return await postAnalysis(prompt);
}

async function allComments(topicId) {
  const comments = [];
  let p = 1;
  let result = await v2Comments(topicId, p);
  while (result.length > 0) {
    comments.push(...result);
    p++;
    result = v2Comments(topicId, p);
  }
  return comments;
}

async function fetchFromV2EX(endpoint) {
  return fetch(endpoint, {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ac1d9a0f-21e2-44b9-9154-07946169bf0a',
    },
  })
    .then((response) => response.json())
    .then((data) => data.result)
    .catch((errors) => {
      console.error('API 请求失败:', errors);
    });
}

async function v2Topic(topicId) {
  console.log('请求V2EX TOPIC API:', topicId);
  return fetchFromV2EX('https://www.v2ex.com/api/v2/topics/' + topicId);
}

async function v2Comments(topicId, p) {
  console.log('请求V2EX COMMENTS API:', topicId, 'p=', p);
  return fetchFromV2EX(
    'https://www.v2ex.com/api/v2/topics/' + topicId + '/replies?p=' + p
  );
}

// const prompt = buildPrompt();
// let jsonData = await postAnalysis(prompt);

/**
 * 话题内容
 * @param topic 标题
 * @param content 内容
 * @param comments 评论
 * @returns {string} 返回json格式的话题内容
 */
function buildPrompt(topic, content, comments) {
  return `{
    "topic": "${topic}",
    "content":"${content}",
    "comments": ${comments}
  }`;
}

/**
 * 将内容发送Gemini分析
 * @param prompt
 * @returns {Promise<any>} 返回分析结果
 */
async function postAnalysis(prompt) {
  const systemInstruction = `你是一个地球上最厉害的话题评论分析总结机器人，注意严谨分析，我将会使用json格式给你发送
话题的主题（topic），话题内容（content），和评论（comments）,需要总结【5】种评论的观点
你需要将主题和内容分析总结，对评论进行观点情感分析总结，并估算观点倾向的占比，然后将结果以json格式文本返回给我，不要添加格式说明前缀，返回结果json的格式及要求是：
{
  "topic": "题目和题目内容内容的分析总结",
  "comments": [
    {
      "name":"观点概括（6个字左右，第一个字符是符合语境的emoji表情）",
      "details":"观点的详细说明",
      "percentage": 观点的占百分比【重要：百分比相加之和需要等于100%】(数据类型为double，保留两位小数，输出结果根据rate降序排列)
    }
  ],
}
`;

  // 用户未定义APIKey使用默认值
  if (apiKey === null) {
    apiKey = 'AIzaSyCjn3NLcHXn3YySI5MNGkX1bVyZKhGoVdY';
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: systemInstruction,
  });

  console.log('Generating content...', apiKey);

  const result = await model.generateContent(prompt);
  console.log('Gemini response:', result);

  let message = result.response.text();
  // 解析为json
  return JSON.parse(message);
}
