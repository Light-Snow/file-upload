const koa = require('koa')
const koaBody = require('koa-body')
const fs =  require('fs')
const serve = require('koa-static-cache')
const path = require('path')
const route = require('koa-router')
const cors = require('koa-cors')
const app = new koa()
const router = new route()

router.post('/batchDeleteFiles', (ctx) => {
  try {
    const {files} = ctx.request.body
    console.log(files)
    files.forEach((file) => {
      fs.unlink(`/root/data/${file}`)
    })
    ctx.body = {
      msg: '删除物理文件成功',
      success: true
    }
  } catch (e) {
   ctx.body = {
      msg: e.message,
      success: false
    }
  }
})

router.post('/upload', async (ctx, next) => {
  try {
    let file = ctx.request.body.files.file
    console.log(file.path, file.name)
    let reader = fs.createReadStream(file.path)
    let stream = fs.createWriteStream(path.join('/root/data', file.name))
    reader.pipe(stream)
    ctx.body = {
      msg: '上传成功',
      success: true,
      filename: `http://photo-static.finupfriends.com/${file.name}`
    }
  } catch (e) {
    ctx.body = {
      msg: e.message,
      success: false
    }
  }

})
// 异步判断文件是否存在
function access(file) {
    // new Promise 需要传入一个executor 执行器
    // executor需要传入两个函数 resolve reject
    return new Promise((resolve,reject)=>{
        // 异步判断文件是否存在
        fs.access(file, (err) => {
            if(err){
                resolve(false)
            }else{
                resolve(true)
            }
        })
    })
}

router.post('/fileUpload', async (ctx, next) => {
    try {
        let file = ctx.request.body.files.file
        let {folder, fileExistsVerify = false} = ctx.request.body.fields
        console.log(ctx.request.body.fields)
        console.log(file.name)
        if (!folder) {
            ctx.body = {
                msg: '缺少文件所在目录（folder）',
                success: false
            }
            return false;
        }
        console.log(typeof fileExistsVerify)
        if (fileExistsVerify) {
            let accessResult = await access(`../../data/${folder}/${file.name}`)
            console.log(accessResult)
            if (accessResult) {
                ctx.body = {
                    msg: `文件夹${folder}下的${file.name}文件已存在`,
                    success: false
                }
                return false;
            }
        }
        fs.access(`../../data/${folder}`, (err)=>{
            if(err) { // 目录不存在
                console.log(`目录不存在，即将创建目录文件夹${folder}`);
                // fs.mkdir  创建目录  
                fs.mkdir(`../../data/${folder}`, (error) =>{
                    if(error){
                        console.log(error);
                        return false;
                    }
                    console.log(`创建${folder}目录成功`);
                })
            }
            let reader = fs.createReadStream(file.path)
            let stream = fs.createWriteStream(path.join(`../../data/${folder}`, file.name))
            reader.pipe(stream)
            console.log(`在文件夹${folder}下创建${file.name}文件成功`); 
        })
        ctx.body = {
            msg: '上传成功',
            success: true,
            filename: `http://photo-static.finupfriends.com/${folder}/${file.name}`
        }
        
    } catch (e) {
        ctx.body = {
            msg: e.message,
            success: false
        }
    }

})
router.post('/deleteFiles', (ctx) => {
    console.log(ctx.request.body)
    try {
        const {files, folder} = ctx.request.body
        console.log(files)
        files.forEach((file) => {
            console.log(file)
            fs.unlink(`../../data/${folder}/${file}`, (err) => {
                console.log(`删除${folder}文件夹下的${file}文件成功`)
            })
        })
        ctx.body = {
            msg: `删除${folder}文件夹下的${files}文件成功`,
            success: true
        }
    } catch (e) {
        ctx.body = {
            msg: e.message,
            success: false
        }
    }
})


app.use(cors())

app.use(serve('/root/data', {dynamic: true}))

app.use(koaBody({multipart: true}))

app.use(router.routes())

// listen
app.listen(4400);
console.log('listening on port 4400')
