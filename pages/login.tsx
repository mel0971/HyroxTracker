import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { auth, db } from '../lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { translations, Language } from '../lib/translations';

export default function Login() {
  const router = useRouter();
  const [language, setLanguage] = useState<Language>('fr');
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    category: 'Open',
    targetTime: 60,
    age: 30,
    gender: 'male',
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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push('/dashboard');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: name === 'targetTime' || name === 'age' ? parseInt(value) : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignup) {
        if (form.password !== form.confirmPassword) {
          alert(t.passwordMismatch);
          setLoading(false);
          return;
        }
        if (!form.name || form.password.length < 6) {
          alert(t.fillAllFields);
          setLoading(false);
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
        const user = userCredential.user;
        await setDoc(doc(db, 'users', user.uid), {
          name: form.name,
          email: form.email,
          category: form.category,
          targetTime: form.targetTime,
          age: form.age,
          gender: form.gender,
          createdAt: new Date().toISOString(),
        });
        alert(t.accountCreated);
        router.push('/dashboard');
      } else {
        if (!form.email || !form.password) {
          alert(t.fillAllFields);
          setLoading(false);
          return;
        }
        await signInWithEmailAndPassword(auth, form.email, form.password);
        alert(t.loginSuccess);
        router.push('/dashboard');
      }
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-orange-900 to-orange-700 flex items-center justify-center relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>

      <div className="w-full max-z-10 px-4 max-w-md">
        {/* Language Toggle */}
        <div className="text-right mb-8">
          <button
            onClick={toggleLanguage}
            className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-bold transition transform hover:scale-105"
          >
            {language === 'fr' ? '🇬🇧 EN' : '🇫🇷 FR'}
          </button>
        </div>

        {/* Main Card */}
        <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 border border-orange-500/30 backdrop-blur">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-5xl font-black text-orange-500 mb-2">⚡ {t.appTitle}</h1>
            <p className="text-gray-300 text-lg">💪 {t.tagline}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <>
                <div>
                  <label className="block text-sm font-bold text-orange-400 mb-2">👤 {t.profile}</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="John Athlete"
                    className="w-full px-4 py-3 border-2 border-orange-500/50 bg-gray-700 text-white rounded-lg focus:outline-none focus:border-orange-500 transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-bold text-orange-400 mb-2">🏆 {t.hyroxCategory}</label>
                    <select
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-orange-500/50 bg-gray-700 text-white rounded-lg focus:outline-none focus:border-orange-500 transition"
                    >
                      <option>Open</option>
                      <option>Doubles</option>
                      <option>Elite</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-orange-400 mb-2">🎂 {t.age}</label>
                    <input
                      type="number"
                      name="age"
                      value={form.age}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-orange-500/50 bg-gray-700 text-white rounded-lg focus:outline-none focus:border-orange-500 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-bold text-orange-400 mb-2">⚧️ {t.gender}</label>
                    <select
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-orange-500/50 bg-gray-700 text-white rounded-lg focus:outline-none focus:border-orange-500 transition"
                    >
                      <option value="male">{t.male}</option>
                      <option value="female">{t.female}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-orange-400 mb-2">🎯 {t.targetTime}</label>
                    <input
                      type="number"
                      name="targetTime"
                      value={form.targetTime}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-orange-500/50 bg-gray-700 text-white rounded-lg focus:outline-none focus:border-orange-500 transition"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-bold text-orange-400 mb-2">📧 {t.email}</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-4 py-3 border-2 border-orange-500/50 bg-gray-700 text-white rounded-lg focus:outline-none focus:border-orange-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-orange-400 mb-2">🔒 {t.password}</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••"
                className="w-full px-4 py-3 border-2 border-orange-500/50 bg-gray-700 text-white rounded-lg focus:outline-none focus:border-orange-500 transition"
              />
            </div>

            {isSignup && (
              <div>
                <label className="block text-sm font-bold text-orange-400 mb-2">🔐 {t.confirmPassword}</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••"
                  className="w-full px-4 py-3 border-2 border-orange-500/50 bg-gray-700 text-white rounded-lg focus:outline-none focus:border-orange-500 transition"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-black py-4 rounded-lg transition transform hover:scale-105 disabled:opacity-50 mt-6 text-lg"
            >
              {loading ? '⏳ ' + t.loading : isSignup ? '🚀 ' + t.signup : '💪 ' + t.login}
            </button>
          </form>

          {/* Toggle */}
          <div className="mt-8 text-center">
            <button
              onClick={() => setIsSignup(!isSignup)}
              className="text-orange-400 hover:text-orange-300 font-bold text-lg transition"
            >
              {isSignup
                ? language === 'fr'
                  ? '✅ Vous avez déjà un compte ?'
                  : '✅ Already have an account?'
                : language === 'fr'
                ? '🆕 Créer un compte maintenant'
                : '🆕 Create an account now'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-400 text-sm mt-6">
          🔥 Dominez le Hyrox 🔥
        </p>
      </div>
    </div>
  );
}
