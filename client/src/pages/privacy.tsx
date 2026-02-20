import { Header, Footer, SEOHead } from "./home";
import { useJobsStore } from "@/state/jobs-store";

export default function PrivacyPolicy() {
  const { siteName, siteLogo, categories, locations } = useJobsStore();

  return (
    <div className="min-h-screen">
      <SEOHead
        title={`Privacy Policy — ${siteName}`}
        description="Privacy policy for Crypto Jobs."
        canonicalPath="/privacy"
        siteName={siteName}
      />
      <Header />
      <main id="main-content" className="mx-auto max-w-4xl px-4 py-12">
        <div className="prose max-w-none">
          <h1 className="font-serif text-4xl tracking-tight">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">Last updated: February 6, 2026</p>

          <h2>Overview</h2>
          <p>
            This Privacy Policy explains how {siteName} ("we", "us", "our") collects, uses, and shares
            information when you use our website and services (the "Service").
          </p>

          <h2>Information We Collect</h2>
          <ul>
            <li><strong>Account data:</strong> When you sign in with Google or LinkedIn, we receive your name, email address, and profile information you permit those providers to share.</li>
            <li><strong>Usage data:</strong> We collect basic analytics such as page views, clicks, and device/browser information.</li>
            <li><strong>Job submissions:</strong> If you submit a job, we collect the job details and your contact information (name, email, and Telegram ID).</li>
          </ul>

          <h2>How We Use Information</h2>
          <ul>
            <li>To provide and operate the Service, including job listings and saved jobs.</li>
            <li>To authenticate users and protect accounts.</li>
            <li>To respond to job submissions and communicate with employers.</li>
            <li>To improve the Service and measure performance.</li>
          </ul>

          <h2>Sharing of Information</h2>
          <p>
            We do not sell your personal data. We share information only with service providers
            that help us operate the Service (e.g., authentication, hosting, analytics) and when
            required by law.
          </p>

          <h2>Third-Party Authentication (Google / LinkedIn)</h2>
          <p>
            When you sign in through Google or LinkedIn, their privacy policies apply to the data
            they collect. We only receive the data you authorize via the OAuth consent flow.
          </p>

          <h2>Data Retention</h2>
          <p>
            We retain your account information while your account is active. You may request
            deletion by contacting us.
          </p>

          <h2>Your Rights</h2>
          <p>
            Depending on your location, you may have the right to access, correct, or delete your
            personal data. Contact us to exercise these rights.
          </p>

          <h2>Security</h2>
          <p>
            We implement reasonable security measures to protect your data. No method of
            transmission over the Internet is 100% secure.
          </p>

          <h2>Contact</h2>
          <p>
            If you have questions about this policy, contact us at: <strong>privacy@web3jobs.ooo</strong>
          </p>
        </div>
      </main>
      <Footer categories={categories} locations={locations} siteName={siteName} siteLogo={siteLogo} />
    </div>
  );
}
