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
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-orange-500 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-right mb-4">
          <button
            onClick={toggleLanguage}
            className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-gray-100 font-semibold"
          >
            {language === 'fr' ? 'EN' : 'FR'}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-blue-600 mb-2">{t.appTitle}</h1>
            <p className="text-gray-600">{t.tagline}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t.profile}</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="John Athlete"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t.hyroxCategory}</label>
                    <select
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option>Open</option>
                      <option>Doubles</option>
                      <option>Elite</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t.age}</label>
                    <input
                      type="number"
                      name="age"
                      value={form.age}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t.gender}</label>
                    <select
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="male">{t.male}</option>
                      <option value="female">{t.female}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t.targetTime}</label>
                    <input
                      type="number"
                      name="targetTime"
                      value={form.targetTime}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{t.email}</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{t.password}</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {isSignup && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t.confirmPassword}</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-orange-500 text-white font-bold py-3 rounded-lg hover:shadow-lg transition disabled:opacity-50"
            >
              {loading ? t.loading : isSignup ? t.signup : t.login}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignup(!isSignup)}
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              {isSignup ? 'Vous avez déjà un compte ?' : 'Inscrivez-vous maintenant'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}