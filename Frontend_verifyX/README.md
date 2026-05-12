<div align="center">
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/shield-check.svg" alt="VerifyX Logo" width="120" height="120" />
  
  # VerifyX 🛡️
  **The Trust Layer for Academic Integrity**
  
  [![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19.2-blue?style=for-the-badge&logo=react)](https://react.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
  [![Firebase](https://img.shields.io/badge/Firebase-11.9-FFCA28?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
</div>

<br />

## 🌟 About VerifyX

**VerifyX** is a cutting-edge protocol designed to be the global standard for tamper-proof academic credentials. By leveraging modern web technologies and secure verifiable infrastructure, VerifyX ensures that:

- 🏛️ **Universities** can issue credentials with precision.
- 🎓 **Students** own their achievements with complete privacy.
- 🏢 **Organizations** can verify academic records with absolute certainty.

---

## 🚀 Key Features

* **Decentralized Cryptographic Proofs**: Tamper-proof, verifiable credentials.
* **Modern Aesthetic**: Built with a sleek, neo-minimalist, geometric dark mode design using Framer Motion and Tailwind CSS.
* **AI-Powered Validation**: Integrated with **Genkit** and Google GenAI for smart record validation.
* **Accessible UI**: Fully accessible component system utilizing **Radix UI**.
* **Seamless Authentication & Storage**: Powered securely by **Firebase**.

---

## 🛠️ Tech Stack

### Core Technologies
* [Next.js (App Router)](https://nextjs.org/) - React Framework
* [React 19](https://react.dev/) - UI Library
* [TypeScript](https://www.typescriptlang.org/) - Type Safety

### Styling & Animation
* [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
* [Framer Motion](https://www.framer.com/motion/) - Fluid animations
* [Radix UI](https://www.radix-ui.com/) - Unstyled, accessible UI components
* [Lucide React](https://lucide.dev/) - Beautiful, consistent icon set
* [Google Fonts](https://fonts.google.com/) - Montserrat, Pacifico, and Sreda typography

### Backend & AI
* [Firebase](https://firebase.google.com/) - Backend infrastructure
* [Genkit](https://firebase.google.com/docs/genkit) - AI-powered logic
* [Zod](https://zod.dev/) - Schema declaration and validation

---

## 🚦 Getting Started

Follow these steps to run VerifyX locally on your machine.

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed (v20 or higher recommended).

### Installation

1. **Clone the repository** (if applicable) and navigate to the project directory:
   ```bash
   cd web3
   ```

2. **Install the dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env.local` file in the root directory and add your Firebase and Genkit configuration keys.

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Start the AI/Genkit server** (Optional, for AI features):
   ```bash
   npm run genkit:dev
   ```

### 🌍 Open the App

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. The main entry point is `src/app/page.tsx`.

---

## 📁 Project Structure

```text
web3/
├── src/
│   ├── ai/            # Genkit AI configurations and logic
│   ├── app/           # Next.js App Router (Pages, Layouts)
│   ├── components/    # Reusable UI components (Layout, Radix UI, Hero)
│   └── lib/           # Utility functions
├── public/            # Static assets
├── tailwind.config.ts # Tailwind CSS configuration
└── package.json       # Dependencies and scripts
```

---

<div align="center">
  <p>Built with ❤️ for a trusted academic future.</p>
</div>
