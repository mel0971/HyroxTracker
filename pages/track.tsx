import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { translations, Language } from '../lib/translations';

interface FormData {
  date: string;
  totalTime: number;
  skierg: number;
  sledPush: number;
  sledPull: number;
  burpeeBroadJumps: number;
  rowErg: number;
  farmerCarry: number;
  sandbagLunges: number;
  wallBalls: number;
}

export default function TrackPerformance() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [language, setLanguage] = useState<Language>('fr');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<FormData>({
    date: new Date().toISOString().split('T')[0],
    totalTime: 0,
    skierg: 0,
    sledPush: 0,
    sledPull: 0,
    burpeeBroadJumps: 0,
    rowErg: 0,
    farmerCarry: 0,
    sandbagLunges: 0,
    wallBalls: 0,
  });

  const t = translations[language];
  const stations = [
    { key: 'skierg', label: t.skierg },
    { key: 'sledPush', label: t.sledPush },
    { key: 'sledPull', label: t.sledPull },
    { key: 'burpeeBroadJumps', label: t.burpeeBroadJumps },
    { key: 'rowErg', label: t.rowErg },
    { key: 'farmerCarry', label: t.farmerCarry },
    { key: 'sandbagLunges', label: t.sandbagLunges },
    { key: 'wallBalls', label: t.wallBalls },
  ];

  useEffect(() => {
    const savedLang = localStorage.getItem('hyrox-language') as Language;
    if (savedLang) setLanguage(savedLang);
  }, []);

  const toggleLanguage = () => {
    const newLang = language === 'fr' ? 'en' : 'fr';
    setLanguage(newLang);
    localStorage.setItem('hyrox-language', newLang);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: name === 'date' ? value : parseInt(value) || 0,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (!user) return;

      if (!form.date) {
        alert(t.fillAllFields);
        setSubmitting(false);
        return;
      }

      await addDoc(collection(db, 'performances'), {
        userId: user.uid,
        date: form.date,
        totalTime: form.totalTime,
        stations: {
          skierg: form.skierg,
          sledPush: form.sledPush,
          sledPull: form.sledPull,
          burpeeBroadJumps: form.burpeeBroadJumps,
          rowErg: form.rowErg,
          farmerCarry: form.farmerCarry,
          sandbagLunges: form.sandbagLunges,
          wallBalls: form.wallBalls,
        },
        createdAt: serverTimestamp(),
      });

      alert(t.success);
      router.push('/dashboard');
    } catch (error) {
      console.error('Error:', error);
      alert(t.error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8">{t.loading}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">{t.appTitle}</h1>
          <button
            onClick={toggleLanguage}
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
          >
            {language === 'fr' ? 'EN' : 'FR'}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold mb-8 text-blue-700">{t.logNewPerformance}</h2>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.date} *
                </label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.totalTime} *
                </label>
                <input
                  type="number"
                  name="totalTime"
                  value={form.totalTime}
                  onChange={handleChange}
                  placeholder="e.g., 3600"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">8 {t.trackPerformance}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {stations.map((station) => (
                  <div key={station.key}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {station.label} ({t.time})
                    </label>
                    <input
                      type="number"
                      name={station.key}
                      value={form[station.key as keyof FormData]}
                      onChange={handleChange}
                      placeholder="0"
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-gradient-to-r from-blue-600 to-orange-500 text-white font-bold py-3 rounded-lg hover:shadow-lg transition disabled:opacity-50"
              >
                {submitting ? t.loading : t.save}
              </button>
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="flex-1 bg-gray-300 text-gray-800 font-bold py-3 rounded-lg hover:bg-gray-400 transition"
              >
                {t.cancel}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}