'use client'

import QRCode from 'qrcode';
import { useEffect, useState } from 'react';
import { getObjectList } from './api/client/worker-api';
import ObjectCard from './object-card';
import UploadFile from './upload-file';

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';



export default function Home() {

  const currentURL = typeof window !== 'undefined' ? window.location.href : '';

  const [qrCodeData, setQRCodeData] = useState('');
  const [objectList, setObjectList] = useState<R2Object[]>([])
  const [isShowUpload, setIsShowUpload] = useState(false)
  const [updateObj, setUpdateObj] = useState<R2Object | null>(null)

  const [isEditMode, setIsEditMode] = useState(false)


  const getPlatform = () => {
    if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) {
      return 'iOS'
    } else if (/(Android)/i.test(navigator.userAgent)) {
      return 'Android'
    } else {
      return 'PC'
    }
  }

  const generateQRCode = async () => {
    try {
      const dataURL = await QRCode.toDataURL(currentURL);
      setQRCodeData(dataURL);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
    }
  }

  const fetchObjectList = async () => {
    let list = await getObjectList()
    list = list.filter((e) => e.key.endsWith('.plist') == false)
    list = list.filter((e) => e.key.endsWith('.png') == false)
    // 倒序
    list.sort((e1, e2) => e1.uploaded < e2.uploaded ? 1 : -1)
    const platform = getPlatform()
    if (platform == 'iOS') {
      list = list.filter((e) => e.key.endsWith('ipa'))
    } else if (platform == 'Android') {
      list = list.filter((e) => e.key.endsWith('apk'))
    }
    setObjectList(list)
  }

  const updateObject = async (object: R2Object) => {
    setUpdateObj(object)
    setIsShowUpload(true)
  }

  useEffect(() => {
    generateQRCode()
    fetchObjectList()
  }, [])

  return (
    <main className="flex min-h-screen flex-col items-center">
      <div className=' w-screen mr-8 flex flex-row items-end justify-end mt-10'>
      <Dialog open={isShowUpload} onOpenChange={(open) => {
          setIsShowUpload(open)
          if (open == false) {
            setUpdateObj(null)
          }
        }}>
        {
          isEditMode ? <DialogTrigger className='bg-primary rounded text-white px-3 h-8'><div>{isEditMode ? '上传' : '编辑'}</div></DialogTrigger> :
          <Button className='h-8' onClick={() => setIsEditMode(true)}>编辑</Button>
          
        }
        <DialogContent>
          <DialogTitle>{ updateObj != null ? '更新' : '上传'}</DialogTitle>
          <UploadFile onSuccess={() => {
            setIsShowUpload(false)
            fetchObjectList()
          }} updateObj={updateObj}></UploadFile>
        </DialogContent>
      </Dialog>
      </div>
      <div className="text-3xl mt-5">APP分发</div>
      { qrCodeData.length > 0 && <img className='mt-10 w-60' src={qrCodeData} alt="QR Code" /> }

      <div className='grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-4 my-8'>
        {
          objectList.map( (obj) => (
            <ObjectCard key={obj.etag} obj={obj} onRefresh={() => {
              setIsShowUpload(false)
              fetchObjectList()
            }} update={() => {
              updateObject(obj)
            }} isEditMode={isEditMode}></ObjectCard>
          ))
        }
      </div>
      <div className='flex-1'></div>
      <div className="text-sm md:mb-16 mb-10 text-gray-400 px-5">如果加载不出列表，或者上传失败，请切换网络环境再尝试</div>
      <Toaster />
    </main>
  );
}
