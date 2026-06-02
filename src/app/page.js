import Link from 'next/link';
import styles from './LandingPage.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logoContainer}>
          <div className={styles.logoIcon}>LD</div>
          <span className={styles.brandName}>Leevon Delivery</span>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <h1 className={styles.title}>Kurnool&apos;s Upcoming Food Delivery Platform</h1>
          <p className={styles.subtitle}>
            We are building a direct-commission delivery app for local restaurants to bring you your favorite meals fast, fresh, and fairly.
          </p>
          <div className={styles.badge}>Coming Soon</div>
        </section>

        <section className={styles.aboutSection}>
          <h2 className={styles.sectionTitle}>How It Works</h2>
          <div className={styles.features}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>😋</div>
              <h3 className={styles.featureTitle}>For Customers</h3>
              <p className={styles.featureDesc}>
                Order from up to 50 of Kurnool's best local restaurants with transparent pricing and fast, reliable delivery right to your door.
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🛵</div>
              <h3 className={styles.featureTitle}>For Delivery Drivers</h3>
              <p className={styles.featureDesc}>
                Earn fairly with our direct-commission structure. Enjoy flexible hours while supporting your local community.
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🏪</div>
              <h3 className={styles.featureTitle}>For Restaurants</h3>
              <p className={styles.featureDesc}>
                Keep more of your profits. We partner closely with local businesses to ensure a fair ecosystem for everyone.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.legalSection}>
          <p>&copy; 2026 Leevon Delivery LLP. All rights reserved.</p>
          <div className={styles.businessInfo}>
            <p><strong>Phone:</strong> [YOUR DEVELOPER SUPPORT PHONE NUMBER]</p>
            <p><strong>Email:</strong> [YOUR DEVELOPER SUPPORT EMAIL]</p>
          </div>
          <div className={styles.links}>
            <Link href="/privacy-policy" className={styles.link}>
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
