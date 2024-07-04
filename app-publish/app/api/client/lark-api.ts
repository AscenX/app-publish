// lark bot hook url
const url = ''

const sendLarkNotice = async (title: string, content: string, isIos: boolean) => {

    const data = {
        "msg_type": "interactive",
        "card": {
            "elements": [{
                    "tag": "div",
                    "text": {
                            "content": content,
                            "tag": "lark_md"
                    }
            }, {
                    "actions": [{
                            "tag": "button",
                            "text": {
                                    "content": '查看',
                                    "tag": "lark_md"
                            },
                            "url": "https://app-publish.pages.dev",
                            "type": "default",
                            "value": {}
                    }],
                    "tag": "action"
            }],
            "header": {
                    "title": {
                            "content": `${isIos ? `【iOS】` : `【Android】`}${title}`,
                            "tag": "plain_text"
                    }
            }
        }
    }

    try {
        const res = await fetch(url, {
            method: "POST",
            body: JSON.stringify(data)
        })
        return res
    } catch (err) {
        return null
    }
}

export {
    sendLarkNotice
}