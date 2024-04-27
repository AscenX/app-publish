# app-publish

**需要设置`worker-api`中的baseUrl和pubUrl**

**需要设置S3 API中的credentials**  

endpoint就是使用R2设置中的S3 API
accessKeyId和secretAccessKey需要在R2中创建一个API Token,创建完填入即可

在这里获取
![app-publish-5](https://github.com/AscenX/AscenX.github.io/blob/master/images/app-publish-5.jpg?raw=true)


## 部署
使用`Wrangler`

```
npm install wrangler -g
```

登录
```
wrangler login
```

在`r2-worker`中
```
wrangler deploy
```

在`app-publish`中

```
npm run deploy
```

具体可参照[我博客中的文章](https://ascen.me/2024/04/27/app-distribute/)