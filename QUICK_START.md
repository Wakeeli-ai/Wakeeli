# 🚀 Quick Start - API Keys Checklist

## Required Keys & Where to Get Them

### 1. **OpenAI API Key** ✅
- **Where:** [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- **Format:** `sk-...` (starts with "sk-")
- **Used for:** GPT-4 responses + Whisper voice transcription
- **Cost:** ~$0.01-0.03 per conversation

### 2. **WhatsApp Access Token** ✅
- **Where:** Meta Developer Console → Your App → WhatsApp → API Setup
- **Format:** Long string (e.g., `EAAxxxxxxxxxxxxx`)
- **Used for:** Sending/receiving WhatsApp messages
- **Note:** Temporary tokens expire in 24h, create permanent token for production

### 3. **WhatsApp Phone Number ID** ✅
- **Where:** Meta Developer Console → Your App → WhatsApp → API Setup
- **Format:** Numbers only (e.g., `123456789012345`)
- **Used for:** Identifying which WhatsApp number to send from

### 4. **WhatsApp Verify Token** ✅
- **Where:** You create this yourself (any random string)
- **Format:** Any string (e.g., `my_secret_token_123`)
- **Used for:** Webhook verification
- **Important:** Must match what you enter in Meta Console webhook settings

### 5. **Database URL** ✅
- **Where:** Your PostgreSQL database connection string
- **Format:** `postgresql://user:password@host:port/database`
- **Examples:**
  - Local: `postgresql://postgres:password@localhost:5432/wakeeli_db`
  - Supabase: `postgresql://user:pass@db.xxx.supabase.co:5432/postgres`
  - Neon: `postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb`

---

## 📝 Your `.env` File Should Look Like:

```env
PROJECT_NAME="Wakeeli AI"
DATABASE_URL="postgresql://user:password@localhost/wakeeli_db"
OPENAI_API_KEY="sk-proj-xxxxxxxxxxxxxxxxxxxxx"
WHATSAPP_TOKEN="EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
WHATSAPP_VERIFY_TOKEN="my_custom_token_12345"
WHATSAPP_PHONE_NUMBER_ID="123456789012345"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="your_secure_password"
```

---

## ⚡ Quick Test Steps

1. **Set up `.env`** with all keys above
2. **Start database** (PostgreSQL running)
3. **Start backend:**
   ```bash
   cd backend
   venv\Scripts\activate  # Windows
   uvicorn app.main:app --reload
   ```
4. **Set up ngrok** (for webhook):
   ```bash
   ngrok http 8000
   ```
5. **Configure webhook in Meta Console:**
   - URL: `https://your-ngrok-url.ngrok.io/api/whatsapp/webhook`
   - Verify Token: Same as `WHATSAPP_VERIFY_TOKEN` in `.env`
6. **Send test message** to your WhatsApp Business number!

---

## 🎯 What's Now Working

✅ **AI responds to text messages**  
✅ **AI responds to voice notes** (transcribes with Whisper)  
✅ **AI searches listings** from database  
✅ **AI hands off to human agents** when needed  
✅ **All messages saved** to database  

---

**See `SETUP_GUIDE.md` for detailed instructions!**
