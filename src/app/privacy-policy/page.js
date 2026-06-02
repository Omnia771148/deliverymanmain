import Link from 'next/link';
import styles from './PrivacyPolicy.module.css';

export const metadata = {
  title: 'Privacy Policy - Leevon Delivery LLP',
  description: 'Privacy Policy and Data Protection guidelines for Leevon Delivery LLP.',
};

export default function PrivacyPolicy() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Privacy Policy</h1>
        <p className={styles.lastUpdated}>Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
      </header>

      <main className={styles.content}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>1. Introduction</h2>
          <p className={styles.text}>
            Welcome to Leevon Delivery LLP ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and website (collectively, the "Service").
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>2. Information We Collect</h2>
          <p className={styles.text}>We may collect information about you in a variety of ways when you use our Service:</p>
          <ul className={styles.list}>
            <li className={styles.listItem}><strong>Personal Data:</strong> Personally identifiable information, such as your name, shipping address, email address, and telephone number that you voluntarily give to us when registering with the Service.</li>
            <li className={styles.listItem}><strong>Location Data:</strong> We may request access or permission to and track location-based information from your mobile device, either continuously or while you are using the App, to provide location-based services (like finding nearby restaurants and tracking deliveries).</li>
            <li className={styles.listItem}><strong>Financial Data:</strong> Financial information, such as data related to your payment method (e.g., valid credit card number, card brand, expiration date) that we may collect when you purchase, order, or request information about our services.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>3. How We Use Your Information</h2>
          <p className={styles.text}>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Service to:</p>
          <ul className={styles.list}>
            <li className={styles.listItem}>Create and manage your account.</li>
            <li className={styles.listItem}>Process your transactions and deliver the food you ordered.</li>
            <li className={styles.listItem}>Improve our services and app functionality.</li>
            <li className={styles.listItem}>Communicate with you regarding your orders, delivery status, or customer support inquiries.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>4. How We Protect Your Information</h2>
          <p className={styles.text}>
            We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>5. Contact Us</h2>
          <p className={styles.text}>
            If you have questions or comments about this Privacy Policy, please contact us at:
          </p>
          <p className={styles.text}>
            <strong>Leevon Delivery LLP</strong><br />
            [YOUR KURNOOL BUSINESS ADDRESS HERE]<br />
            Email: [YOUR DEVELOPER SUPPORT EMAIL]<br />
            Phone: [YOUR DEVELOPER SUPPORT PHONE NUMBER]
          </p>
        </section>

        <Link href="/" className={styles.backLink}>
          &larr; Back to Home
        </Link>
      </main>
    </div>
  );
}
