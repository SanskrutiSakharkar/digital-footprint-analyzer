# 🌩️ Cloud Data Footprint Analyzer

**Cloud Data Footprint Analyzer** is a secure, cloud-powered web application that helps users understand and manage their digital presence across online platforms. The app allows you to upload your account data (CSV/JSON), then provides an instant, interactive analysis of your account landscape: discover which platforms you’ve signed up for, spot risky or inactive accounts, monitor password hygiene, and visualize your sign-up trends over the years.

**Key Features:**

- **Privacy-First Design:** All user authentication is handled securely via AWS Cognito. Your data is analyzed in-memory through a serverless API (AWS Lambda) and is never stored long-term.
- **Interactive Visualizations:** Instantly see your accounts by category (Social, E-Commerce, Banking, etc.), yearly/monthly signups, account share, and risk breakdown—powered by beautiful Recharts-based dashboards.
- **Risk & Hygiene Insights:** Get automated insights on password reuse, inactive or high-risk accounts, and actionable recommendations to reduce your digital risk.
- **Snapshot & Comparison:** Save analysis snapshots and compare them side-by-side to see your progress over time—great for digital clean-up initiatives or compliance tracking.
- **Modern Tech Stack:** Built with React, AWS Lambda, API Gateway, and Cognito, with strong emphasis on user experience and security.
- **No Installation Required:** Fully serverless web app. Just upload your data and start analyzing instantly.

## Why Use Cloud Data Footprint Analyzer?

- **Visualize Your Digital Life:** Understand where and when you’ve created online accounts, and how your footprint evolves.
- **Reduce Security Risks:** Identify and address password reuse, account sprawl, and forgotten accounts that could put your security at risk.
- **Privacy by Design:** Your identity and data are protected at every step, leveraging industry-standard AWS cloud security.
- **Track Progress:** Regularly upload new exports and compare with earlier snapshots to see your digital hygiene improvements.

## How It Works

1. **Upload:** Drag-and-drop a CSV/JSON export of your online accounts (from your password manager or service provider).
2. **Analyze:** Instantly view interactive dashboards with your account stats, risk level breakdowns, and AI-powered insights.
3. **Export or Compare:** Download your report as CSV/PDF, or save snapshots to compare progress over time.

## Built With

- **Frontend:** React, Recharts, Framer Motion, AWS Amplify UI
- **Backend:** AWS Lambda, API Gateway, Cognito Auth
- **Deployment:** AWS S3 (static website hosting)
- **Security:** JWT-based authentication, no data stored long-term

## Live Demo

[Try the Live App]: http://digital-footprint-analyzer.s3-website-us-east-1.amazonaws.com/

---

## Features

- **Upload** your `.csv` or `.json` account data securely (AWS Cognito + Lambda + API Gateway backend)
- **Interactive Dashboards**: View category breakdowns, signup trends, password hygiene, and inactive accounts
- **AI-Powered Insights**: Get suggestions to improve your security
- **Save Snapshots & Compare Runs**: Track your changes over time
- **Export** reports as CSV or PDF
- **Modern UI**: Built with React.js, Recharts, and Framer Motion

---


## 📂 Project Structure
src/
├── components/
│ ├── ChartStats.js
│ ├── Footer.js / Footer.css
│ ├── Navbar.js / Navbar.css
│ ├── UploadForm.js / UploadForm.css
├── pages/
│ ├── About.js / About.css
│ ├── CompareReports.jsx / CompareReports.css
│ ├── Home.js / Home.css
│ ├── NotFound.js / NotFound.css
│ ├── Profile.js / Profile.css
│ ├── Report.js / Report.css
│ ├── Upload.js / Upload.css
├── utils/
│ └── saveAnalysis.js
├── App.js
├── index.js


1. **Clone the repo**
   ```bash
   git clone https://github.com/SanskrutiSakharkar/digital-footprint-analyzer.git
   cd cloud-data-footprint-analyzer

2. **Install dependencies**
     npm install

3. **Start the app**
     npm start

**The app runs at http://localhost:3000**

4. **Configure API/Env**
    Update your AWS API endpoint and Cognito config in src/utils/config.js or as .env variables.

5. **Deploy to AWS S3**
   - Build your app
    :npm run build

   - Upload all files and folders inside the /build directory to your S3 bucket root.
   - Do not upload the build folder itself, only its contents.

6. **S3 Settings:**
   - Enable Static Website Hosting
   - Set index.html and error.html as entry/error docs
    - Update bucket policy to allow public read (for static site)
      
7. **Production Architecture**

      **Frontend**: React (static site on S3)
      
      **Backend:** Serverless (Lambda, API Gateway)
      
      **Auth:** AWS Cognito
      
      **APIs:** Secure REST endpoints

