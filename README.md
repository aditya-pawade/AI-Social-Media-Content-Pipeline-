# SocialPipeline AI 🚀

An end-to-end AI-powered content generation studio that enables marketers, social media managers, and creators to conceptualize, generate, schedule, and analyze their social media content collaboratively in one place.

## 🎯 Project Objectives & Evaluation Criteria

The objective of these assignments is not just to test coding ability, but to evaluate: 
- **System design thinking**: Architected a robust, full-stack application separating concerns between the client-side React SPA, an Express middleware server, and a scalable Firebase backend. Data models are isolated securely by workspaces.
- **Frontend/backend engineering**: Utilized React 18, Vite, and Tailwind CSS for a highly responsive, modern frontend. The backend leverages Express via a custom SSR/middleware proxy architecture and Firebase services for serverless database/authentication.
- **AI integration skills**: Deeply integrated the `@google/genai` SDK using streaming (Server-Sent Events equivalent via standard async iterators) to provide real-time AI content generation, reducing perceived latency. Structured prompts enforce brand identity and platform constraints, optionally generating images.
- **Scalability approach**: Database interactions are protected through strict Firebase Security Rules, optimized queries, and an architecture that scales serverlessly via Cloud Run. Component-driven UI makes adding new features seamless.
- **Problem-solving ability**: Solved complex user-experience challenges like real-time AI text streaming with complex React state management, dynamic data visualization linking generation output with simulated engagement metrics, and secure, isolated user data management.
- **Product understanding**: Created a continuous user journey: from workspace creation to AI generation, scheduling on a calendar, and monitoring output through an analytics dashboard. Designed specifically for the mental model of a social media manager.
- **Code quality and architecture**: Maintained a clean, scalable folder structure (`src/components`, `src/pages`, `src/services`). Enforced TypeScript typing across the application for strict data shapes, utilizing reusable UI components and custom hooks where appropriate.

### 🏆 How We Met the Evaluation Focus
marketing
- **System Design Thinking & Architecture**: We separated concerns using a layered architecture: a reactive frontend (React), an intermediate express server for robust production serving, and a highly secure serverless backend (Firestore/Firebase Auth). The implementation of distinct logic streams (UI components, services, page layouts) ensures maintainability.
- **AI Integration**: We implemented streaming text generation using the `@google/genai` SDK to dramatically reduce perceived latency, providing immediate feedback. We also integrated prompt-driven image generation. Both are highly context-aware, dynamically constructing prompts based on user-defined workspace brand identities and target social platforms.
- **Scalable Structure**: By structuring the database with denormalized, hierarchical paths (`workspaces/{workspaceId}/contents`), we ensure queries remain lightweight O(N) operations regardless of total application scale. We also fortified the data layer with strict Zero-Trust ABAC Firestore rules to prevent unauthorized access or payload manipulation at scale.
- **Clean UI/UX**: We crafted a premium, dark-themed dashboard tailored for  professionals using Tailwind CSS and shadcn/ui. Complex user flows, such as real-time AI generation, calendar scheduling, and analytics visualization, are handled fluidly with immediate visual feedback, avoiding jarring page reloads.

## 🌟 Features

- **Workspace Management**: Organize your campaigns, clients, or brands in isolated workspaces.
- **AI Content Generation**: Leverage the power of Google's Gemini models to generate high-quality text and image content tailored to specific platform requirements (LinkedIn, Twitter, Instagram).
- **Streaming Responses**: Real-time generation feedback for a snappy user experience.
- **Content Library**: A centralized hub for all your generated posts, drafts, and scheduled content.
- **Visual Calendar**: Schedule your content with an intuitive interface. Recurring post support.
- **Analytics Dashboard**: Track your content's output, estimated reach, and engagement over time through interactive charts.
- **Secure by Default**: Built on Firebase with strongly-typed Cloud Firestore Security Rules, ensuring isolated workspace data and fortified access control.

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui (Radix UI), Framer Motion
- **Data Visualization**: Recharts
- **Icons**: Lucide React
- **Backend / Authentication**: Firebase (Authentication, Firestore)
- **AI Engine**: Google Gemini API via `@google/genai`
- **Server Environment**: Full-stack Node.js & Express (supporting ESM and Vite middleware)
- **Deployment**: Render / Google Cloud Run

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- A Firebase Project (with Firestore and Google Authentication enabled)
- A Google Gemini API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/social-pipeline-ai.git
   cd social-pipeline-ai
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory and add the following:
   ```env
   # Required for local development if not provided globally
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   *Note: Firebase configuration is loaded dynamically via `firebase-applet-config.json`.*

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:3000`.

## 🏗️ Project Structure

- `/src/components`: Reusable UI elements and complex widgets like `AnalyticsView`.
- `/src/pages`: Top-level routing components (`AuthPage`, `DashboardPage`, `WorkspacePage`).
- `/src/services`: Shared logic for external services integration (Firebase, Gemini API).
- `/src/components/ui`: Shadcn UI primitives.
- `server.ts`: Custom Express server entry point supporting SSR/Vite dev middleware.
- `firebase-blueprint.json` & `firestore.rules`: Declarative security rules enforcing Zero-Trust DB access and Data modeling.

## 🔒 Security Architecture

This project implements **Zero-Trust Firestore Rules**:
- **Attribute-Based Access Control (ABAC)** explicitly governing reads and writes.
- **Schema Validation** running natively inside Firestore to reject malicious payloads on `create` and `update` commands.
- **Strict Key Checking** via MapDiff `.hasOnly()` gates.
- Verified user sessions using Google Auth.

## 📈 Roadmap

- [ ] Support for direct social account connections using OAuth (LinkedIn, Twitter, Meta).
- [ ] Automated publishing engine.
- [ ] In-depth audience insight APIs integration.
- [ ] Multi-user collaboration within workspaces.

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.
