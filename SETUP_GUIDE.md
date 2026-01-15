# Wakeeli AI - Complete Setup Guide

This guide will walk you through everything you need to get your Wakeeli AI WhatsApp bot running.

## 📋 Prerequisites

1. **Python 3.12+** installed
2. **PostgreSQL** database (local or cloud)
3. **OpenAI API Key** (for GPT-4 and Whisper)
4. **Meta Business Account** with WhatsApp Business API access
5. **Public URL** for webhooks (use ngrok for local testing)

---

## 🔑 Step 1: Get All Required API Keys

### 1.1 OpenAI API Key

1. Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Sign up or log in
3. Click **"Create new secret key"**
4. Copy the key (starts with `sk-...`)
5. **Save it** - you won't see it again!

**Cost Note:** This uses GPT-4o which costs ~$0.01-0.03 per conversation. You can change to `gpt-3.5-turbo` in `backend/app/services/llm.py` (line 100, 158) to save money.

### 1.2 Meta WhatsApp Business API Keys

You need to set up a Meta Business Account and WhatsApp Business API. Here's how:

#### Option A: Meta Business Manager (Production)

1. **Create Meta Business Account**
   - Go to [business.facebook.com](https://business.facebook.com)
   - Create a Business Account

2. **Set up WhatsApp Business Account**
   - Go to [developers.facebook.com](https://developers.facebook.com)
   - Create a new App → Choose "Business" type
   - Add "WhatsApp" product to your app

3. **Get Your Credentials:**
   - **Phone Number ID**: Found in WhatsApp → API Setup → "Phone number ID"
   - **Access Token**: Found in WhatsApp → API Setup → "Temporary access token" (or create permanent token)
   - **Verify Token**: Create your own custom string (e.g., `my_secret_verify_token_123`)

#### Option B: Twilio WhatsApp API (Easier for Testing)

If Meta setup is too complex, you can use Twilio:
1. Sign up at [twilio.com](https://www.twilio.com)
2. Get a WhatsApp sandbox number
3. Get your Account SID and Auth Token
4. *Note: You'll need to modify the webhook code to use Twilio's format instead*

### 1.3 Database Setup

**PostgreSQL Database:**

1. **Local PostgreSQL:**
   ```bash
   # Install PostgreSQL (if not installed)
   # Windows: Download from postgresql.org
   # Mac: brew install postgresql
   # Linux: sudo apt-get install postgresql
   
   # Create database
   createdb wakeeli_db
   ```

2. **Cloud PostgreSQL (Recommended for Production):**
   - **Free Options:**
     - [Supabase](https://supabase.com) - Free tier available
     - [Neon](https://neon.tech) - Free tier available
     - [Railway](https://railway.app) - Free tier available
   - **Paid Options:**
     - AWS RDS
     - Google Cloud SQL
     - Azure Database

   Get your connection string (format: `postgresql://user:password@host:port/database`)

---

## 🚀 Step 2: Environment Configuration

1. **Copy the example env file:**
   ```bash
   cd backend
   copy env.example .env
   # On Mac/Linux: cp env.example .env
   ```

2. **Edit `.env` file** with your actual values:

```env
PROJECT_NAME="Wakeeli AI"
DATABASE_URL="postgresql://user:password@localhost/wakeeli_db"
OPENAI_API_KEY="sk-your-actual-openai-key-here"
WHATSAPP_TOKEN="your_whatsapp_access_token_from_meta"
WHATSAPP_VERIFY_TOKEN="your_custom_verify_token_123"
WHATSAPP_PHONE_NUMBER_ID="123456789012345"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="your_secure_admin_password"
```

**Important Notes:**
- Replace ALL placeholder values with your actual keys
- Never commit `.env` to Git (it's already in .gitignore)
- `WHATSAPP_VERIFY_TOKEN` can be any random string you choose

---

## 📦 Step 3: Install Dependencies

1. **Navigate to backend folder:**
   ```bash
   cd backend
   ```

2. **Activate virtual environment:**
   ```bash
   # Windows
   venv\Scripts\activate
   
   # Mac/Linux
   source venv/bin/activate
   ```

3. **Install packages:**
   ```bash
   pip install -r requirements.txt
   ```

---

## 🗄️ Step 4: Database Setup

1. **The database tables will be created automatically** when you run the app (see `backend/app/main.py` line 8).

2. **Optional: Seed with test data**

   You can add test listings and agents via the admin frontend, or create a simple script:

   ```python
   # backend/seed_data.py (create this file if you want)
   from app.database import SessionLocal
   from app.models import Listing, Agent
   
   db = SessionLocal()
   
   # Add a test listing
   listing = Listing(
       title="Beautiful 2BR Apartment in Beirut",
       listing_type="rent",
       location="Beirut",
       price=800,
       bedrooms=2,
       furnishing="furnished",
       description="Modern apartment with sea view",
       is_available=True
   )
   db.add(listing)
   
   # Add a test agent
   agent = Agent(
       name="John Doe",
       phone="+9611234567",
       email="john@example.com",
       specialties=["rent", "buy"],
       territories=["Beirut", "Jounieh"],
       is_active=True,
       priority=1
   )
   db.add(agent)
   
   db.commit()
   print("Test data added!")
   ```

   Run it: `python seed_data.py`

---

## 🌐 Step 5: Set Up Webhook (For Local Testing)

WhatsApp needs to send messages to your server. For local development, use **ngrok**:

1. **Install ngrok:**
   - Download from [ngrok.com](https://ngrok.com/download)
   - Or: `choco install ngrok` (Windows) / `brew install ngrok` (Mac)

2. **Start your backend:**
   ```bash
   cd backend
   uvicorn app.main:app --reload --port 8000
   ```

3. **Start ngrok in a new terminal:**
   ```bash
   ngrok http 8000
   ```

4. **Copy the HTTPS URL** (e.g., `https://abc123.ngrok.io`)

5. **Configure WhatsApp Webhook:**
   - Go to Meta Developer Console → Your App → WhatsApp → Configuration
   - **Webhook URL**: `https://abc123.ngrok.io/api/whatsapp/webhook`
   - **Verify Token**: The same value you put in `.env` as `WHATSAPP_VERIFY_TOKEN`
   - Click **"Verify and Save"**

6. **Subscribe to webhook fields:**
   - In the same page, subscribe to: `messages`, `message_status`

---

## ✅ Step 6: Test It!

1. **Start the backend:**
   ```bash
   cd backend
   uvicorn app.main:app --reload --port 8000
   ```

2. **Send a test message** to your WhatsApp Business number:
   - Text: "Hi, I'm looking for a 2 bedroom apartment to rent in Beirut"
   - The AI should respond!

3. **Check the logs** in your terminal to see if messages are being received and sent.

---

## 🎨 Step 7: Run the Frontend (Optional)

The frontend is for admin management (viewing conversations, listings, agents):

1. **Navigate to frontend:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start dev server:**
   ```bash
   npm run dev
   ```

4. **Open browser:** [http://localhost:5173](http://localhost:5173)

---

## 🐛 Troubleshooting

### "Database connection failed"
- Check your `DATABASE_URL` in `.env`
- Make sure PostgreSQL is running
- Verify username/password are correct

### "OpenAI API error"
- Check your `OPENAI_API_KEY` is correct
- Verify you have credits in your OpenAI account
- Check rate limits

### "WhatsApp webhook verification failed"
- Make sure `WHATSAPP_VERIFY_TOKEN` in `.env` matches what you entered in Meta Console
- Make sure ngrok is running and URL is correct
- Check that your backend is running on port 8000

### "Messages not being sent"
- Check `WHATSAPP_TOKEN` is valid (not expired)
- Verify `WHATSAPP_PHONE_NUMBER_ID` is correct
- Check Meta Console for error logs

### "Voice notes not working"
- Make sure OpenAI API key has access to Whisper model
- Check that the media download is working (check logs)

---

## 📝 Quick Checklist

Before going live, make sure:

- [ ] All API keys are set in `.env`
- [ ] Database is running and accessible
- [ ] Backend starts without errors (`uvicorn app.main:app`)
- [ ] Webhook is verified in Meta Console
- [ ] Test message works (send "Hi" to your WhatsApp number)
- [ ] You have at least one listing in the database
- [ ] You have at least one agent in the database (for handoffs)

---

## 🚀 Production Deployment

For production, you'll need:

1. **Hosting for backend:**
   - [Railway](https://railway.app) - Easy, free tier
   - [Render](https://render.com) - Free tier available
   - [Fly.io](https://fly.io) - Good for Python
   - AWS/GCP/Azure - For scale

2. **Hosting for frontend:**
   - [Vercel](https://vercel.com) - Free, perfect for React
   - [Netlify](https://netlify.com) - Free tier
   - Same as backend hosting

3. **Update webhook URL** in Meta Console to your production URL

4. **Use permanent WhatsApp access token** (not temporary)

5. **Set up proper database backups**

---

## 💰 Cost Estimates

- **OpenAI GPT-4o**: ~$0.01-0.03 per conversation (or use GPT-3.5-turbo for ~$0.001)
- **OpenAI Whisper**: ~$0.006 per minute of audio
- **WhatsApp Business API**: Free for first 1,000 conversations/month, then ~$0.005-0.09 per message
- **Database**: Free tiers available (Supabase, Neon)
- **Hosting**: Free tiers available (Railway, Render, Vercel)

**Total for MVP/testing: ~$0-10/month**

---

## 📞 Need Help?

- Check the logs in your terminal
- Review Meta Developer Console for WhatsApp errors
- Check OpenAI dashboard for API usage/errors
- Make sure all environment variables are set correctly

---

**You're all set! 🎉**
