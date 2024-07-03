import { R2ObjectListResp, UploadResult } from "../../r2interface"

/// r2的API调用 base URL，用于接口调用
const baseUrl = 'https://r2-worker.zyb428.workers.dev/'
/// r2的公开子域，用于下载
const pubUrl = 'https://pub-8b9391eb808c46efaa19ef61f2264668.r2.dev'


const getObjectList = async (): Promise<R2Object[]> => {
    const url = baseUrl + 'getObjectList'

    try {
        const resp = await fetch(url, {method: 'GET'})
        const respData: R2ObjectListResp = await resp.json()
        return respData.objects
    } catch (err) {
        return []
    }
}

const uploadFile = async (file: File, title: string, desc: string, useTitleForName: boolean = false) => {
    const url = baseUrl + 'upload'

    const fileName = useTitleForName ? title : file.name

    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', fileName);
    formData.append('title', title);
    if (desc != null) {
        formData.append('desc', desc);
    }

    try {
        const resp = await fetch(url, {method: 'POST', body: formData})
        const respData: UploadResult = await resp.json()
        return respData
    } catch (err) {
        return null
    }
}

const downloadFile = async (object: R2Object) => {

    const url = `${baseUrl}getObject?name=${object.key}`

    try {
        const resp = await fetch(url, {method: 'GET'})
        return resp
    } catch (err) {
        return null
    }
}

const getDownloadUrl = (key: string, timestamp: number = 0) => {
    let fileName = key
    if (timestamp > 0) {
        const type = key.slice(key.lastIndexOf('.'))
        fileName = key.slice(0, key.lastIndexOf('.'))
        fileName = `${fileName}_${timestamp}${type}`
    }
    const url = `${pubUrl}${fileName}`

    return url
}

const getIpaPlistUrl = (object: R2Object): string | null => {
    if (object.key.endsWith('ipa')) {
        return `${pubUrl}install_${object.version}.plist`
    }
    return null
}

const deleteObject = async (fileName: string) => {

    const url = baseUrl + 'delete'

    const formData = new FormData();
    formData.append('fileName', fileName);

    try {
        const resp = await fetch(url, {method: 'POST', body: formData})
        const respData: any = await resp.json()
        return respData.code == 200
    } catch (err) {
        return false
    }
}

const getObjectInfo = async (fileName: string, timestamp: number = 0) => {

    let key = fileName
    if (timestamp > 0) {
        const type = key.slice(key.lastIndexOf('.'))
        key = key.slice(0, key.lastIndexOf('.'))
        key = `${key}_${timestamp}${type}`
    }

    const url = `${baseUrl}getObjectInfo?name=${key}`


    try {
        const resp = await fetch(url, {method: 'GET'})
        const respData: UploadResult = await resp.json()
        return respData
    } catch (err) {
        return null
    }
}



export {
    getObjectList,
    uploadFile,
    downloadFile,
    getDownloadUrl,
    getIpaPlistUrl,
    deleteObject,
    getObjectInfo
}