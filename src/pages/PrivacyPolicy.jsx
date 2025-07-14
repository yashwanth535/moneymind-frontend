import React from "react";

const PrivacyPolicy = () => (
  <div className="min-h-screen bg-black text-white py-10 px-4 md:px-0 flex flex-col items-center">
    <div className="max-w-2xl w-full">
      <h1 className="text-3xl font-bold mb-6 text-[#20D982]">Privacy Policy</h1>
      <p className="mb-4">Your privacy is important to us. This Privacy Policy explains how MoneyMind collects, uses, and protects your information.</p>
      <h2 className="text-xl font-semibold mt-6 mb-2">Information We Collect</h2>
      <ul className="list-disc ml-6 mb-4">
        <li>Personal information (such as email, name) for authentication</li>
        <li>Financial data you provide for tracking and analytics</li>
        <li>Usage data for improving our services</li>
      </ul>
      <h2 className="text-xl font-semibold mt-6 mb-2">How We Use Your Information</h2>
      <ul className="list-disc ml-6 mb-4">
        <li>To provide and maintain the MoneyMind service</li>
        <li>To improve user experience and develop new features</li>
        <li>To communicate with you about updates and support</li>
      </ul>
      <h2 className="text-xl font-semibold mt-6 mb-2">Data Security</h2>
      <p className="mb-4">We implement industry-standard security measures to protect your data. Your information is never sold or shared with third parties except as required by law.</p>
      <h2 className="text-xl font-semibold mt-6 mb-2">Contact</h2>
      <p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:support@moneymind.yashwanth.site" className="text-[#20D982] underline">support@moneymind.yashwanth.site</a>.</p>
    </div>
  </div>
);

export default PrivacyPolicy; 