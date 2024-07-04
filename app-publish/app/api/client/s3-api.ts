
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// 请填写自己的accessKeyId, secretAccessKey, endpoint
const client = new S3Client({
    credentials: {
        accessKeyId: 'dc011bcd4ef02a3437db09b272989419',
        secretAccessKey: '45c669a36ddd717d3645731a73b6a40af43f8d7cc2336d9cdab76f7955281ad2'
    },
    endpoint: 'https://c3139e0ac31191541a73d5e3bd30c84f.r2.cloudflarestorage.com/app-publish',
    region: 'auto'
})

const tohex = (str: string) => {
    var hex, i;

    var result = "";
    for (i=0; i<str.length; i++) {
        hex = str.charCodeAt(i).toString(16);
        result += ("000"+hex).slice(-4);
    }

    return result
}

const s3UploadFile = async (file: File, title: string, desc: string, timestamp: number) => {

    let key = file.name

    if (timestamp > 0) {
        const type = key.slice(key.lastIndexOf('.'))
        key = key.slice(0, key.lastIndexOf('.'))
    
        key = `${key}_${timestamp}${type}`
    }


    const titleStr = tohex(title)
    const descStr = tohex(desc)

    const uploadCmd = new PutObjectCommand({
        "Bucket" : 'app-publish',
        "Key" : key,
        "Body" : file,
        "Metadata" : {
            "title" : titleStr,
            "desc" : descStr
        }
    })

    try {
        const resp = await client.send(uploadCmd)
        return resp
    } catch (err) {
        return null
    }
}

export {
    s3UploadFile
}