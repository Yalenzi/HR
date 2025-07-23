import { useState } from 'react';
import Link from 'next/link';
import LetterForm from '../components/LetterForm';
import LetterPreview from '../components/LetterPreview';

export default function Home() {
  const [letterData, setLetterData] = useState(null);
  const [letterType, setLetterType] = useState('');

  const letterTypes = [
    { id: 'certificate', name: 'شهادة عمل', icon: '📄' },
    { id: 'clearance', name: 'إخلاء طرف', icon: '✅' },
    { id: 'salary', name: 'شهادة راتب', icon: '💰' },
    { id: 'witness', name: 'مشهد موظف', icon: '👤' },
    { id: 'congratulations', name: 'قالب التهنئة', icon: '🎉' },
    { id: 'experience', name: 'شهادة خبرة', icon: '🏆' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <header className="bg-green-600 text-white p-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold">نظام خطابات الموظفين</h1>
            <p className="mt-2">وزارة الصحة - المملكة العربية السعودية</p>
          </div>
          <div className="flex space-x-4 space-x-reverse">
            <Link
              href="/witness"
              className="bg-green-700 hover:bg-green-800 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 space-x-reverse"
            >
              <span>👤</span>
              <span>مشهد موظف</span>
            </Link>
            <Link
              href="/congratulations"
              className="bg-green-700 hover:bg-green-800 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 space-x-reverse"
            >
              <span>🎉</span>
              <span>قوالب التهنئة</span>
            </Link>
            <Link
              href="/admin/dashboard"
              className="bg-green-700 hover:bg-green-800 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 space-x-reverse"
            >
              <span>⚙️</span>
              <span>لوحة التحكم</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6">
        {!letterType ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            {letterTypes.map(type => (
              <div
                key={type.id}
                onClick={() => setLetterType(type.id)}
                className="bg-white p-6 rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition-shadow text-center"
              >
                <div className="text-4xl mb-4">{type.icon}</div>
                <h3 className="text-xl font-semibold text-gray-800">{type.name}</h3>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8">
            <LetterForm 
              letterType={letterType}
              onDataChange={setLetterData}
              onBack={() => setLetterType('')}
            />
            {letterData && (
              <LetterPreview 
                letterType={letterType}
                data={letterData}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}