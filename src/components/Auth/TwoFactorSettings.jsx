import React, { useState, useEffect } from 'react';
import { apiCaller } from '../../utils/axiosInstance';
import { toast } from 'sonner';

const TwoFactorSettings = () => {
  const [status, setStatus] = useState(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [backupCodes, setBackupCodes] = useState([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const response = await apiCaller("GET", "/auth/2fa/status");
      setStatus(response.data);
    } catch (error) {
      setError('Nie udało się załadować statusu 2FA');
    }
  };

  const toggle2FA = async (enable, password) => {
    try {
      const response = await apiCaller("POST", "/auth/2fa/toggle", {
        enable,
        password
      });

      if (response.data.success !== false) {
        return { 
          success: true, 
          data: response.data 
        };
      } else {
        return { 
          success: false, 
          error: response.data.message 
        };
      }
    } catch (error) {
      console.error('Toggle 2FA error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || "Błąd podczas zmiany ustawień 2FA" 
      };
    }
  };

  const handleToggle2FA = async (enable) => {
    if (!currentPassword) {
      setError('Wprowadź aktualne hasło');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await toggle2FA(enable, currentPassword);
      
      if (result.success) {
        if (enable && result.data.backupCodes) {
          setBackupCodes(result.data.backupCodes);
          setShowBackupCodes(true);
        }
        
        setSuccess(result.data.message || (enable ? '2FA zostało włączone' : '2FA zostało wyłączone'));
        await loadStatus();
        setCurrentPassword('');
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Błąd podczas zmiany ustawień 2FA');
    } finally {
      setLoading(false);
    }
  };

  const downloadBackupCodes = () => {
    const content = `CM7 Medical - Kody zapasowe 2FA\n\nZapisz te kody w bezpiecznym miejscu:\n\n${backupCodes.join('\n')}\n\nKażdy kod można użyć tylko raz.\nData wygenerowania: ${new Date().toLocaleString('pl-PL')}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cm7-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyBackupCodes = () => {
    const codesText = backupCodes.join('\n');
    navigator.clipboard.writeText(codesText).then(() => {
      setSuccess('Kody zostały skopiowane do schowka');
    });
  };

  if (!status) return <div className="flex justify-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
  </div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">Uwierzytelnianie dwuskładnikowe (2FA)</h3>
      
      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <div className={`flex items-center mb-4 ${status.twoFactorEnabled ? 'text-green-600' : 'text-red-600'}`}>
          <div className={`w-3 h-3 rounded-full mr-3 ${status.twoFactorEnabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="font-semibold">
            Status: {status.twoFactorEnabled ? 'Włączone' : 'Wyłączone'}
          </span>
        </div>
        
        {status.hasPhone && (
          <div className="flex items-center text-gray-700 mb-2">
            <span className="text-xl mr-2">📱</span>
            <span>Telefon: {status.phone}</span>
          </div>
        )}
        
        {!status.hasPhone && (
          <div className="bg-yellow-100 border border-yellow-300 rounded-md p-3 mb-4">
            <div className="flex items-center">
              <span className="text-xl mr-2">⚠️</span>
              <span className="text-yellow-800">Dodaj numer telefonu w profilu aby włączyć 2FA</span>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h4 className="text-lg font-semibold mb-4">Zarządzanie 2FA</h4>
        
        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Wprowadź aktualne hasło
          </label>
          <input
            type="password"
            id="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="Twoje aktualne hasło"
          />
        </div>
        
        <button
          onClick={() => handleToggle2FA(!status.twoFactorEnabled)}
          disabled={loading || !currentPassword || !status.hasPhone}
          className={`px-6 py-3 rounded-md font-semibold transition-colors ${
            status.twoFactorEnabled 
              ? 'bg-red-600 hover:bg-red-700 text-white' 
              : 'bg-green-600 hover:bg-green-700 text-white'
          } disabled:bg-gray-400 disabled:cursor-not-allowed`}
        >
          {loading ? 'Przetwarzanie...' : 
           status.twoFactorEnabled ? 'Wyłącz 2FA' : 'Włącz 2FA'}
        </button>
      </div>

      {/* Backup Codes Modal */}
      {showBackupCodes && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h4 className="text-xl font-bold mb-4 flex items-center">
                <span className="text-2xl mr-2">🔐</span>
                Kody zapasowe 2FA
              </h4>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
                <div className="font-semibold text-yellow-800 mb-2">⚠️ WAŻNE:</div>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Zapisz te kody w bezpiecznym miejscu</li>
                  <li>• Każdy kod można użyć tylko raz</li>
                  <li>• Kody nie będą ponownie wyświetlone</li>
                  <li>• Użyj ich gdy nie masz dostępu do telefonu lub email</li>
                </ul>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-6">
                {backupCodes.map((code, index) => (
                  <div key={index} className="flex items-center bg-gray-50 p-3 rounded-md border">
                    <span className="text-gray-600 font-medium mr-2 min-w-[20px]">{index + 1}.</span>
                    <code className="font-mono text-teal-600 font-bold bg-white px-2 py-1 rounded border">{code}</code>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={downloadBackupCodes} 
                  className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <span className="mr-2">📥</span>
                  Pobierz jako plik
                </button>
                <button 
                  onClick={copyBackupCodes} 
                  className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  <span className="mr-2">📋</span>
                  Kopiuj do schowka
                </button>
                <button 
                  onClick={() => setShowBackupCodes(false)} 
                  className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <span className="mr-2">✅</span>
                  Zapisałem kody bezpiecznie
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Information Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold mb-4">Jak działa 2FA?</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start">
            <span className="text-2xl mr-3">📱</span>
            <div>
              <div className="font-semibold">SMS</div>
              <div className="text-sm text-gray-600">Kod wysyłany na Twój telefon</div>
            </div>
          </div>
          <div className="flex items-start">
            <span className="text-2xl mr-3">📧</span>
            <div>
              <div className="font-semibold">Email</div>
              <div className="text-sm text-gray-600">Alternatywa gdy SMS nie działa</div>
            </div>
          </div>
          <div className="flex items-start">
            <span className="text-2xl mr-3">🔐</span>
            <div>
              <div className="font-semibold">Kody zapasowe</div>
              <div className="text-sm text-gray-600">Jednorazowe kody awaryjne</div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="mt-4 bg-green-50 border border-green-200 rounded-md p-3">
          <p className="text-sm text-green-800">{success}</p>
        </div>
      )}
    </div>
  );
};

export default TwoFactorSettings; 