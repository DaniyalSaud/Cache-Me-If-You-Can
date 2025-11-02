import type { Route } from "./+types/privacy-policy";
import { Link } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Privacy Policy - FreshHarvest" },
    { name: "description", content: "FreshHarvest Privacy Policy and data protection information" },
  ];
}

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background-50">
      {/* Header */}
      <header className="bg-primary-700 shadow-lg">
        <div className="container-page py-6">
          <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity w-fit">
            <div className="flex items-center gap-2 text-2xl">
              <span>🌾</span>
              <span>🌽</span>
              <span>🥕</span>
            </div>
            <h1 className="text-3xl font-bold text-white">FreshHarvest</h1>
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="container-page py-12">
        <div className="max-w-4xl mx-auto">
          {/* Back Link */}
          <Link 
            to="/marketplace" 
            className="inline-flex items-center gap-2 text-primary-700 hover:text-primary-800 text-sm mb-6 transition-colors font-medium"
          >
            <span className="text-lg">←</span>
            <span>Back to Marketplace</span>
          </Link>

          {/* Page Header */}
          <div className="card bg-white shadow-xl mb-8">
            <div className="text-center">
              <div className="text-5xl mb-4">🔒</div>
              <h1 className="text-3xl md:text-4xl font-bold text-text-900 mb-3">
                Privacy Policy
              </h1>
              <p className="text-sm text-text-600">
                Last Updated: November 2, 2025
              </p>
            </div>
          </div>

          {/* Content Sections */}
          <div className="space-y-6">
            {/* Introduction */}
            <section className="card bg-white shadow-lg">
              <h2 className="text-2xl font-bold text-text-900 mb-4 flex items-center gap-2">
                <span>📋</span>
                <span>Introduction</span>
              </h2>
              <p className="text-text-700 leading-relaxed mb-4">
                Welcome to FreshHarvest. We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
              </p>
              <p className="text-text-700 leading-relaxed">
                By using FreshHarvest, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our services.
              </p>
            </section>

            {/* Information We Collect */}
            <section className="card bg-white shadow-lg">
              <h2 className="text-2xl font-bold text-text-900 mb-4 flex items-center gap-2">
                <span>📊</span>
                <span>Information We Collect</span>
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-text-900 mb-2">Personal Information</h3>
                  <ul className="list-disc list-inside space-y-2 text-text-700 ml-4">
                    <li>Name and contact information (phone number, email)</li>
                    <li>Account credentials (username, password)</li>
                    <li>Location and region information</li>
                    <li>Payment and billing information</li>
                    <li>Profile information (user type: farmer/buyer)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-900 mb-2">Product Information</h3>
                  <ul className="list-disc list-inside space-y-2 text-text-700 ml-4">
                    <li>Product listings and descriptions</li>
                    <li>Images and pricing information</li>
                    <li>Transaction history</li>
                    <li>Order details and preferences</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-900 mb-2">Usage Data</h3>
                  <ul className="list-disc list-inside space-y-2 text-text-700 ml-4">
                    <li>Browser type and version</li>
                    <li>Device information</li>
                    <li>IP address and location data</li>
                    <li>Pages visited and time spent on the platform</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* How We Use Your Information */}
            <section className="card bg-white shadow-lg">
              <h2 className="text-2xl font-bold text-text-900 mb-4 flex items-center gap-2">
                <span>⚙️</span>
                <span>How We Use Your Information</span>
              </h2>
              <ul className="list-disc list-inside space-y-3 text-text-700 ml-4">
                <li>To create and manage your account</li>
                <li>To process transactions and send transaction notifications</li>
                <li>To provide customer support and respond to inquiries</li>
                <li>To improve our platform and develop new features</li>
                <li>To send marketing communications (with your consent)</li>
                <li>To detect, prevent, and address fraud and security issues</li>
                <li>To comply with legal obligations and enforce our terms</li>
                <li>To facilitate communication between farmers and buyers</li>
              </ul>
            </section>

            {/* Information Sharing */}
            <section className="card bg-white shadow-lg">
              <h2 className="text-2xl font-bold text-text-900 mb-4 flex items-center gap-2">
                <span>🔄</span>
                <span>Information Sharing and Disclosure</span>
              </h2>
              <p className="text-text-700 leading-relaxed mb-4">
                We do not sell your personal information. We may share your information in the following circumstances:
              </p>
              <ul className="list-disc list-inside space-y-3 text-text-700 ml-4">
                <li><strong>With other users:</strong> Product listings and seller information are visible to buyers</li>
                <li><strong>Service providers:</strong> Payment processors, cloud storage, and analytics services</li>
                <li><strong>Legal compliance:</strong> When required by law or to protect our rights</li>
                <li><strong>Business transfers:</strong> In connection with mergers, acquisitions, or asset sales</li>
                <li><strong>With your consent:</strong> When you explicitly authorize us to share your information</li>
              </ul>
            </section>

            {/* Data Security */}
            <section className="card bg-white shadow-lg">
              <h2 className="text-2xl font-bold text-text-900 mb-4 flex items-center gap-2">
                <span>🔐</span>
                <span>Data Security</span>
              </h2>
              <p className="text-text-700 leading-relaxed mb-4">
                We implement appropriate technical and organizational security measures to protect your personal information, including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-text-700 ml-4">
                <li>Encryption of data in transit and at rest</li>
                <li>Secure authentication and access controls</li>
                <li>Regular security assessments and updates</li>
                <li>Employee training on data protection</li>
              </ul>
              <p className="text-text-700 leading-relaxed mt-4">
                However, no method of transmission over the internet is 100% secure. While we strive to protect your personal information, we cannot guarantee its absolute security.
              </p>
            </section>

            {/* Your Rights */}
            <section className="card bg-white shadow-lg">
              <h2 className="text-2xl font-bold text-text-900 mb-4 flex items-center gap-2">
                <span>✅</span>
                <span>Your Privacy Rights</span>
              </h2>
              <p className="text-text-700 leading-relaxed mb-4">
                You have the following rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside space-y-2 text-text-700 ml-4">
                <li><strong>Access:</strong> Request access to your personal data</li>
                <li><strong>Correction:</strong> Request correction of inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal data</li>
                <li><strong>Data portability:</strong> Request a copy of your data in a portable format</li>
                <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                <li><strong>Withdraw consent:</strong> Withdraw consent for data processing</li>
              </ul>
              <p className="text-text-700 leading-relaxed mt-4">
                To exercise these rights, please contact us at <a href="mailto:privacy@freshharvest.pk" className="text-primary-700 font-semibold hover:underline">privacy@freshharvest.pk</a>
              </p>
            </section>

            {/* Cookies */}
            <section className="card bg-white shadow-lg">
              <h2 className="text-2xl font-bold text-text-900 mb-4 flex items-center gap-2">
                <span>🍪</span>
                <span>Cookies and Tracking</span>
              </h2>
              <p className="text-text-700 leading-relaxed mb-4">
                We use cookies and similar tracking technologies to improve your experience on our platform. Cookies help us:
              </p>
              <ul className="list-disc list-inside space-y-2 text-text-700 ml-4">
                <li>Remember your preferences and settings</li>
                <li>Maintain your session and keep you logged in</li>
                <li>Analyze site traffic and usage patterns</li>
                <li>Provide personalized content and recommendations</li>
              </ul>
              <p className="text-text-700 leading-relaxed mt-4">
                You can control cookies through your browser settings. However, disabling cookies may limit your ability to use certain features of our platform.
              </p>
            </section>

            {/* Children's Privacy */}
            <section className="card bg-white shadow-lg">
              <h2 className="text-2xl font-bold text-text-900 mb-4 flex items-center gap-2">
                <span>👶</span>
                <span>Children's Privacy</span>
              </h2>
              <p className="text-text-700 leading-relaxed">
                FreshHarvest is not intended for users under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately, and we will take steps to remove that information.
              </p>
            </section>

            {/* Changes to Policy */}
            <section className="card bg-white shadow-lg">
              <h2 className="text-2xl font-bold text-text-900 mb-4 flex items-center gap-2">
                <span>🔄</span>
                <span>Changes to This Privacy Policy</span>
              </h2>
              <p className="text-text-700 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.
              </p>
            </section>

            {/* Contact */}
            <section className="card bg-white shadow-lg">
              <h2 className="text-2xl font-bold text-text-900 mb-4 flex items-center gap-2">
                <span>📧</span>
                <span>Contact Us</span>
              </h2>
              <p className="text-text-700 leading-relaxed mb-4">
                If you have questions or concerns about this Privacy Policy, please contact us:
              </p>
              <div className="space-y-2 text-text-700">
                <p><strong>Email:</strong> <a href="mailto:privacy@freshharvest.pk" className="text-primary-700 hover:underline">privacy@freshharvest.pk</a></p>
                <p><strong>Phone:</strong> +92 300 1234567</p>
                <p><strong>Address:</strong> FreshHarvest, Karachi, Pakistan</p>
              </div>
            </section>
          </div>

          {/* Back to Top */}
          <div className="text-center mt-8">
            <Link to="/marketplace" className="btn-primary inline-flex items-center gap-2">
              <span>←</span>
              <span>Back to Marketplace</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
