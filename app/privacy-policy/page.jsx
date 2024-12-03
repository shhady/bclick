'use client';

import Link from 'next/link';
import { FaLock } from 'react-icons/fa';
import PageLayout from '../terms-and-conditions/PageLayout';

export default function PrivacyPolicy() {
  return (
    <PageLayout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Link href={'/'}>
          <button className="mb-4 text-customBlue font-semibold hover:underline">
            חזרה לעמוד הבית
          </button>
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <FaLock size={32} className="text-customBlue" />
          <h1 className="text-3xl font-bold">מדיניות פרטיות</h1>
        </div>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">מידע שאנו אוספים</h2>
          <p className="text-lg leading-relaxed">
            אנו עשויים לאסוף מידע אישי כגון שם, מספר טלפון, כתובת דוא&quot;ל, כתובת פיזית, פרטי עסק, ונתונים טכניים כמו כתובת IP ודפדפן. המידע נועד לשיפור השירות ולשימושים חוקיים בלבד.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">מטרות השימוש במידע</h2>
          <ul className="list-disc list-inside text-lg leading-relaxed space-y-2">
            <li>ניהול חשבונות משתמשים והענקת שירותים מותאמים אישית.</li>
            <li>שיפור חוויית המשתמש ושירותי המערכת.</li>
            <li>ניתוח נתונים לשיפור ביצועים ולהבנת צרכי המשתמשים.</li>
            <li>תקשורת עם המשתמשים למטרות שירות לקוחות, תמיכה, והודעות על עדכונים.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">שיתוף מידע עם צד שלישי</h2>
          <p className="text-lg leading-relaxed">
            אנו לא נשתף מידע אישי עם צד שלישי ללא הסכמת המשתמש, למעט במקרים בהם נדרש על פי חוק או לצורך שיפור השירות (כגון ספקי אחסון ומערכות תשלומים).
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">אבטחת מידע</h2>
          <p className="text-lg leading-relaxed">
            אנו נוקטים באמצעים טכנולוגיים ואדמיניסטרטיביים לשמירה על אבטחת המידע האישי של המשתמשים, כולל הצפנה ואימות גישה.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">זכויות המשתמש</h2>
          <p className="text-lg leading-relaxed">
            למשתמשים הזכות לעיין, לתקן, למחוק או להגביל את עיבוד המידע האישי שלהם. ניתן לפנות אלינו בכל עת למימוש זכויות אלה.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">שמירה על מידע</h2>
          <p className="text-lg leading-relaxed">
            אנו נשמור את המידע האישי של המשתמשים כל עוד נדרש למטרות לשמן הוא נאסף, או לפי דרישות החוק.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">שינויים במדיניות הפרטיות</h2>
          <p className="text-lg leading-relaxed">
            מדיניות זו עשויה להתעדכן מעת לעת. אנו ממליצים לבדוק את דף זה באופן קבוע להתעדכנות בשינויים.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">צור קשר</h2>
          <p className="text-lg leading-relaxed">
            לכל שאלה או בקשה בנוגע למדיניות הפרטיות, ניתן לפנות אלינו בדוא&quot;ל:
            <a href="mailto:support@bclick.com" className="text-customBlue underline">
              support@bclick.com
            </a>
            {' '}או בטלפון:
            <a href="tel:+123456789" className="text-customBlue underline">
              0543113297
            </a>.
          </p>
        </section>
      </div>
    </PageLayout>
  );
}
