import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"
import { deleteObject, getDownloadUrl, getObjectInfo, uploadFile } from "./api/client/worker-api"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { getIpaInstallPlist } from "./app_install"
import { s3UploadFile } from "./api/client/s3-api"
import { sendLarkNotice } from "./api/client/lark-api"


export default function UploadFile(props: any) {

    const { toast } = useToast()

    const [file, setFile] = useState<File | null>(null)
    const [title,  setTitle] = useState('')
    const [desc,  setDesc] = useState<string>('')

    const [isUploading, setIsUploading] = useState(false)

    const [isIpa, setIsIpa] = useState(false)
    const [bundleId, setBundleId] = useState('')
    const [appName, setAppName] = useState('')

    const [isEditing, setIsEditing] = useState(false)

    const uploadWithPlist = async (versionId: string, title: string, downloadUrl: string, bundleId: string, version: string) => {
        const plistData = getIpaInstallPlist(appName, bundleId, downloadUrl, version)
        const plistFile = new File([plistData], `install_${versionId}.plist`, { type: 'text/xml' });

        return await s3UploadFile(plistFile, `install_${versionId}.plist`, `${title} ipa install plist`, 0)
    }


    const upload = async () => {
        if (title.length == 0) {
            toast({
                title: "请输入标题",
                className: cn(
                    'top-0 right-0 flex fixed md:max-w-[210px] md:top-4 md:right-4'
                  )
            })
            return
        }
        if (file == null) {
            toast({
                title: "请选择文件",
                className: cn(
                    'top-0 right-0 flex fixed md:max-w-[210px] md:top-4 md:right-4'
                  )
            })
            return
        }
        setIsUploading(true)
        const time = Date.parse(new Date().toString()) / 1000
        const resp = await s3UploadFile(file, title, desc, time)
        let isSuccess = resp != null && resp.$metadata.httpStatusCode == 200
        // 如果上传成功并且是ipa，同步上传一个plist
        if (isSuccess && isIpa) {
            const downloadUrl = getDownloadUrl(file.name, time)
            const objInfo = await getObjectInfo(file.name, time)
            const version = objInfo?.data.version
            if (version != null && version != undefined) {
                const plistRes = await uploadWithPlist(objInfo!.data.version, file.name, downloadUrl, bundleId, '3.5.0')
                isSuccess = plistRes != null && plistRes.$metadata.httpStatusCode == 200
            }
        }

        // 发送lark通知
        // sendLarkNotice(title, desc, isIpa)

        setIsUploading(false)
        if (isSuccess) {
            
            setTitle('')
            setDesc('')
            setFile(null)
            toast({
                title: "上传成功",
                className: cn(
                    'top-0 right-0 flex fixed md:max-w-[210px] md:top-4 md:right-4'
                  )
            })
            props.onSuccess.call()
        } else {
            toast({
                title: "上传失败，请重试",
                className: cn(
                    'top-0 right-0 flex fixed md:max-w-[210px] md:top-4 md:right-4'
                  )
            })
        }
    }

    const update = async () => {
        setIsUploading(true)
        // 先删除旧的
        const oldObj: R2Object = props.updateObj

        await deleteObject(oldObj.key)
        // 如果是ipa还要删除对应的plist
        if (oldObj.key.endsWith('ipa')) {
            let plistName = `install_${oldObj.version}.plist`
            await deleteObject(plistName)
        }
        // 然后上传更新
        await upload()
    }

    const hexToStr = (str: string) => {
        var j;
        var hexes = str.match(/.{1,4}/g) || [];
        var back = "";
        for(j = 0; j<hexes.length; j++) {
            back += String.fromCharCode(parseInt(hexes[j], 16));
        }
    
        return back;
    }
    const updateInfo = (obj: R2Object) => {
        if (obj.customMetadata != null) {
            const title = obj.customMetadata['title'] ?? ''
            setTitle(hexToStr(title))

            const desc = obj.customMetadata['desc'] ?? ''
            setDesc(hexToStr(desc))

            if (obj.key.endsWith('ipa')) {
                setIsIpa(true)
            }
        }
    }

    useEffect(() => {
        const updateObj: R2Object | null = props.updateObj
        if (updateObj != null) {
            updateInfo(updateObj)
        }
    }, [])

    return (
        <div className="pt-4 pb-5 flex flex-col items-center justify-center bg-white rounded">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="标题"></Input>
            <div className="h-4"></div>
            <Textarea value={desc} placeholder="相关说明" onChange={(e) => setDesc(e.target.value)}></Textarea>
            <div className="h-4"></div>
            <Input type="file" onChange={(event) => {
                if (event.target.files != null && event.target.files.length > 0) {
                    const file = event.target.files[0]
                    setFile(file)
                    if (file.name.endsWith('ipa')) {
                        setIsIpa(true)
                    }
                }
            }} />
            <div className="h-4"></div>
            { isIpa && 
            <>
                <Input value={appName} onFocus={() => setIsEditing(true)} onBlur={() => setIsEditing(false)} onChange={(e) => setAppName(e.target.value)} placeholder="APP Name"></Input>
                <Input className="mt-3" value={bundleId} onFocus={() => setIsEditing(true)} onBlur={() => setIsEditing(false)} onChange={(e) => setBundleId(e.target.value)} placeholder="Bundle ID"></Input>
                {
                    /*
                     <div className="mt-4 flex flex-row items-start w-full">
                        <Button className="mr-2" variant="secondary" onClick={() => setBundleId('com.app.test')}>com.app.test(测试)</Button>
                        <Button variant="secondary" onClick={() => setBundleId('com.app.release')}>com.app.release(正式)</Button>
                    </div> 
                     */
                }
            </>
             }
            
            <div className="h-6"></div>
            <Button onClick={props.updateObj != null ? update : upload} disabled={file == null || title.length == 0 || desc.length == 0 || isUploading || (isIpa && bundleId.length == 0)} className="w-full">
                {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isUploading ? '上传中' : '上传'} 
                </Button>
            <div className="flex-1"></div>
        </div>
    )
}