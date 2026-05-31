# 🤖 VBOT - WhatsApp Bot

Welcome to **VBOT**, a highly functional and sophisticated WhatsApp bot designed to streamline your daily activities with automation. Built with **Node.js** and the **Baileys** library, VBOT offers a seamless and responsive experience.

## 🚀 Fitur Utama

- Multi-Device Support
- Media Processing
- Ringan & Efisien

## 📊 Spesifikasi & Penggunaan Sumber Daya

|   Penggunaan    | Rata Penggunaan | Catatan / Kondisi                                           |
| :--------------- | :------------------ | :---------------------------------------------------------- |
| **Disk Usage**   | 150 MB - 200 MB     | Termasuk core files, local database, dan cache log          |
| **Memory Usage** | 150 MB - 300 MB     | Bervariasi tergantung jumlah aktivitas dan pemrosesan media |
| **CPU Load**     | 1% - 10%             | Pada kondisi standby hingga penggunaan normal               |

## 🛠️ Persyaratan Sistem (Prerequisites)

Sebelum memulai, pastikan sistem Anda telah terinstal software berikut:

1. **Git**
2. **Node.js v20+**
3. **FFmpeg** (Wajib untuk kebutuhan pemrosesan media, konversi audio/video, dan sticker)

---

## ⚠️ Note

- Pastikan Node.js versi 20 atau lebih baru.
- FFmpeg wajib terinstall untuk fitur sticker dan media.
- Isi `hf_token` pada `config.js` jika ingin menggunakan fitur AI.
- Gunakan nomor owner yang valid agar fitur owner dapat digunakan.

## 💻 Cara Install & Setup

### 1. Clone Repository

```bash
git clone https://github.com/Nazir99in/vbot
cd vbot
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Bot

Buka file `config.js` lalu sesuaikan pengaturan berikut:

```js
global.owner = ["628xxxxxxxxxx"]
global.ownername = "Your Name"
global.namebot = "VBOT"
```

Jika ingin menggunakan fitur AI, buat Hugging Face Access Token terlebih dahulu:

👉 https://huggingface.co/settings/tokens

Lalu isi token tersebut pada:

```js
global.hf_token = "hf_xxxxxxxxxxxxxxxxx"
```

> **Catatan:** Fitur AI tidak akan berfungsi jika `hf_token` dibiarkan kosong.

### 4. Jalankan Bot

```bash
npm start
```

Atau menggunakan PM2:

```bash
pm2 start index.js --name vbot
pm2 save
```
