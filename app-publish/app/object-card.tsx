import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
import { deleteObject, downloadFile, getIpaPlistUrl } from "./api/client/worker-api"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { getIpaInstallUrl } from "./app_install"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"


export default function ObjectCard(props: any) {
    
    const object: R2Object = props.obj

    const formatDate = (date: Date) => {
        const d = new Date(date)
        const month = d.getMonth()+1 < 10 ? `0${d.getMonth()+1}` : `${d.getMonth()+1}`
        const day = d.getDate() < 10 ? `0${d.getDate()}` : `${d.getDate()}`
        const hour = d.getHours() < 10 ? `0${d.getHours()}` : `${d.getHours()}`
        const min = d.getMinutes() < 10 ? `0${d.getMinutes()}` : `${d.getMinutes()}`
        return `${month}-${day} ${hour}:${min}`
    }

    const [isDownloading, setIsDownloading] = useState(false)

    const [isEditMode, setIsEditMode] = useState(false)

    const deleteFile = async () => {
        let isSuccess = await deleteObject(object.key)
        if (isSuccess && object.key.endsWith('ipa')) {
            isSuccess = await deleteObject(`install_${object.version}.plist`)
        }
        if (isSuccess) {
            toast({
                title: "删除成功!",
                className: cn(
                    'top-0 right-0 flex fixed md:max-w-[210px] md:top-4 md:right-4'
                  )
            })
            props.onRefresh.call()
        }
    }

    const download = async () => {

        const fileName = object.key

        // ipa install
        if (fileName.endsWith('ipa')) {

            const plistUrl = getIpaPlistUrl(object)

            if (plistUrl == null) {
                toast({
                    title: "下载失败",
                    className: cn(
                        'top-0 right-0 flex fixed md:max-w-[210px] md:top-4 md:right-4'
                      )
                })
                return
            }



            const ipaInstallUrl = getIpaInstallUrl(plistUrl)

            // window.location.href = ipaInstallUrl
            const element = document.createElement('a')
            element.href = ipaInstallUrl
            element.download = fileName
    
            document.body.appendChild(element)
            setIsDownloading(false)
            element.click()
    
            document.body.removeChild(element)

            return
        }

        setIsDownloading(true)
        const resp = await downloadFile(object)

        if (resp != null) {

            // download file
            const element = document.createElement('a')
            const blobData = await resp.blob()
            element.href = window.URL.createObjectURL(blobData)
            element.download = fileName
    
            document.body.appendChild(element)
            setIsDownloading(false)
            element.click()
    
            document.body.removeChild(element)
        }
    }

    const hexToStr = (str: string) => {
        var j;
        if (str == null) return ''
        var hexes = str.match(/.{1,4}/g) || [];
        var back = "";
        for(j = 0; j<hexes.length; j++) {
            back += String.fromCharCode(parseInt(hexes[j], 16));
        }
    
        return back;
    }

    const getTitle = () => {
        let title = object.key
        title = object.customMetadata != null ? (object.customMetadata['title'] ?? '') : title

        if (title == null) return ''

        if (object.key.endsWith('ipa')) {
            title = `iOS｜${hexToStr(title)}`
        } else if (object.key.endsWith('apk')) {
            title = `Android｜${hexToStr(title)}`
        } else {
            title = title != null ? hexToStr(title) : ''
        }
        return title
    }

    useEffect(() => {
        setIsEditMode(props.isEditMode)
    }, [props.isEditMode])

    return (
        <Card className="w-[350px] flex flex-col">
            
            <CardHeader className="flex-1">
                <CardTitle>{getTitle()}</CardTitle>
                <CardDescription>{object.customMetadata && object.customMetadata['desc'] != null && (hexToStr(object.customMetadata['desc']))}</CardDescription>
            </CardHeader>

            <CardContent>
                <form>
                    <div className="grid w-full items-center gap-4">
                        <div>{object.key}</div>
                        <div>{`更新时间: ${formatDate(object.uploaded)}`}</div>
                    </div>
                </form>
            </CardContent>

            <CardFooter className="flex flex-row justify-between">
                {isEditMode ? <div className="flex flex-row">
                    <Button className="bg-red-500 hover:bg-red-400 mr-5" onClick={deleteFile}>删除</Button>
                    <Button className="bg-blue-500 hover:bg-blue-400" onClick={props.update}>更新</Button>
                </div> : <div></div>}
                <Button onClick={download} disabled={isDownloading}>
                    {isDownloading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isDownloading ? '下载中' : (object.key.endsWith('ipa') ? '安装' : '下载')}
                    </Button>
            </CardFooter>
      </Card>
    )
}