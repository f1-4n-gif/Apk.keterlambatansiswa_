import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  QrCode, 
  Users, 
  FileText, 
  Printer, 
  UserPlus, 
  Search, 
  CheckCircle2, 
  XCircle,
  Clock,
  Trash2,
  Camera,
  Lock,
  User,
  LogIn,
  Download,
  FileSpreadsheet,
  CalendarDays,
  Calendar,
  AlertTriangle,
  LogOut,
  ChevronDown
} from 'lucide-react';

// Data Awal (Mock Data)
const initialStudents = [
  { nisn: "11223344", name: "Andi Wijaya", kelas: "7 A" },
  { nisn: "55667788", name: "Budi Santoso", kelas: "8 B" },
  { nisn: "99001122", name: "Citra Kirana", kelas: "9 C" },
];

const initialRecords = [
  { id: 1, nisn: "11223344", date: "2026-04-25", time: "07:15" },
  { id: 2, nisn: "11223344", date: "2026-04-26", time: "07:20" },
  { id: 3, nisn: "55667788", date: "2026-04-27", time: "07:10" },
  { id: 4, nisn: "11223344", date: "2026-04-28", time: "07:12" }, 
  { id: 5, nisn: "11223344", date: "2026-04-29", time: "07:05" }, 
];

// Komponen Logo Sekolah
function SchoolLogo({ className, fallbackIcon: FallbackIcon }) {
  const [error, setError] = useState(false);
  
  if (error) {
     return <FallbackIcon className={className} />;
  }
  
  return (
    <img 
      src="https://i.ibb.co/TDbjTCHF/logo.png" 
      alt="Logo Sekolah" 
      className={`object-contain bg-white rounded-full ${className}`} 
      onError={() => setError(true)} 
    />
  );
}

export default function App() {
  const [students, setStudents] = useState(initialStudents);
  const [records, setRecords] = useState(initialRecords);
  const [activeTab, setActiveTab] = useState('scan');
  const [toast, setToast] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Fungsi untuk menampilkan pesan (Toast)
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Tampilkan Halaman Login jika belum masuk
  if (!isLoggedIn) {
    return <LoginView onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800">
      {/* Sidebar - Disembunyikan saat di-print */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col print:hidden">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-xl font-bold flex items-center gap-3">
            <SchoolLogo className="w-8 h-8 p-0.5" fallbackIcon={Clock} />
            E-Terlambat
          </h1>
          <p className="text-slate-400 text-sm mt-1">Sistem Disiplin Siswa</p>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-2">
          <button 
            onClick={() => setActiveTab('scan')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'scan' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
          >
            <QrCode className="w-5 h-5" />
            Scan Barcode
          </button>
          <button 
            onClick={() => setActiveTab('records')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'records' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
          >
            <FileText className="w-5 h-5" />
            Rekapan Data
          </button>
          <button 
            onClick={() => setActiveTab('students')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'students' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
          >
            <Users className="w-5 h-5" />
            Data Siswa
          </button>

          {/* Tombol Keluar / Logout */}
          <div className="mt-auto pt-4 border-t border-slate-800">
            <button 
              onClick={() => {
                if(window.confirm('Apakah Anda yakin ingin keluar dari sistem?')) {
                  setIsLoggedIn(false);
                  setActiveTab('scan');
                }
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-red-400 hover:bg-red-500/10 hover:text-red-300"
            >
              <LogOut className="w-5 h-5" />
              Keluar Sistem
            </button>
          </div>
        </nav>
        <div className="p-4 text-xs text-slate-500 text-center border-t border-slate-800">
          Versi 1.0.1
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 print:p-0 print:bg-white overflow-y-auto">
        {activeTab === 'scan' && (
          <ScanView 
            students={students} 
            addRecord={(nisn) => {
              const today = new Date().toISOString().split('T')[0];
              // Pengecekan apakah NISN ini sudah discan di tanggal yang sama (hari ini)
              const isDuplicate = records.some(r => r.nisn === nisn && r.date === today);
              
              if (isDuplicate) {
                showToast('Gagal: Siswa sudah tercatat terlambat hari ini!', 'error');
                return false; 
              }

              const newRecord = {
                id: Date.now(),
                nisn,
                date: today,
                time: new Date().toTimeString().split(' ')[0].substring(0, 5)
              };
              setRecords([newRecord, ...records]);
              showToast('Data keterlambatan berhasil dicatat!');
              return true; 
            }}
            showToast={showToast}
          />
        )}
        
        {activeTab === 'records' && (
          <RecordsView 
            records={records} 
            students={students} 
            setRecords={setRecords}
          />
        )}

        {activeTab === 'students' && (
          <StudentsView 
            students={students} 
            setStudents={setStudents}
            showToast={showToast}
          />
        )}
      </main>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 right-4 print:hidden animate-fade-in-up z-50">
          <div className={`flex items-center gap-2 px-6 py-3 rounded-lg shadow-lg text-white ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
            {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// VIEW: LOGIN
// ==========================================
function LoginView({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'piket' && password === 'admin123') {
      onLogin();
    } else {
      setError('Username atau password salah!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-slate-900 p-10 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <div className="relative z-10">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-900/50 p-1">
              <SchoolLogo className="w-full h-full object-cover" fallbackIcon={Lock} />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Login Portal</h1>
            <p className="text-blue-200 text-sm font-medium">Kordinator Piket & Kedisiplinan</p>
          </div>
        </div>
        <div className="p-8">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6 flex items-center gap-3 border border-red-100 animate-fade-in-up">
              <XCircle className="w-5 h-5 shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Username</label>
              <div className="relative">
                <User className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium"
                  placeholder="Masukkan username..."
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium"
                  placeholder="Masukkan password..."
                  required
                />
              </div>
            </div>
            <button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 mt-4"
            >
              <LogIn className="w-6 h-6" />
              Masuk Sistem
            </button>
          </form>
          <div className="mt-8 text-center text-sm text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <p className="font-medium text-slate-700 mb-1">Informasi Login Default:</p>
            <p>Username: <code className="bg-slate-200 px-2 py-0.5 rounded text-slate-800">piket</code></p>
            <p>Password: <code className="bg-slate-200 px-2 py-0.5 rounded text-slate-800">admin123</code></p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// VIEW: SCAN BARCODE (DI-PERBAIKI)
// ==========================================
function ScanView({ students, addRecord, showToast }) {
  const [inputValue, setInputValue] = useState('');
  const [lastScanned, setLastScanned] = useState(null);
  const inputRef = useRef(null);
  const [useCamera, setUseCamera] = useState(false);
  const scannerRef = useRef(null);
  
  // Menggunakan ref untuk handleScan agar useEffect scanner tidak perlu di-trigger ulang terus menerus
  const handleScanRef = useRef();

  const handleScan = (nisn) => {
    const student = students.find(s => s.nisn === nisn);
    if (student) {
      const isSuccess = addRecord(nisn);
      if (isSuccess) {
        setLastScanned(student);
      } else {
        setLastScanned(null);
      }
      setInputValue(''); 
    } else {
      showToast(`Siswa dengan NISN ${nisn} tidak ditemukan!`, 'error');
      setLastScanned(null);
      setInputValue('');
    }
  };

  useEffect(() => {
    handleScanRef.current = handleScan;
  });

  // Fokuskan input otomatis untuk barcode scanner gun
  useEffect(() => {
    if (inputRef.current && !useCamera) {
      inputRef.current.focus();
    }
  }, [useCamera, lastScanned]);

  // Load html5-qrcode script & init scanner dengan penanganan error/cleanup yang aman
  useEffect(() => {
    const initScanner = () => {
      // Pastikan elemen div reader tersedia
      if (!document.getElementById("reader")) return;
      
      try {
        const scanner = new window.Html5QrcodeScanner(
          "reader",
          { fps: 10, qrbox: {width: 250, height: 250} },
          false
        );
        
        scanner.render(
          (decodedText) => {
            if (handleScanRef.current) handleScanRef.current(decodedText);
          }, 
          (error) => {
            // Error berulang dari kamera biasa diabaikan agar tidak memenuhi console
          }
        );
        scannerRef.current = scanner;
      } catch (err) {
        console.error("Gagal menginisiasi kamera scanner:", err);
      }
    };

    if (useCamera) {
      if (!window.Html5QrcodeScanner) {
        const script = document.createElement('script');
        script.src = "https://unpkg.com/html5-qrcode";
        script.async = true;
        script.onload = initScanner;
        document.body.appendChild(script);
      } else {
        initScanner();
      }
    }

    // CLEANUP PENTING: Mencegah error saat pindah tab (unmount komponen)
    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.clear().catch(e => console.warn("Pembersihan kamera dibatalkan", e));
        } catch (e) {
          console.warn("Pembersihan kamera dibatalkan", e);
        }
        scannerRef.current = null;
      }
    };
  }, [useCamera]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim() === '') return;
    if (handleScanRef.current) handleScanRef.current(inputValue.trim());
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Pindai NISN</h2>
          <p className="text-slate-500 mt-2">Catat keterlambatan menggunakan Scanner USB atau Kamera.</p>
        </div>
        <button 
          onClick={() => setUseCamera(!useCamera)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
        >
          {useCamera ? <QrCode className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
          {useCamera ? "Gunakan Scanner USB" : "Gunakan Kamera"}
        </button>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 mb-8">
        {useCamera ? (
          <div className="flex flex-col items-center">
            <div id="reader" className="w-full max-w-md overflow-hidden rounded-xl border-2 border-dashed border-blue-300"></div>
            <p className="mt-4 text-sm text-slate-500">Arahkan barcode/QR code ke kamera</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="relative">
            <div className="flex flex-col gap-4">
              <label htmlFor="scanner" className="text-sm font-semibold text-slate-600">
                Input NISN / Scan dengan Barcode Gun
              </label>
              <input
                ref={inputRef}
                type="text"
                id="scanner"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Arahkan kursor kesini, lalu scan barcode..."
                className="w-full text-2xl p-4 bg-slate-50 border-2 border-slate-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                autoFocus
                autoComplete="off"
              />
              <button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition-colors shadow-sm"
              >
                Catat Keterlambatan
              </button>
            </div>
          </form>
        )}
      </div>

      {lastScanned && (
        <div className="bg-green-50 border border-green-200 p-6 rounded-2xl flex items-center gap-6 animate-fade-in-up">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-green-800 font-bold text-xl mb-1">Berhasil Dicatat!</h3>
            <p className="text-green-700 text-lg">
              <span className="font-semibold">{lastScanned.name}</span> ({lastScanned.kelas}) 
            </p>
            <p className="text-green-600 text-sm mt-1">NISN: {lastScanned.nisn} | Waktu: {new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// VIEW: RECORDS & PRINTING
// ==========================================
function RecordsView({ records, students, setRecords }) {
  const [reportTab, setReportTab] = useState('bulanan'); 
  const [showPrintMenu, setShowPrintMenu] = useState(false);
  
  const [filterDate, setFilterDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedDailyDate, setSelectedDailyDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  const enrichedRecords = useMemo(() => {
    return records.map(record => {
      const student = students.find(s => s.nisn === record.nisn) || { name: 'Siswa Tidak Dikenal', kelas: '-' };
      return { ...record, ...student };
    });
  }, [records, students]);

  const filteredRecords = useMemo(() => {
    return enrichedRecords.filter(r => {
      const matchDate = filterDate ? r.date === filterDate : true;
      const matchSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) || r.nisn.includes(searchTerm);
      return matchDate && matchSearch;
    });
  }, [enrichedRecords, filterDate, searchTerm]);

  const summaryRecordsAllTime = useMemo(() => {
    const summary = {};
    filteredRecords.forEach(r => {
      if (!summary[r.nisn]) summary[r.nisn] = { nisn: r.nisn, name: r.name, kelas: r.kelas, total: 0 };
      summary[r.nisn].total += 1;
    });
    return Object.values(summary).sort((a, b) => b.total - a.total);
  }, [filteredRecords]);

  const dailyRecords = useMemo(() => {
    return enrichedRecords.filter(r => r.date === selectedDailyDate);
  }, [enrichedRecords, selectedDailyDate]);

  const monthlySummary = useMemo(() => {
    const summary = {};
    enrichedRecords.forEach(r => {
      if (r.date.startsWith(selectedMonth)) {
        if (!summary[r.nisn]) summary[r.nisn] = { nisn: r.nisn, name: r.name, kelas: r.kelas, total: 0 };
        summary[r.nisn].total += 1;
      }
    });
    return Object.values(summary).sort((a, b) => b.total - a.total);
  }, [enrichedRecords, selectedMonth]);

  const handleDelete = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      setRecords(records.filter(r => r.id !== id));
    }
  };

  const handlePrint = (type) => {
    setReportTab(type);
    setShowPrintMenu(false);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-8 print:hidden">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Rekapan Keterlambatan</h2>
          <p className="text-slate-500 mt-2">Pilih mode rekapan harian, bulanan, atau riwayat lengkap.</p>
        </div>
        
        <div className="relative print:hidden">
          <button 
            onClick={() => setShowPrintMenu(!showPrintMenu)}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Printer className="w-5 h-5" />
            Cetak PDF
            <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${showPrintMenu ? 'rotate-180' : ''}`} />
          </button>

          {showPrintMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden z-10 animate-fade-in-up">
              <button 
                onClick={() => handlePrint('harian')}
                className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50 flex items-center gap-3 text-slate-700 border-b border-slate-100 transition-colors"
              >
                <CalendarDays className="w-4 h-4 text-blue-600" />
                Cetak Rekap Harian
              </button>
              <button 
                onClick={() => handlePrint('bulanan')}
                className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50 flex items-center gap-3 text-slate-700 transition-colors"
              >
                <Calendar className="w-4 h-4 text-blue-600" />
                Cetak Rekap Bulanan
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 border-b border-slate-200 mb-6 print:hidden overflow-x-auto">
        <button 
          onClick={() => setReportTab('harian')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${reportTab === 'harian' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
        >
          <CalendarDays className="w-4 h-4" />
          Rekapan Harian
        </button>
        <button 
          onClick={() => setReportTab('bulanan')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${reportTab === 'bulanan' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
        >
          <Calendar className="w-4 h-4" />
          Rekapan Bulanan & Tindak Lanjut
        </button>
        <button 
          onClick={() => setReportTab('riwayat')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${reportTab === 'riwayat' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
        >
          <FileText className="w-4 h-4" />
          Riwayat Lengkap
        </button>
      </div>

      <div className="hidden print:flex flex-col items-center mb-8 border-b-2 border-black pb-6 relative">
        <div className="absolute left-0 top-0">
          <SchoolLogo className="w-20 h-20" fallbackIcon={Clock} />
        </div>
        <h1 className="text-2xl font-bold uppercase mt-2">
          {reportTab === 'harian' ? 'Laporan Harian Keterlambatan Siswa' : 
           reportTab === 'bulanan' ? 'Laporan Bulanan & Tindak Lanjut Keterlambatan' : 
           'Riwayat Keterlambatan Siswa'}
        </h1>
        <p className="text-lg">Tahun Ajaran 2025/2026</p>
        <p className="text-sm mt-2">
          Tanggal Cetak: {new Date().toLocaleDateString('id-ID')} | 
          Periode: {reportTab === 'harian' ? new Date(selectedDailyDate).toLocaleDateString('id-ID') : 
                    reportTab === 'bulanan' ? selectedMonth : 'Semua Waktu'}
        </p>
      </div>

      {reportTab === 'harian' && (
        <div className="animate-fade-in-up">
          <div className="flex items-center gap-4 mb-6 print:hidden bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <label className="font-medium text-slate-700">Pilih Tanggal:</label>
            <input 
              type="date" 
              value={selectedDailyDate}
              onChange={(e) => setSelectedDailyDate(e.target.value)}
              className="border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <div className="ml-auto bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-bold text-sm border border-blue-100">
              Total Terlambat: {dailyRecords.length} Siswa
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden print:border-none print:shadow-none">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm print:bg-slate-100 print:text-black">
                  <th className="py-3 px-6 border-b border-slate-200 w-16">No</th>
                  <th className="py-3 px-6 border-b border-slate-200">Waktu Scan</th>
                  <th className="py-3 px-6 border-b border-slate-200">NISN</th>
                  <th className="py-3 px-6 border-b border-slate-200">Nama Siswa</th>
                  <th className="py-3 px-6 border-b border-slate-200">Kelas</th>
                </tr>
              </thead>
              <tbody>
                {dailyRecords.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-slate-500">Tidak ada data keterlambatan di tanggal ini.</td>
                  </tr>
                ) : (
                  dailyRecords.map((record, index) => (
                    <tr key={record.id} className="hover:bg-slate-50 border-b border-slate-100 print:border-slate-300">
                      <td className="py-3 px-6 text-sm">{index + 1}</td>
                      <td className="py-3 px-6 text-sm font-medium text-red-600">{record.time}</td>
                      <td className="py-3 px-6 text-sm">{record.nisn}</td>
                      <td className="py-3 px-6 text-sm font-medium text-slate-800">{record.name}</td>
                      <td className="py-3 px-6 text-sm">{record.kelas}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {reportTab === 'bulanan' && (
        <div className="animate-fade-in-up">
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-6 print:hidden bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <label className="font-medium text-slate-700 whitespace-nowrap">Pilih Bulan & Tahun:</label>
            <input 
              type="month" 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none w-full sm:w-auto"
            />
            <div className="sm:ml-auto w-full sm:w-auto flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-lg font-bold text-sm border border-red-100">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              Siswa Kritis (≥ 4x): {monthlySummary.filter(s => s.total >= 4).length}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden print:border-none print:shadow-none">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm print:bg-slate-100 print:text-black">
                  <th className="py-3 px-6 border-b border-slate-200 w-16">No</th>
                  <th className="py-3 px-6 border-b border-slate-200">NISN</th>
                  <th className="py-3 px-6 border-b border-slate-200">Nama Siswa</th>
                  <th className="py-3 px-6 border-b border-slate-200">Kelas</th>
                  <th className="py-3 px-6 border-b border-slate-200 text-center">Jumlah Keterlambatan</th>
                  <th className="py-3 px-6 border-b border-slate-200">Tindak Lanjut</th>
                </tr>
              </thead>
              <tbody>
                {monthlySummary.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-500">Tidak ada data keterlambatan di bulan ini.</td>
                  </tr>
                ) : (
                  monthlySummary.map((item, index) => {
                    const isCritical = item.total >= 4;
                    return (
                      <tr key={item.nisn} className={`border-b border-slate-100 print:border-slate-300 ${isCritical ? 'bg-red-50/50 hover:bg-red-50' : 'hover:bg-slate-50'}`}>
                        <td className="py-3 px-6 text-sm">{index + 1}</td>
                        <td className="py-3 px-6 text-sm">{item.nisn}</td>
                        <td className="py-3 px-6 text-sm font-medium text-slate-800">{item.name}</td>
                        <td className="py-3 px-6 text-sm">{item.kelas}</td>
                        <td className="py-3 px-6 text-center">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${isCritical ? 'bg-red-200 text-red-800' : 'bg-slate-200 text-slate-700'}`}>
                            {item.total} Kali
                          </span>
                        </td>
                        <td className="py-3 px-6 text-sm font-medium">
                          {isCritical ? (
                            <span className="flex items-center gap-1.5 text-red-600 print:text-black">
                              <AlertTriangle className="w-4 h-4 print:hidden" />
                              Panggilan Orang Tua / SP 1
                            </span>
                          ) : (
                            <span className="text-green-600 flex items-center gap-1.5 print:text-black">
                              <CheckCircle2 className="w-4 h-4 print:hidden" />
                              Batas Aman
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {reportTab === 'riwayat' && (
        <div className="animate-fade-in-up">
          <div className="flex gap-4 mb-6 print:hidden">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Cari nama atau NISN..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <input 
              type="date" 
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            {filterDate && (
               <button 
                onClick={() => setFilterDate('')}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
              >
                Reset Tanggal
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden print:col-span-3 print:border-none print:shadow-none">
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 print:bg-white print:p-0 print:mb-4">
                <h3 className="font-semibold text-slate-800">Semua Riwayat Scan</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-sm print:bg-slate-100">
                      <th className="py-3 px-6 border-b border-slate-200">Tanggal</th>
                      <th className="py-3 px-6 border-b border-slate-200">Waktu</th>
                      <th className="py-3 px-6 border-b border-slate-200">NISN</th>
                      <th className="py-3 px-6 border-b border-slate-200">Nama Siswa</th>
                      <th className="py-3 px-6 border-b border-slate-200">Kelas</th>
                      <th className="py-3 px-6 border-b border-slate-200 print:hidden text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-8 text-center text-slate-500">Belum ada data keterlambatan.</td>
                      </tr>
                    ) : (
                      filteredRecords.map(record => (
                        <tr key={record.id} className="hover:bg-slate-50 border-b border-slate-100">
                          <td className="py-3 px-6 text-sm">{record.date}</td>
                          <td className="py-3 px-6 text-sm font-medium text-red-600">{record.time}</td>
                          <td className="py-3 px-6 text-sm">{record.nisn}</td>
                          <td className="py-3 px-6 text-sm font-medium text-slate-800">{record.name}</td>
                          <td className="py-3 px-6 text-sm">{record.kelas}</td>
                          <td className="py-3 px-6 text-center print:hidden">
                            <button 
                              onClick={() => handleDelete(record.id)}
                              className="text-red-500 hover:text-red-700 p-1 bg-red-50 hover:bg-red-100 rounded"
                              title="Hapus"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden print:col-span-3 print:border-none print:shadow-none print:mt-8">
              <div className="px-6 py-4 border-b border-slate-200 bg-red-50 text-red-800 print:bg-white print:text-black print:p-0 print:mb-4 print:border-b-2">
                <h3 className="font-semibold">Top Akumulasi (Sepanjang Waktu)</h3>
              </div>
              <div className="p-4 print:p-0">
                {summaryRecordsAllTime.length === 0 ? (
                   <p className="text-center text-slate-500 py-4">Data kosong.</p>
                ) : (
                  <ul className="space-y-3">
                    {summaryRecordsAllTime.map((item, index) => (
                      <li key={item.nisn} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg print:border print:border-slate-300">
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${index < 3 ? 'bg-red-100 text-red-600' : 'bg-slate-200 text-slate-600'}`}>
                            {index + 1}
                          </span>
                          <div>
                            <p className="font-semibold text-sm text-slate-800">{item.name}</p>
                            <p className="text-xs text-slate-500">{item.kelas}</p>
                          </div>
                        </div>
                        <div className="text-center">
                          <span className="block text-xl font-bold text-red-600">{item.total}</span>
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider">Kali</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="hidden print:flex justify-end mt-16 mr-8">
        <div className="text-center">
          <p className="mb-16">Mengetahui,<br/>Guru Piket / Kesiswaan</p>
          <p className="font-bold underline">_________________________</p>
          <p className="text-sm mt-1">NIP. </p>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// VIEW: DATA SISWA
// ==========================================
function StudentsView({ students, setStudents, showToast }) {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ nisn: '', name: '', kelas: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef(null);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.nisn.includes(searchTerm) ||
    s.kelas.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if(students.find(s => s.nisn === formData.nisn)) {
      showToast('NISN sudah terdaftar!', 'error');
      return;
    }
    setStudents([...students, formData]);
    showToast('Siswa berhasil ditambahkan!');
    setFormData({ nisn: '', name: '', kelas: '' });
    setIsAdding(false);
  };

  const handleDelete = (nisn) => {
    if (window.confirm('Hapus data siswa ini?')) {
      setStudents(students.filter(s => s.nisn !== nisn));
      showToast('Data siswa dihapus.');
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent = "NISN;Nama Siswa;Kelas\n11223344;Andi Wijaya;7 A\n55667788;Budi Santoso;8 B\n99001122;Citra Kirana;9 C";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "Format_Data_Siswa.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Format berhasil diunduh. Silakan isi dan simpan tetap sebagai .csv');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const rows = text.split('\n');
        const newStudents = [];
        let addedCount = 0;
        let skipCount = 0;

        for (let i = 1; i < rows.length; i++) {
          if (rows[i].trim() === '') continue;
          
          const cols = rows[i].split(/[,;]/);
          if (cols.length >= 3) {
            const nisn = cols[0].trim().replace(/['"]/g, '');
            const name = cols[1].trim().replace(/['"]/g, '');
            const kelas = cols[2].trim().replace(/['"]/g, '');

            if (!students.find(s => s.nisn === nisn) && !newStudents.find(s => s.nisn === nisn)) {
              newStudents.push({ nisn, name, kelas });
              addedCount++;
            } else {
              skipCount++;
            }
          }
        }

        if (addedCount > 0) {
          setStudents(prev => [...prev, ...newStudents]);
          showToast(`Berhasil menambahkan ${addedCount} siswa! (${skipCount} dilewati karena NISN ganda)`);
        } else {
          showToast('Tidak ada data baru yang ditambahkan atau format salah.', 'error');
        }
      } catch (err) {
        showToast('Gagal membaca file. Pastikan formatnya adalah CSV.', 'error');
      }
      e.target.value = null;
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Data Siswa</h2>
          <p className="text-slate-500 mt-2">Kelola database siswa untuk pencocokan barcode.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={handleDownloadTemplate}
            className="flex items-center gap-2 bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm text-sm"
            title="Download Format Excel/CSV"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Format CSV</span>
          </button>
          
          <input 
            type="file" 
            accept=".csv" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm text-sm"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Input Massal
          </button>

          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm text-sm"
          >
            {isAdding ? <XCircle className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            {isAdding ? 'Batal' : 'Tambah Manual'}
          </button>
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8 animate-fade-in-up">
          <h3 className="font-semibold text-lg mb-4">Tambah Siswa Baru</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-slate-600 mb-1">NISN / Barcode</label>
              <input required type="text" value={formData.nisn} onChange={e => setFormData({...formData, nisn: e.target.value})} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Contoh: 11223344" />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Nama Lengkap</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Nama siswa" />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Kelas</label>
              <input required type="text" value={formData.kelas} onChange={e => setFormData({...formData, kelas: e.target.value})} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Contoh: X IPA 1" />
            </div>
          </div>
          <button type="submit" className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
            Simpan Data
          </button>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="relative w-72">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari siswa..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            />
          </div>
          <p className="text-sm text-slate-500 font-medium">Total: {filteredStudents.length} Siswa</p>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white text-slate-500 text-sm">
              <th className="py-3 px-6 border-b border-slate-200">NISN</th>
              <th className="py-3 px-6 border-b border-slate-200">Nama Lengkap</th>
              <th className="py-3 px-6 border-b border-slate-200">Kelas</th>
              <th className="py-3 px-6 border-b border-slate-200 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 ? (
              <tr><td colSpan="4" className="text-center py-6 text-slate-500">Tidak ada data ditemukan.</td></tr>
            ) : (
              filteredStudents.map(student => (
                <tr key={student.nisn} className="hover:bg-slate-50 border-b border-slate-100 last:border-0">
                  <td className="py-3 px-6 text-sm font-mono text-slate-600">{student.nisn}</td>
                  <td className="py-3 px-6 text-sm font-medium text-slate-800">{student.name}</td>
                  <td className="py-3 px-6 text-sm">{student.kelas}</td>
                  <td className="py-3 px-6 text-center">
                    <button onClick={() => handleDelete(student.nisn)} className="text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}