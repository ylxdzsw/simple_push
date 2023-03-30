async function gen_key() {
    const key_pair = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveKey"])
    const key = await crypto.subtle.exportKey("jwk", key_pair.privateKey)
    delete key.alg
    delete key.ext
    delete key.key_ops
    // console.log(key)
    return key
}

async function import_key(key) {
    return await crypto.subtle.importKey('jwk', key, { name: "ECDSA", namedCurve: "P-256" }, true, ["sign"])
}

async function sign_token(raw_token, key) {
    const signature = await crypto.subtle.sign({ name: "ECDSA", hash: { name: "SHA-256" } }, key, new TextEncoder().encode(raw_token))


}

function array_buffer_to_base64_url(buffer) {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64_url_to_array_buffer(str) {
    return Uint8Array.from(atob(str.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0)).buffer
}

function make_jwt(msg, key) {
    const header = {
        "typ": "JWT",
        "alg":"ES256"
    }

    const claim = {
        sub: "mailto:webpush@ylxdzsw.com",
        exp: Math.floor(Date.now() / 1000 + 12 * 60 * 60),
    }


    return
}

function public_key_to_buffer(key) {
    const buffer = new Uint8Array(65)
    buffer[0] = 4 // fucking stupid
    buffer.set(base64_url_to_array_buffer(key.x), 1)
    buffer.set(base64_url_to_array_buffer(key.y), 33)
    return buffer.buffer
}

async function subscribe(worker_registration, public_key_buffer) {
    return await worker_registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: public_key_buffer
    })
}

;(async () => {
    document.getElementById('subscribe').addEventListener('click', async () => {
        if (await Notification.requestPermission() !== 'granted') {
            throw new Error('Permission not granted for Notification');
        }

        const worker_registration = await navigator.serviceWorker.register('worker.js')

        const public_key_buffer = public_key_to_buffer({
            x: "iBQjad25VAeYizxjuoaBT-xFp1Isr-RqZ7WXsO-IlVw",
            y: "O7HOr2bL3okliqN1fsjeIZcwIKVvsGFLzbFtJ8Vl7kM"
        })

        const subscription = subscribe(worker_registration, public_key_buffer)

        document.getElementById('info').innerText = JSON.stringify(subscription)
    })
})()
