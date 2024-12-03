import Link from 'next/link';
import { FaInfoCircle } from 'react-icons/fa';
import PageLayout from './PageLayout';

export default function AboutUs() {

  return (
    <PageLayout>

    <div className="max-w-5xl mx-auto px-4 py-8">
     <Link href={'/'}         className="mb-4 text-customBlue font-semibold hover:underline"
     > <button
      >
        חזרה לעמוד הבית
      </button></Link>

      <div className="flex items-center gap-3 m-6">
        <FaInfoCircle size={32} className="text-customBlue" />
        <h1 className="text-3xl font-bold">אודות</h1>
      </div>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">מי אנחנו?</h2>
        <p className="text-lg leading-relaxed">
          BClick היא מערכת חדשנית שמחברת ספקים ולקוחות בתהליך חלק, מהיר ופשוט. אנו מספקים פלטפורמה שמאפשרת ניהול מלא של קטלוגים, הזמנות, ולקוחות, תוך מתן דגש על גישה אינטואיטיבית ושימוש בטכנולוגיות מתקדמות.
        </p>
        <p className="text-lg leading-relaxed mt-4">
          המטרה שלנו היא לספק לך כלים חכמים לניהול העסק שלך בצורה היעילה ביותר, כך שתוכל להתמקד במה שבאמת חשוב: צמיחה וחדשנות.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">מה אנחנו מציעים?</h2>
        <ul className="list-disc list-inside text-lg leading-relaxed space-y-2">
          <li>ניהול קטלוג מוצרים מתקדם.</li>
          <li>מעקב אחר הזמנות בלחיצה אחת.</li>
          <li>דוחות חכמים וניתוח ביצועים לעסק שלך.</li>
          <li>תמיכה טכנית מקצועית וזמינה.</li>
          <li>שימוש בטכנולוגיות מתקדמות לשיפור תהליכים.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">למה לבחור בנו?</h2>
        <p className="text-lg leading-relaxed">
          אנו מבינים את הצרכים הייחודיים של עסקים בתחום ה-B2B ומתחייבים לספק פתרונות מותאמים אישית לכל לקוח. צוות המומחים שלנו כאן כדי להבטיח חוויית משתמש איכותית ויעילה.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-2">צרו איתנו קשר</h2>
        <p className="text-lg leading-relaxed">
          לכל שאלה או בקשה, ניתן לפנות אלינו באמצעות המייל: <a href="mailto:support@bclick.com" className="text-customBlue underline">support@bclick.com</a> או בטלפון: <a href="tel:+123456789" className="text-customBlue underline">+123456789</a>.
        </p>
      </section>
    </div>
    </PageLayout>

  );
}
