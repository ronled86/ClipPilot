# 🔑 API Configuration Guide

ClipPilot offers **two modes** for YouTube search to give you the best experience:

## 🆓 **Basic Mode (Default - No Setup Required)**

✅ **Works immediately** - No configuration needed  
✅ **Completely free** - Uses YouTube's public autocomplete  
✅ **Good suggestions** - Based on popular searches  
✅ **Privacy-friendly** - No API keys required  

**How it works:** Uses YouTube's public suggestion endpoint that powers their search autocomplete.

---

## ⚡ **Enhanced Mode (Optional - Better Results)**

✅ **Richer suggestions** - Actual video titles from YouTube  
✅ **More relevant results** - Better search accuracy  
✅ **Still free** - Google provides 10,000 requests/day free  
✅ **Privacy-safe** - API key stored locally only  

### 📋 **How to Enable Enhanced Mode:**

#### **Step 1: Get a Free YouTube API Key**

1. **Go to Google Cloud Console**
   - Visit: https://console.developers.google.com
   - Sign in with your Google account

2. **Create or Select Project**
   - Click "Create Project" or select existing
   - Give it a name like "ClipPilot"

3. **Enable YouTube Data API**
   - Go to "APIs & Services" → "Library"
   - Search for "YouTube Data API v3"
   - Click "Enable"

4. **Create API Key**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy the generated key (starts with "AIza...")

5. **Optional: Restrict Key (Recommended)**
   - Click on your API key to edit
   - Under "API restrictions", select "YouTube Data API v3"
   - Under "Application restrictions", choose as needed

#### **Step 2: Configure ClipPilot**

1. **Open Settings**
   - Click the ⚙️ gear icon in ClipPilot
   - Scroll down to "🔑 API Configuration"

2. **Enable Enhanced Search**
   - Check "Enable Enhanced Search (Optional)"
   - Paste your API key in the field

3. **Save Settings**
   - Click "Save Settings"
   - Enhanced search is now active!

---

## 🔒 **Privacy & Security**

✅ **Local Storage Only** - API key never leaves your computer  
✅ **No Tracking** - We don't collect any data  
✅ **Your Control** - You can disable anytime  
✅ **Open Source** - All code is public on GitHub  

## 📊 **Usage Limits**

| Plan | Requests/Day | Cost | Suitable For |
|------|--------------|------|--------------|
| **Free Tier** | 10,000 | $0.00 | Personal use (more than enough) |
| **Paid Tier** | Unlimited | ~$0.0001/request | Heavy commercial use |

**Note:** 10,000 requests = ~5,000 searches per day. Most users never hit this limit.

## 🔧 **Troubleshooting**

### **Enhanced Search Not Working?**

1. **Check API Key Format**
   - Should start with "AIza"
   - Should be ~39 characters long

2. **Verify API is Enabled**
   - Make sure "YouTube Data API v3" is enabled in your project

3. **Check Quotas**
   - Go to Google Cloud Console → APIs & Services → Quotas
   - Make sure you haven't exceeded daily limit

### **Still Having Issues?**

The app automatically falls back to Basic Mode if Enhanced Mode fails, so you'll always have working search suggestions.

---

## 🎯 **Recommendation**

- **New Users**: Start with Basic Mode (works great!)
- **Power Users**: Set up Enhanced Mode for better results
- **Developers**: Enhanced Mode provides richer metadata

**Both modes work excellently - choose what fits your needs!** 🚀
