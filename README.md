# lotus-dev-projects
这个项目架子是用来 对接 java 或者 html静态开发的


## 依赖
* Node >= 6.0.0
* yarn

## 安装
根目录下执行 `yarn`

## 目录结构
源码放在 src 目录下

``` 
├── apps
│   ├── 项目1
│       ├── index.html  // 入口页面，js和css等资源会自动整合到这里
│       └── index.js  // 入口js，这里使用的资源会被分析并整合到入口页面里
│   ├── 项目2
│       ├── index.html // 同上
│       └── index.js
│
└── assets // 这里放各项目公共用到的资源文件、图片、js、css..
```

## 配置文件
在 `conf/index.js`

* dev   开发时的相关配置
* build 部署时的相关配置

## 开发：HTML模式
执行 `npm run dev:html`

## 开发：jsp模式
1. 启动后端
2. 在配置文件中配置参数
    1. 在 dev.assetsRoot 配置生成文件到后端的哪个文件夹里
    2. 在 dev.proxyUrl 配置后端URL，前端会自动检测代码变动并刷新浏览器
3. 执行 `npm run dev:jsp`


## 启动不了？
* 留意错误信息，
* 通常是依赖变更了，试试执行 `yarn`

## 文档资料
[yarn](https://yarnpkg.com/zh-Hans/)

## P.S
处于【开发：jsp模式】时，如果还挂了代理，在授权时可能会奇怪的问题，暂时处理不了的情况下可以访问原后端起的服务地址开发。
