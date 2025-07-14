import React from "react";

const Terms = () => (
  <div className="min-h-screen bg-black text-white py-10 px-4 md:px-0 flex flex-col items-center">
    <div className="max-w-2xl w-full">
      <h1 className="text-3xl font-bold mb-6 text-[#20D982]">Terms of Service</h1>
      <p className="mb-4">By using MoneyMind, you agree to the following terms and conditions. Please read them carefully.</p>
      <h2 className="text-xl font-semibold mt-6 mb-2">Use of Service</h2>
      <ul className="list-disc ml-6 mb-4">
        <li>You must be at least 13 years old to use MoneyMind.</li>
        <li>You are responsible for maintaining the confidentiality of your account.</li>
        <li>You agree not to misuse the service or attempt to access it in unauthorized ways.</li>
      </ul>
      <h2 className="text-xl font-semibold mt-6 mb-2">Limitation of Liability</h2>
      <p className="mb-4">MoneyMind is provided "as is" without warranties of any kind. We are not liable for any damages or losses resulting from your use of the service.</p>
      <h2 className="text-xl font-semibold mt-6 mb-2">Changes to Terms</h2>
      <p className="mb-4">We may update these terms from time to time. Continued use of MoneyMind means you accept the revised terms.</p>
      <h2 className="text-xl font-semibold mt-6 mb-2">Contact</h2>
      <p>If you have any questions about these Terms, please contact us at <a href="mailto:support@moneymind.yashwanth.site" className="text-[#20D982] underline">support@moneymind.yashwanth.site</a>.</p>
    </div>
  </div>
);

export default Terms; 