'use strict';

// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages

import { GoogleGenerativeAI } from '@google/generative-ai';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GREETINGS') {
    const message = `Hi ${
      sender.tab ? 'Con' : 'Pop'
    }, my name is Bac. I am from Background. It's great to hear from you.`;

    // Log message coming from the `request` parameter
    console.log(request.payload.message);
    // Send a response message
    sendResponse({
      message,
    });
  }

  if (request.type === 'ANALYSIS') {
    let topicId = request.payload.message;
    console.log('接收到Topic ID:', topicId);
    requestV2Api(topicId);
    // Log message coming from the `request` parameter
    console.log('FROM CONTENT=====>>>>', request.payload.message);
    // Send a response message
    let message = requestV2Api(topicId);
    sendResponse({ message });
  }
});

async function requestV2Api(topicId) {
  console.log('请求V2EX API:', topicId);
  // 创建请求
  let topic;
  await fetch(`https://www.v2ex.com/api/v2/topics/${topicId}`, {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ac1d9a0f-21e2-44b9-9154-07946169bf0a', // 如果 API 使用 Bearer Token
    },
  })
    .then((response) => {
      console.log(response);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    })
    .then((data) => {
      topic = data;
      console.log('请求V2EX API结果:', topic); // Log the topic data here
    })
    .catch((error) => console.error('Error:', error));

  console.log('请求V2EX API结果:', topic);
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
  const apiKey = 'AIzaSyCjn3NLcHXn3YySI5MNGkX1bVyZKhGoVdY';
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

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: systemInstruction,
  });

  console.log('Generating content...');

  const result = await model.generateContent(prompt);

  let message = result.response.text();
  console.log(message);
  // 解析为json
  return JSON.parse(message);
}
