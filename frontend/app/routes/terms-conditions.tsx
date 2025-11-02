import type { Route } from "./+types/terms-conditions";
import { Link } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Terms & Conditions - FreshHarvest" },
    { name: "description", content: "FreshHarvest Terms and Conditions of service" },
  ];
}

export default function TermsConditions() {
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
              <div className="text-5xl mb-4">📜</div>
              <h1 className="text-3xl md:text-4xl font-bold text-text-900 mb-3">
                Terms & Conditions
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
                <span>Agreement to Terms</span>
              </h2>
              <p className="text-text-700 leading-relaxed mb-4">
                Welcome to FreshHarvest. These Terms and Conditions ("Terms") govern your access to and use of the FreshHarvest platform, website, and services (collectively, the "Platform"). By accessing or using our Platform, you agree to be bound by these Terms.
              </p>
              <p className="text-text-700 leading-relaxed">
                If you do not agree with these Terms, you must not access or use the Platform. We reserve the right to modify these Terms at any time, and your continued use of the Platform constitutes acceptance of those changes.
              </p>
            </section>

            {/* Eligibility */}
            <section className="card bg-white shadow-lg">
              <h2 className="text-2xl font-bold text-text-900 mb-4 flex items-center gap-2">
                <span>✅</span>
                <span>Eligibility</span>
              </h2>
              <p className="text-text-700 leading-relaxed mb-4">
                To use FreshHarvest, you must:
              </p>
              <ul className="list-disc list-inside space-y-2 text-text-700 ml-4">
                <li>Be at least 18 years of age</li>
                <li>Have the legal capacity to enter into binding contracts</li>
                <li>Provide accurate and complete registration information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Not be prohibited from using the Platform under applicable law</li>
              </ul>
            </section>

            {/* User Accounts */}
            <section className="card bg-white shadow-lg">
              <h2 className="text-2xl font-bold text-text-900 mb-4 flex items-center gap-2">
                <span>👤</span>
                <span>User Accounts</span>
              </h2>
              <div className="space-y-4 text-text-700">
                <div>
                  <h3 className="text-lg font-semibold text-text-900 mb-2">Account Registration</h3>
                  <p className="leading-relaxed mb-2">
                    When creating an account, you agree to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Provide true, accurate, current, and complete information</li>
                    <li>Maintain and promptly update your account information</li>
                    <li>Maintain the security of your password</li>
                    <li>Accept responsibility for all activities under your account</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-900 mb-2">Account Types</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Farmer/Seller Accounts:</strong> For listing and selling agricultural products</li>
                    <li><strong>Buyer Accounts:</strong> For purchasing products from farmers</li>
                    <li><strong>Admin Accounts:</strong> For platform management (by invitation only)</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Platform Use */}
            <section className="card bg-white shadow-lg">
              <h2 className="text-2xl font-bold text-text-900 mb-4 flex items-center gap-2">
                <span>🌾</span>
                <span>Platform Use</span>
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-text-900 mb-2">Permitted Use</h3>
                  <ul className="list-disc list-inside space-y-2 text-text-700 ml-4">
                    <li>List and sell agricultural products (farmers/sellers)</li>
                    <li>Browse and purchase products (buyers)</li>
                    <li>Communicate with other users through the platform</li>
                    <li>Report crop waste for recycling and composting</li>
                    <li>Access farming tools and calculators</li>
                    <li>Apply for agricultural loans and subsidies</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-900 mb-2">Prohibited Activities</h3>
                  <p className="text-text-700 leading-relaxed mb-2">
                    You agree NOT to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-text-700 ml-4">
                    <li>Use the Platform for illegal purposes</li>
                    <li>Post false, misleading, or fraudulent listings</li>
                    <li>Harass, threaten, or defraud other users</li>
                    <li>Interfere with or disrupt the Platform's operation</li>
                    <li>Attempt to gain unauthorized access to systems</li>
                    <li>Collect user data without consent</li>
                    <li>Impersonate others or misrepresent your identity</li>
                    <li>Violate intellectual property rights</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Product Listings */}
            <section className="card bg-white shadow-lg">
              <h2 className="text-2xl font-bold text-text-900 mb-4 flex items-center gap-2">
                <span>📦</span>
                <span>Product Listings and Sales</span>
              </h2>
              <div className="space-y-4 text-text-700">
                <div>
                  <h3 className="text-lg font-semibold text-text-900 mb-2">Seller Obligations</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Provide accurate product descriptions and pricing</li>
                    <li>Upload clear, representative product images</li>
                    <li>Ensure products meet quality and safety standards</li>
                    <li>Honor commitments made to buyers</li>
                    <li>Comply with all applicable agricultural laws</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-900 mb-2">Buyer Obligations</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Complete transactions in good faith</li>
                    <li>Make timely payments for orders</li>
                    <li>Coordinate pickup or delivery arrangements</li>
                    <li>Inspect products upon receipt</li>
                    <li>Report issues promptly through proper channels</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Payments and Fees */}
            <section className="card bg-white shadow-lg">
              <h2 className="text-2xl font-bold text-text-900 mb-4 flex items-center gap-2">
                <span>💳</span>
                <span>Payments and Fees</span>
              </h2>
              <div className="space-y-3 text-text-700">
                <p className="leading-relaxed">
                  <strong>Transaction Fees:</strong> FreshHarvest may charge service fees on transactions. Fees will be clearly disclosed before transaction completion.
                </p>
                <p className="leading-relaxed">
                  <strong>Payment Processing:</strong> Payments are processed through secure third-party payment providers. You agree to comply with their terms of service.
                </p>
                <p className="leading-relaxed">
                  <strong>Refunds:</strong> Refund policies are determined on a case-by-case basis. Disputes should be reported within 48 hours of product receipt.
                </p>
                <p className="leading-relaxed">
                  <strong>Pricing:</strong> All prices are in Pakistani Rupees (PKR) unless otherwise stated. Prices are subject to change without notice.
                </p>
              </div>
            </section>

            {/* Intellectual Property */}
            <section className="card bg-white shadow-lg">
              <h2 className="text-2xl font-bold text-text-900 mb-4 flex items-center gap-2">
                <span>©️</span>
                <span>Intellectual Property</span>
              </h2>
              <p className="text-text-700 leading-relaxed mb-4">
                <strong>Platform Content:</strong> All content, features, and functionality on the Platform, including text, graphics, logos, and software, are owned by FreshHarvest and protected by copyright and trademark laws.
              </p>
              <p className="text-text-700 leading-relaxed mb-4">
                <strong>User Content:</strong> You retain ownership of content you post. By posting content, you grant FreshHarvest a worldwide, non-exclusive license to use, display, and distribute your content on the Platform.
              </p>
              <p className="text-text-700 leading-relaxed">
                <strong>Restrictions:</strong> You may not copy, modify, distribute, or create derivative works of Platform content without express permission.
              </p>
            </section>

            {/* Limitation of Liability */}
            <section className="card bg-white shadow-lg">
              <h2 className="text-2xl font-bold text-text-900 mb-4 flex items-center gap-2">
                <span>⚠️</span>
                <span>Limitation of Liability</span>
              </h2>
              <p className="text-text-700 leading-relaxed mb-4">
                FreshHarvest acts as a marketplace platform connecting farmers and buyers. We are not responsible for:
              </p>
              <ul className="list-disc list-inside space-y-2 text-text-700 ml-4">
                <li>Product quality, safety, or legality</li>
                <li>Accuracy of product listings</li>
                <li>Actions or inactions of sellers or buyers</li>
                <li>Delivery delays or failures</li>
                <li>Disputes between users</li>
                <li>Loss of profits or business opportunities</li>
              </ul>
              <p className="text-text-700 leading-relaxed mt-4">
                To the maximum extent permitted by law, FreshHarvest's liability is limited to the amount paid by you for services in the 12 months preceding the claim.
              </p>
            </section>

            {/* Disputes */}
            <section className="card bg-white shadow-lg">
              <h2 className="text-2xl font-bold text-text-900 mb-4 flex items-center gap-2">
                <span>⚖️</span>
                <span>Dispute Resolution</span>
              </h2>
              <p className="text-text-700 leading-relaxed mb-4">
                If a dispute arises between users or between a user and FreshHarvest:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-text-700 ml-4">
                <li>Contact FreshHarvest support to attempt resolution</li>
                <li>Participate in good faith in mediation if offered</li>
                <li>If unresolved, disputes will be subject to the laws of Pakistan</li>
                <li>Legal proceedings must be brought in the courts of Karachi, Pakistan</li>
              </ol>
            </section>

            {/* Termination */}
            <section className="card bg-white shadow-lg">
              <h2 className="text-2xl font-bold text-text-900 mb-4 flex items-center gap-2">
                <span>🚫</span>
                <span>Termination</span>
              </h2>
              <p className="text-text-700 leading-relaxed mb-4">
                We reserve the right to suspend or terminate your account if you:
              </p>
              <ul className="list-disc list-inside space-y-2 text-text-700 ml-4">
                <li>Violate these Terms</li>
                <li>Engage in fraudulent or illegal activities</li>
                <li>Harm other users or the Platform</li>
                <li>Fail to pay fees owed</li>
              </ul>
              <p className="text-text-700 leading-relaxed mt-4">
                You may terminate your account at any time by contacting support. Upon termination, your right to use the Platform ceases immediately.
              </p>
            </section>

            {/* Changes to Terms */}
            <section className="card bg-white shadow-lg">
              <h2 className="text-2xl font-bold text-text-900 mb-4 flex items-center gap-2">
                <span>🔄</span>
                <span>Changes to Terms</span>
              </h2>
              <p className="text-text-700 leading-relaxed">
                We may modify these Terms at any time. We will notify users of material changes via email or Platform notification. Your continued use of the Platform after changes constitutes acceptance of the modified Terms. Please review these Terms periodically.
              </p>
            </section>

            {/* Contact */}
            <section className="card bg-white shadow-lg">
              <h2 className="text-2xl font-bold text-text-900 mb-4 flex items-center gap-2">
                <span>📧</span>
                <span>Contact Us</span>
              </h2>
              <p className="text-text-700 leading-relaxed mb-4">
                If you have questions about these Terms, please contact us:
              </p>
              <div className="space-y-2 text-text-700">
                <p><strong>Email:</strong> <a href="mailto:legal@freshharvest.pk" className="text-primary-700 hover:underline">legal@freshharvest.pk</a></p>
                <p><strong>Phone:</strong> +92 300 1234567</p>
                <p><strong>Address:</strong> FreshHarvest, Karachi, Pakistan</p>
              </div>
            </section>

            {/* Acknowledgment */}
            <section className="card bg-mint-50 border-2 border-primary-500">
              <div className="flex items-start gap-3">
                <span className="text-4xl">✅</span>
                <div>
                  <h3 className="font-bold text-text-900 text-lg mb-2">Acknowledgment</h3>
                  <p className="text-sm text-text-800 leading-relaxed">
                    By using FreshHarvest, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree, please discontinue use of the Platform immediately.
                  </p>
                </div>
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
