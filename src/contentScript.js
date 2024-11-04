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
const pageTitle = document.head.getElementsByTagName('title')[0].innerHTML;
console.log(
  `Page title is: '${pageTitle}' - evaluated by Chrome extension's 'contentScript.js' file`
);

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

const apiKey = 'AIzaSyCjn3NLcHXn3YySI5MNGkX1bVyZKhGoVdY';

const systemInstruction = `你是一个地球上最厉害的话题评论分析总结机器人，注意严谨分析，我将会使用json格式给你发送
话题的主题（topic），话题内容（content），和评论（comments）,需要总结评论的观点倾向数量前几名（limit）
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

const prompt = `{
  "topic": "打算换个折叠屏，请问 Teams 和 MS Authenticator 在国内的兼容性",
  "limit":5,
  "content":"最近 iPhone 上新，但是没什么新意，所以考虑换个 Android 折叠屏试试，暂时看中了 Xfold3

现在顾虑的主要就是工作中需要使用的一些软件的兼容性，具体来讲就是 MS Authenticaotr 和 Teams ，尤其是 Authenticator ，基本上每天都要用几次。

有没有在 Android 上使用的朋友来讲一下，如果解决 FQ 并且可以从 Google Play Store 安装的话，使用体验如何呢？",
"comments":["安卓翻墙不要太简单，丝滑的很，这点不用担心。\\r\\n至于 MS Authenticaotr 和 Teams 的兼容性，你找个 vivo 的店，现场试一下就知道了。","一样对 iPhone 失望，摸过 Vivo X Fold 3 感觉比我的 14 PM 还轻，流畅度也比我之前用过的 OneUI 好很多，就闲鱼收了一台二手，今天到，准备双持一段时间试试看。","富强 app 么 github 下 apk ，安卓都是免费的，就是界面不如苹果上什么 surge 啊什么的，但是免费就完事了\\r\\n而且新的协议什么 reality ，hysteria ，苹果上那几个支持也很差啊\\r\\n\\r\\n谷歌服务么，安卓现在除了华为都自带的啊\\r\\n设置里打开下，就能用了啊","Authenticaotr  苹果换安卓 有个问题 （起码我是这样 可能设置不对？）同一个账号  同步没了。。。。。。","FQ 不是主要问题，主要问题是上述两个应用的兼容性如何，尤其是 Authenticator\\r\\n\\r\\n在 Vivo 店里我既没办法现场装 Play Store 下载，也没办法找公司 IT 绑我的域账号，所以只有先问问用过的朋友，避免出什么幺蛾子。","@dodakt 同步没了是什么意思？小红书上看到有人说推送会没有。","@JingW #6  我表述有点问题 就是 ios 到安卓  原来保存的 2FA 没有了 只能一个一个重新弄回来 可能之前靠的是 iCloud 保存  换了安卓后 靠微软自身的云存储保存","@dodakt 懂了，我已经做好这个心理准备了😅","vivo 在用，有用 authenticator ，没什么问题，authenticator 还支持无障碍功能，这样可以在更多的应用自动填充。\\r\\ngoogle play 在手机的设置中 用户与账号 中打开谷歌基础服务，就会自动获得 play 商店和框架，挂上梯子就都能正常使用了。\\r\\nFQ 推荐 clash meta ，在 vivo 的控制中心里可以直接控制 clash meta 的开关","@dodakt 我感觉微软那个 Authenticator 也没有云保存啊，同一个手机，卸载 app 再重新安装登录回来，之前的 Auth 信息都没了。还是说需要在哪里设置一下？","正好我有用这两个软件，也正好从 iPhone 切换到安卓，我只能说，这两个软件如果是必需的话，建议仍然苹果。\\r\\n\\r\\nMS Authenticator 基本没有认证弹出提示，如果能接受只需要数字码的话，倒是可以用一下。另外这个好像可以用任意 Authenticator 替代的，我公司的域绑定，我就是直接用 google Authenticator 绑定的，验证码一直正常。\\r\\nTeams 基本已经放弃，认证是可以，但是过一段时间就失效。iphone 下面的认证很简单，还能用一用。Teams 我在安卓下搞了几次就放弃不用了，反正有急事会有人微信找我的。","剪贴板同步貌似还是不支持","解决不了推送吧？","@liuzimin 设置里面可选 iCloud 备份。我一直在用它。换了几次手机没遇到什么问题。","没法自动弹出通知，得手动打开","这个问题微软中国自己都搞不定，所以才会给中国员工发 iPhone 15…","微软中国 teams 安卓一直没法用啊","这两个用不了的。上面说能用的大概率不是工作用，到时候翻车有你急的。","我都看不懂你们说的兼容性是啥意思了,安装不上?","外企的话还是老老实实 iphone 吧。android 通知推送是大问题","@dodakt 安装完成后打开 不要点登录 。。。要点下面的小字 开始恢复。。。。。。","@liuzimin 我是 Android 用户。。。。MS Authenticator 设置里有 云备份         。在新设备上不能直接登录。要选下面小子 开始恢复。。。。。","authenticator 我用 Google 的 可以同步 没问题\\r\\n小米设置里打开 Google 服务，去小米商店搜索 Google play 安装最新商店，然后挂梯子去 play 商店下 Google 认证器。\\r\\nteams 没用过不知道","有了 play 商店，理论上啥都可以下载啊，teams 也有","我和你询问的使用环境完全相符所以可以非常准确的回答。\\r\\n\\r\\n虽然两者本身的使用不需要梯子，但两者的推送都强依赖于 GMS ，所以如果你的设备有 Google play 服务并且有梯子那就没问题，否则就只能手动打开 APP 刷新通知。\\r\\n\\r\\n我手机有比较稳定的全天候翻墙环境所以推送都没有问题，Authenticator 弹通知很及时 ，基本都 5 秒以内，不过 teams 通知给我手动关掉了(下班不想看消息……)\\r\\n\\r\\n另外需要注意的是国行安卓系统大多对通知和后台限制的非常严格，即使你有完备的外网环境可能也得通过一些设置把特定应用放行/添加白名单才能稳定收到推送。","不要在个人手机上装 teams 和 Authenticator ，太泄漏隐私了\\r\\n\\r\\n公司不给你配手机嘛","@huluhulu Authenticator 主动弹出没什么意义吧，反正什么时候需要弹验证自己都是知道的，我每次都是需要验证了，打开 Authenticator 就行了。根本不等弹通知出来。","teams 通知无解，挂后台照样被杀","@dodakt 有的厂家的 Authenticator ，换手机都需要后台删除设备，重新 Enroll ，挺恶心的，尤其权限没在自己这边，如果在印度团队那你就等吧。","MS Authenticator 能用，印象里没有 google 框架打不开，然后平时用能直连\\r\\n\\r\\n注意小心他家的云同步逻辑，自己操作很容易直接把云端清空。。如果你只用来登微软账号的话好像倒是不用担心这个","生产力有多屏电脑，大屏影音娱乐有平板，出差有轻薄本，一直不明白折叠手机有何意义，而且这玩意还会降低续航、增加重量、增加操作麻烦程度。\\r\\n\\r\\n我身边倒是很多中产女第一时间买了这玩意。","@laminux29 主要追求 All-in-one ，尝试用一台设备代替手机+娱乐平板，这样出门就可以少带东西。","@Mortisc @huluhulu @maplerecall 感谢留言，非常有参考价值 /bow","Authenticator 的 app 好像是通用的协议？\\r\\n\\r\\n至少我目前在用的基本都能用 Google authxxxApp 和 1password 内建的认证功能支持\\r\\n\\r\\n我全给迁移到 1password 了，就因为他可以方便的自动填写。。","你只要会科学上网，然后把你手机的 google play 弄出来，天下就是你的。","realme GT neo5 ，国行版，直接就装好谷歌全家桶和 Authenticator 了，steam 和 CLOUDFLARE 都用这个登录。","简单用了两小时 X Fold 3 ，有些地方的体验感觉略微达不到预期。\\r\\n\\r\\n比如 YouTube 如果先在外屏打开，内屏首页就是直接放大，而不是双栏模式，需要关掉重开。播放视频的时候屏幕刷新率似乎会锁到 60Hz ，同时滑动 UI 就会觉得有些卡卡的。\\r\\n\\r\\nPlex Android 客户端体验不是很好，App 只要一离开超过两秒，再进入就会重新加载首页，部分地方页面跳转动画效果看起来很诡异…","微软的 2fa app 会掉同步，血的教训，已经很多人中过招了","@2000wcw @konakona 主要最近在小红书还是哪里看到有人说谷歌在减少对其他厂商的支持，所以从 Play Store 下载的东西可能不能在国行机器上用。 我有一些年没有用过 Android ，不知道具体情况咋样。可能还是得自己试一下，小马过河","Teams 强需求的话还是建议看看三星，可以考虑买国行刷外版（不会影响 Knox 破保）","@PrinceofInj 有用啊，公司很多页面是默认弹 MS Authenticator 认证允许，如果能弹出来点允许就可以了。如果弹不出来，页面上也没有验证码的地方，需要点切换到验证码认证，有时候又没有切换这个选项，很烦的。","回帖很多人没有用过企业版 teams ，那个东西的认证真的很烦，不是说翻墙就可以，还涉及到证书+Authenticator 认证，国行安卓手机基本放弃。\\r\\n如果能稳定翻墙+GMS+Google Store ，那就没问题。","之前用小米手机，Google 提示就是收不到的，刷了 MIUI Global 以后这个问题就解决了","Authenticator 要 Google 套件 要翻墙\\r\\n而且安卓不支持多个账号启用无密码登录只能一个\\r\\n如果有多账户需求还得用 iPhone","三星国行在用，企业 teams ，outlook 都没问题","Authenticator 安卓端是自建同步，苹果端是 iCloud 同步，还不能双向迁移，建议还是用第三方开源支持多云同步的 2FA app","不是 用苹果手机不好么.. 为哈要跟着安卓折腾","Authenticator 的话，如果是通用的 TOTP 那种 2FA 验证，甚至可以自己在线部署一个。\\r\\n手机有浏览器就能用。https://github.com/Bubka/2FAuth","手持 vivo. MS Authenticator 和 Teams 都能用。普通的二次验证是没问题\\r\\n但是最近公司强制用 Passkey 验证，这个死活搞不定。最后换 iphone 了。。。","这两个我都能用。为啥有人说用不了呢?","@zhuangqhc #49 teams 接收通知的实时性高吗？需要特殊设置吗？比如挂梯子之类的","Fuck 它的 authenticator ，换新手机，MFA 无法迁过来。统统丢失，就剩下微软自己的一个。换成 FreeOTP 了","双持 iPhone 14PM + Vivo X Fold 3 ，真的不错，折叠屏还是非常有用的，出去旅游查地图、拍照（特别是夜景，无敌）看视频都很赞","题外话 Authenticator 是个垃圾！","当初从 andriod 换到 ios ，就发现 MS Authenticator 看起来是支持跨平台的，但实际并不支持\\r\\n所以后来换到了 authy","说起来，personal profile 里的 VPN 并不能改变 work profile 里 app 的网络流向\\r\\n你要让公司给你开 work profile 的话，你要先在路由器那边翻过去，然后才能激活成功\\r\\nTeams 本身用起来没啥问题，不翻也能用，但是后台通知看上去走的是 personal profile 里的 GCM 推送\\r\\n每次更新 Teams ，需要打开一下让它在外网完成 update ，后台通知才能继续用","MS Authenticaotr 我在华为上都能用，不用担心，就只是不能装 Play 版而已","企业这一块，考虑替换为 iPhone 。微软自己都是这么干，统一给用安卓的员工，配一台 iPhone 。","直接在 M$网站下载的 Teams 和 MS Authenticator 的 APK\\r\\n没有实时推送，别人电话我几乎都是漏接的，Teams 就成了单纯的聊天/会议工具了\\r\\nMS Authenticator 的推送验证也推不到，这个还能忍，输个 MFA Code 也就解决了","我的华为 mate40 pro 装上 microG 套件模拟 google service, 搭梯子后 MS Authenticator 、okta  和 G 家的都可以正常推送消息","你要是用这些东西，还是买三星吧。。","外企用户。手持 一加 ColorOS 15\\r\\n\\r\\nAuthenticator 要比 iPhone 上弹出通知慢 3-5 秒，能用但不好用。\\r\\nTeams / Outlook 能收发消息。但是 （ 1 ）在线状态全部不正常，我连偶尔看老板是不是走了方便溜号下楼散步都做不到了；（ 2 ）通知大概 5 分钟后随心情推送，有时候几个小时才推送， 如果心里慌点开应用，会一下子突突突弹出 N 个通知。\\r\\n\\r\\n已经在攒钱等明年初的 iPhone SE4 了，这个通知问题太恼火，搞不好公司晚上把我裁了，第二天上班路上我才看到消息。"]


}`;

console.log('Generating content...');

const result = await model.generateContent(prompt);
let message = result.response.text();
console.log(message);
// 解析为json
let jsonData = JSON.parse(message);

let legendColors = [
  '#f1e05a',
  '#563d7c',
  '#e34c26',
  '#2668e3',
  '#97c98f',
  '#ffc400',
];

const topicSummery = jsonData.topic;
const data = jsonData.comments;

// 动态数据，包含每个标题的名称、占比、颜色和详情信息
// const data = [
//   { name: "🤨平台收费", percentage: 30, color: "#f1e05a", details: "平台收费包含平台抽成、路费、灯泡材料和人工费，作者认为平台报价过高，但平台上门服务包含了路费和人工费，所以价格相对较高。" },
//   { name: "👍自己动手", percentage: 25, color: "#563d7c", details: "作者和部分评论者建议自己动手更换灯泡，认为更换筒灯操作简单，网上有教程可以参考，可以节省费用。" },
//   { name: "👎平台坑人", percentage: 10, color: "#e34c26", details: "部分评论者认为平台收费相对合理，因为包含了路费、人工费和材料费，但价格仍然偏高，建议找更便宜的维修渠道。" },
//   { name: "😕其他渠道", percentage: 10, color: "#2668e3", details: "用于定义网页的基本结构" },
//   { name: "👎价格合理", percentage: 10, color: "#de3711", details: "平台收费包含平台抽成、路费、灯泡材料和人工费，作者认为平台报价过高，但平台上门服务包含了路费和人工费，所以价格相对较高。" },
//   { name: "💰价格合理", percentage: 15, color: "#14cb78", details: "用于定义网页的基本结构" }
// ];

// 在主题下面添加展示区域
const parent = document.querySelector('#Main > div:nth-child(2)');
console.log("don't find title");
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
