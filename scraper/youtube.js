async function ytdl(videoid, type = "mp4") {
    const url = "https://www.youtube.com/youtubei/v1/player?prettyPrint=false";
    const targetUrl = global.useProxy ? global.proxyUrl + url : url;

    const response = await fetch(targetUrl, {
    method: "POST",
    headers: {
        "X-Goog-Visitor-Id":
            "Cgs4ZmxfcDk4Vnk0VSjLvdrQBjIKCgJJRBIEGgAgXmLfAgrcAjE4LllUPWNsWWh5eHVVeE04N1AzV0tnZzZJeFpkV3lGOEVRNnJaei1DQ3hRTkdHV1NFcjg1MmpVQmZ6UzMtOE5zTVVSZ3EzbHFXUHFRZERyV0M3a2g2TlFEdUZybmJRbjkyc1JGVGxVd3MyZG5RMmFmVG95TlJnTXJReTdMNlRTOEVqcTFhaW5OQnJhOU9uRnJRa01IOGpVTzdiR3UwQVpqdjI0UURqNkdmeE1VcWVZc184cGxfOUNNVExVRG9HQ09sa1NPOUVHZG5CcWdUVzVRZ080OGRyQWxDeVRHUF9MRnhBNjVYZVVRR1FBeGxmU0ZSckhhRHI0cDROLWV2cmp0VDdEc3pKU3Q1clhSYkNmWWQ0YjJqbFN5NVh0ejMyajk5NWdkSGhLU1htcTcydHNGeDNUOW5xZXQ3UlZvV2JNbmNGWDBKTldqbXZyQzg0VHhqY1hCVFlnQ2dLQQ=="
    },

    body: JSON.stringify({
        context: {
            client: {
                clientName: "ANDROID_VR",
                clientVersion: "1.65.10"
            }
        },

        videoId: videoid
    })
});
   console.log(await response)
    const data = await response.json()

    if (type === "mp3") {
        return data.streamingData.adaptiveFormats.find(v => v.itag === 140);
    }

    if (type === "mp4") {
        return data.streamingData.formats?.[0];
    }

    return null;
}

module.exports = ytdl;