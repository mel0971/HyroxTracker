import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { auth, db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Link from 'next/link';
import { translations } from '../lib/translations';
import type { Language } from '../lib/translations';

const stations = [
  '1️⃣ SkiErg',
  '2️⃣ Sled Push',
  '3️⃣ Sled Pull',
  '4️⃣ Burpee Broad Jumps',
  '5️⃣ Rowing',
  '6️⃣ Farmers Carry',
  '7️⃣ Fentes marchées',
  '8️⃣ Wall Balls',
];

export default function Tracking() {
  const router = useRouter();
  const [language, setLanguage] = useState<Language>('fr');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    station: stations[0],
    minutes: '',
    seconds: '',
    notes: '',
  });

  const t = translations[language];

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
      if (!currentUser) {
        router.push('/login');
      } else {
        setUser(currentUser);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!form.minutes || !form.station) {
        alert('Veuillez remplir tous les champs');
        setLoading(false);
        return;
      }

      const totalSeconds = parseInt(form.minutes) * 60 + (parseInt(form.seconds) || 0);

      await addDoc(collection(db, 'performances'), {
        userId: user?.uid,
        station: form.station,
        minutes: parseInt(form.minutes),
        seconds: parseInt(form.seconds) || 0,
        totalSeconds: totalSeconds,
        notes: form.notes,
        date: new Date().toLocaleDateString('fr-FR'),
        timestamp: new Date(),
      });

      alert('✅ Performance enregistrée !');
      setForm({
        station: stations[0],
        minutes: '',
        seconds: '',
        notes: '',
      });
      
      router.push('/dashboard');
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      {/* Header */}
      <header className="bg-slate-900/50 backdrop-blur border-b-2 border-cyan-400/30 p-6">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-black text-cyan-400">📊 Suivi des Performances</h1>
          <div className="flex gap-4">
            <button
              onClick={toggleLanguage}
              className="px-6 py-3 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black rounded-lg"
            >
              {language === 'fr' ? '🇬🇧 EN' : '🇫🇷 FR'}
            </button>
            <Link href="/dashboard" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-lg">
              ← Retour
            </Link>
          </div>
        </div>
      </header>
