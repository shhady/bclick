import Link from 'next/link';
import { FaGavel } from 'react-icons/fa';
import PageLayout from './PageLayout';

export default function TermsAndConditions() {
  return (
    <PageLayout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Link href={'/'} className="mb-4 text-customBlue font-semibold hover:underline">
          <button>חזרה לעמוד הבית</button>
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <FaGavel size={32} className="text-customBlue" />
          <h1 className="text-3xl font-bold">תנאים והגבלות</h1>
        </div>

        {/* Introduction */}
        <section className="mb-8">
          <p className="text-lg leading-relaxed">
            ברוכים הבאים ל-BClick! תנאים והגבלות אלו קובעים את התנאים בהם תוכלו להשתמש בפלטפורמה שלנו. הגישה והשימוש באתר מעידים על קבלת התנאים הללו.
          </p>
        </section>

        {/* Purpose of the Platform */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">מטרת הפלטפורמה</h2>
          <p className="text-lg leading-relaxed">
            הפלטפורמה מיועדת לניהול יחסי ספקים ולקוחות במערכת B2B, כולל ניהול קטלוגים, מעקב הזמנות, דוחות עסקיים ותקשורת ישירה.
          </p>
          <p className="text-lg leading-relaxed mt-2">
            המערכת אינה מיועדת לשימוש פרטי או לכל מטרה שאינה תואמת את עקרונותיה ומטרותיה העסקיות.
          </p>
        </section>

        {/* User Responsibilities */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">אחריות המשתמש</h2>
          <ul className="list-disc list-inside text-lg leading-relaxed space-y-2">
            <li>המשתמש מתחייב לספק מידע מדויק, אמין ומעודכן.</li>
            <li>אין להשתמש במערכת לכל פעולה בלתי חוקית או פוגענית.</li>
            <li>השימוש במערכת מוגבל למטרות עסקיות בלבד.</li>
            <li>אחריותו של המשתמש לשמור על סודיות נתוני החשבון והגישה אליו.</li>
          </ul>
        </section>

        {/* Intellectual Property */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">קניין רוחני</h2>
          <p className="text-lg leading-relaxed">
            כל התכנים, כולל עיצובים, לוגואים, ותכנים גרפיים בפלטפורמה, הם קניין בלעדי של BClick ואסור להעתיקם או להשתמש בהם ללא אישור בכתב.
          </p>
        </section>

        {/* Limitation of Liability */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">הגבלת אחריות</h2>
          <p className="text-lg leading-relaxed">
            החברה אינה אחראית לכל נזק ישיר או עקיף שייגרם משימוש במערכת. המשתמש אחראי לכל פעולה או נזק שייגרם בגין שימוש לא נכון במערכת.
          </p>
        </section>

        {/* Data Privacy */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">שמירה על פרטיות</h2>
          <p className="text-lg leading-relaxed">
            אנו מחויבים לשמור על פרטיות המידע שלך. למידע נוסף על אופן השימוש במידע האישי שלך, עיין במדיניות הפרטיות שלנו.
          </p>
          <Link href="/privacy-policy" className="text-customBlue underline">
            למד עוד על מדיניות הפרטיות שלנו
          </Link>
        </section>

        {/* Account Termination */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">סיום חשבון</h2>
          <p className="text-lg leading-relaxed">
            החברה שומרת לעצמה את הזכות להשעות או לסיים חשבון משתמש בכל עת, אם תתגלה הפרה של תנאי השימוש או פעולה הנוגדת את מטרות המערכת.
          </p>
        </section>

        {/* Updates to Terms */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">עדכונים לתנאים</h2>
          <p className="text-lg leading-relaxed">
            החברה רשאית לעדכן את תנאי השימוש מעת לעת. מומלץ למשתמש לבדוק דף זה מפעם לפעם כדי להתעדכן בשינויים.
          </p>
        </section>

        {/* Contact Information */}
        <section>
          <h2 className="text-2xl font-semibold mb-2">צור קשר</h2>
          <p className="text-lg leading-relaxed">
            יש לכם שאלות או הצעות? אנו כאן בשבילכם! ניתן לפנות אלינו באמצעות:
          </p>
          <ul className="list-disc list-inside text-lg leading-relaxed space-y-2">
            <li>
              אימייל: <a href="mailto:support@bclick.com" className="text-customBlue underline">support@bclick.com</a>
            </li>
            <li>
              טלפון: <a href="tel:+123456789" className="text-customBlue underline">0543113297</a>
            </li>
            <li>כתובת: נצרת</li>
          </ul>
        </section>
      </div>
    </PageLayout>
  );
}
