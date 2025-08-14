

# 🚀 Ayush Gupta – Portfolio

A modern, fully responsive personal portfolio website built with **React**, **Vite**, and **Tailwind CSS**. It highlights my projects, experience, skills, resume, and certifications. The site includes a working contact form powered by **EmailJS** with an **auto-reply** feature.

[🌐 Live Demo](https://ayushgupta-portfolio.vercel.app)

<p align="left">
  <a href="https://react.dev/"><img alt="React" src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white"></a>
  <a href="https://vitejs.dev/"><img alt="Vite" src="https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white"></a>
  <a href="https://tailwindcss.com/"><img alt="Tailwind" src="https://img.shields.io/badge/TailwindCSS-3-38B2AC?logo=tailwindcss&logoColor=white"></a>
  <a href="https://www.emailjs.com/"><img alt="EmailJS" src="https://img.shields.io/badge/EmailJS-Enabled-blue"></a>
  <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg">
</p>

---

## ✨ Features

- **Modern UI** – Clean, professional design with smooth animations  
- **Responsive Layout** – Works perfectly on mobile, tablet, and desktop  
- **Dark/Light Mode** – Theme toggle for better accessibility  
- **Contact Form with EmailJS** – Send real emails without a backend  
- **Auto-Reply Emails** – Automatic confirmation to visitors  
- **Component-Based Architecture** – Easy to maintain and scale  
- **Fast Performance** – Optimized using Vite

---

## 🛠️ Tech Stack

- **React 18** – Modern React with hooks  
- **Vite** – Lightning-fast dev server & builds  
- **Tailwind CSS** – Utility-first styling  
- **Framer Motion** – Smooth animations  
- **Lucide React** – Icon library  
- **EmailJS** – Email sending service

---

## 📂 Project Structure

```text
ayush_portfolio/
├─ public/ # Static assets (favicon, logo, resume, images)
├─ src/
│ ├─ App.jsx # Main app component
│ ├─ main.jsx # App entry point
│ ├─ index.css # Global styles
│ ├─ components/
│ │ ├─ Layout/
│ │ │ ├─ Footer.jsx
│ │ │ └─ Navigation.jsx
│ │ ├─ Sections/
│ │ │ ├─ AboutSection.jsx
│ │ │ ├─ ContactSection.jsx
│ │ │ ├─ ExperienceSection.jsx
│ │ │ ├─ HeroSection.jsx
│ │ │ ├─ ProjectsSection.jsx
│ │ │ └─ SkillsSection.jsx
│ │ └─ ui/
│ │ └─ button.jsx
│ ├─ hooks/
│ │ ├─ useNavigation.js
│ │ └─ useTheme.js
│ ├─ lib/
│ │ └─ utils.js
│ ├─ styles/
│ │ └─ responsive.css
│ └─ utils/
│ └─ emailjs.js
├─ .env # Environment variables (not committed)
├─ index.html
├─ package.json
├─ postcss.config.js
├─ tailwind.config.js
└─ vite.config.js
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v16+ (v18 recommended)
- **npm** or **yarn**

### Installation

```bash
git clone https://github.com/ayush-gupta456/ayush_portfolio.git
cd ayush_portfolio
npm install
```

### Environment Variables
Create a .env file in the project root:

```bash
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_AUTO_REPLY_TEMPLATE_ID=your_auto_reply_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```
Note: All variables must be prefixed with VITE_ to be exposed in a Vite app.

### Development
```bash
npm run dev
```
Then open http://localhost:5173 in your browser.

### Production Build
```bash
npm run build
```
Preview the production build locally:

```bash
npm run preview
```

## 📧 EmailJS Setup (Contact + Auto-Reply)

Create an account at EmailJS and add an email service.

Create two templates:

- **Primary Template** (used to send the message to you)
  - Must include variables: `from_name`, `from_email`, `subject`, `message`, `current_time`.
- **Auto-Reply Template** (sent back to the visitor)
  - Include a friendly confirmation message and optionally echo their `from_name` and `subject`.

Copy the Service ID, Template IDs, and Public Key into `.env` (see above).

In `src/utils/emailjs.js` ensure you read from `import.meta.env` and send both the primary email and the auto-reply.

---

## 🎨 Customization

- Update portfolio content in `src/components/Sections/`
- Replace placeholder images in `/public`
- Edit `index.css` or Tailwind classes for styling
- Update social links & email in `src/utils/emailjs.js` and `ContactSection.jsx`
- Adjust animations in Framer Motion props within the section components

---

## 📦 Deployment

You can deploy this portfolio on Vercel (recommended), Netlify, GitHub Pages, or any static host.

**1) Vercel (Recommended)**
- Import the repo on Vercel.
- Framework preset: Vite
- Build command: npm run build
- Output directory: dist
- Add your .env variables in Project Settings → Environment Variables.
- Deploy.

**2) Netlify**
- New site from Git → pick the repo
- Build command: npm run build
- Publish directory: dist
- Environment variables → add the same VITE_* keys
- For SPA routing (optional): create public/_redirects with:

```bash
/* /index.html 200
```

**3) GitHub Pages**
- In vite.config.js, set `base: "/<repo-name>/"` if deploying to a project subpath.
- Build: npm run build
- Push dist via gh-pages or enable Pages from Settings → Pages using the dist branch/folder (with an action).

---

## 📜 Available Scripts

- `npm run dev` – Start dev server
- `npm run build` – Build for production
- `npm run preview` – Preview production build
- `npm run lint` – Lint (if configured)

---

## 🔧 Troubleshooting

- **Env not working:** Ensure variables are prefixed with VITE_ and you restarted the dev server after changes.
- **Emails not sent:** Verify EmailJS Service/Template IDs and Public Key. Check template variables match your payload keys.
- **Auto-reply missing:** Ensure VITE_EMAILJS_AUTO_REPLY_TEMPLATE_ID is set and the second emailjs.send is called.
- **Routing 404 on refresh (Netlify):** add the _redirects rule shown above.

---

## ❓ FAQ

**Q: Do I need a backend?**
A: No. EmailJS sends emails client-side using their service.

**Q: How do I add new projects/skills?**
A: Add or edit components in `src/components/Sections/ProjectsSection.jsx` and `SkillsSection.jsx`.

**Q: How to add a new section?**
A: Create a new component under `Sections/` and import it into `App.jsx` with a corresponding nav item.

---

## 📄 License
This project is open source under the MIT License.
You’re free to use, modify, and distribute with proper attribution.
See the LICENSE file for full text.

---

## 👨‍💻 Contact
Ayush Gupta – Full Stack Developer

- Portfolio: https://ayushgupta-portfolio.vercel.app
- LinkedIn: https://www.linkedin.com/in/ayush-gupta456
- GitHub: https://github.com/ayush-gupta456
- Email: omayush456.ag@gmail.com
