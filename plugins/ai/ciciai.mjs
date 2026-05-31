import crypto from 'crypto'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `Input query`

    let uuid = () => crypto.randomUUID()
    let timestamp = Math.floor(Date.now() / 1000)
    let ms = Date.now().toString()

    let headers = {
        "host": "api-normal-i18n.ciciai.com",
        "content-type": "application/json; encoding=utf-8",
        "accept-encoding": "gzip",
        "x-ss-req-ticket": ms,
        "sdk-version": "2",
        "x-tt-token": "03be5c3df4d23840ab6e0136d982cf5d700532418a6364a7a21d00b020455076f256d20a76fd3db389968b0a1e0ab6d2999bcda07949b678f35f51707f1abaf0b8bd97eef9a537cb162f03025e8282c0658c1-1.0.0",
        "passport-sdk-version": "505176",
        "x-vc-bdturing-sdk-version": "2.2.1.i18n",
        "user-agent": "com.larus.wolf/11080005 (Linux; U; Android 14; en_US; sdk_gphone64_x86_64; Build/UE1A.230829.036.A4;tt-ok/3.12.13.18)",
        "x-ladon": "EWpoCnQJ6Un41IwItacPSVAZoZq0wjzhuhM1yW8W5w08cpPp",
        "x-khronos": timestamp.toString(),
        "x-argus": "VQJBkbGT6w5ALshpUgbVcDrL/E7y5yV5yVlfny4pnJvWPeP09n3rypfO8nBq3PV0TiMcqdEnB+ijNqL/riTW8TPP7ck05zQS06QslAqjLzG8dY6K7ipIoM08hftCSprWJoSiBzpzi7+5iyoNJfcQMMXCDCYhk/vcpW4nDDvPOLNIFLnfSHNR73inE2EuKurmTtznz1KLM7VV2oNNtR94NN9S1OAPWM691wKy16mAuhmK0f5HgCSi3YoV+6SK+sDyuUremc0/Ngom46IyXqclQ9dFAB/cgjrdhtTNut1MoZEzyw==",
        "x-gorgon": "840460b3000037b68cfb57c454f4406da140bff79c0cb9ce5449",
        "cookie": "store-country-code=us; install_id=7593702001446438661; ttreq=1$bc514f096bda9ae5dcc83c104e40ca7bbd4bf5bc; passport_csrf_token=fad44815801ead1b3c30bc6baab55264; passport_csrf_token_default=fad44815801ead1b3c30bc6baab55264; multi_sids=7593703764255753269%3Abe5c3df4d23840ab6e0136d982cf5d70; odin_tt=2542f08cd022b076d1453e213b818f690f482613f421d449289b56c0eea637e249785972b86e035c6724f4f4082d080e22b1ab8a995042cee3d44f865c7c88df2c75bc2e4ab8c2c17c94b63e7bc201bc; passport_mfa_token=CjlJzVdFQ0LAvOLrg3DX1OvJMKAXLDnJ9nWwvwAyTB80Pv2NfixWtiLSzDCgTGZ4dnanpUPnFFunKoQaSQo8AAAAAAAAAAAAAE%2FvOFvyAbWU8uN5TB7a2SIQUacnptk5%2BiOpaiXuDJUAZQJ4UUDulks%2BnWIteeC0x%2BP9EN7Ehg4Y16mI7w4iAQQTUuDD; d_ticket=432f725315a4c31537537c8312371fdd76f93; sid_guard=be5c3df4d23840ab6e0136d982cf5d70%7C1768047301%7C5184000%7CWed%2C+11-Mar-2026+12%3A15%3A01+GMT; uid_tt=4a225904427d347becbd38fa26d04c352c5d113c6da4f1c5bc82573c40bd1f16; uid_tt_ss=4a225904427d347becbd38fa26d04c352c5d113c6da4f1c5bc82573c40bd1f16; sid_tt=be5c3df4d23840ab6e0136d982cf5d70; sessionid=be5c3df4d23840ab6e0136d982cf5d70; sessionid_ss=be5c3df4d23840ab6e0136d982cf5d70; store-idc=mya; store-country-code-src=uid"
    }

    let body = {
        "channel": 3,
        "cmd": 100,
        "sequence_id": uuid(),
        "uplink_body": {
            "send_message_body": {
                "ack_only": false,
                "applet_payload": {},
                "bot_id": "7241547611541340167",
                "bot_type": 3,
                "client_controller_param": {
                    "answer_with_suggest": true,
                    "local_language_code": "en",
                    "local_nickname": "User",
                    "local_voice_id": "93"
                },
                "content": JSON.stringify({ "im_cmd": -1, "text": text }),
                "content_type": 1,
                "conversation_type": 3,
                "create_time": timestamp,
                "ext": {
                    "create_time_ms": ms,
                    "search_engine_type": "1",
                    "system_language": "en",
                    "tts": "1"
                },
                "client_fallback_param": {
                    "last_section_id": "",
                    "last_message_index": -1
                },
                "local_conversation_id": `${uuid()}-local`,
                "local_message_id": uuid(),
                "sender_id": "7593703764255753269",
                "status": 0,
                "unique_key": uuid()
            }
        },
        "version": "1"
    }

    let response = await fetch("https://api-normal-i18n.ciciai.com/im/sse/send/message?flow_im_arch=v2&device_platform=android&os=android&ssmix=a&channel=googleplay&aid=489823&app_name=nova_ai&version_code=11080001&version_name=11.8.0&manifest_version_code=11080005&update_version_code=11080040&resolution=1080*2337&dpi=420&device_type=sdk_gphone64_x86_64&device_brand=google&language=en&os_api=34&os_version=14&ac=wifi&region=US&flow_sdk_version=11080040", {
        method: "POST",
        headers: headers,
        body: JSON.stringify(body)
    })

    if (!response.ok) throw "Server Error"

    let buffer = await response.text()
    let parts = []
    let regex = /"origin_content"\s*:\s*"([^"]*)"/g
    let match
    
    while ((match = regex.exec(buffer))) {
        parts.push(match[1])
    }
    
    let finalResult = parts.join("")
    
    if (!finalResult) throw "No content found"
    
    finalResult = finalResult
        .replace(/\\n/g, "\n")
        .replace(/\s+\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .replace(/\s{2,}/g, " ")
        .replace(/([.!?])\s*/g, "$1 ")
        .trim()

    await m.reply(finalResult)
}

handler.help = ['ciciai', 'cici'].map(a => a+' [prompt]')
handler.tags = ['ai']
handler.command = ['ciciai', 'cici'];

export default handler