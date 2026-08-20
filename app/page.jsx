'use client';import React, { useState, useEffect } from 'react';import { initializeApp, getApps, getApp } from 'firebase/app';import {getFirestore,collection,addDoc,getDocs,deleteDoc,doc,updateDoc,serverTimestamp} from 'firebase/firestore';// Config Firebase dari Environment Variables Next.jsconst firebaseConfig = {apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,};// Inisialisasi Firebaseconst app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);const db = getFirestore(app);// Initial Mock Data jika Firebase belum terhubungconst initialMockData = [{id: '1',nik: '3201012304950001',noKK: '3201011210150002',nama: 'Budi Santoso',gender: 'Laki-Laki',tempatLahir: 'Jakarta',tanggalLahir: '1995-04-23',rt: '001',rw: '005',pekerjaan: 'Karyawan Swasta',statusWarga: 'Tetap',telepon: '081234567890',alamat: 'Jl. Merdeka No. 12'},{id: '2',nik: '3201015608980003',noKK: '3201011210150002',nama: 'Siti Aminah',gender: 'Perempuan',tempatLahir: 'Bogor',tanggalLahir: '1998-08-16',rt: '001',rw: '005',pekerjaan: 'Ibu Rumah Tangga',statusWarga: 'Tetap',telepon: '081298765432',alamat: 'Jl. Merdeka No. 12'}];export default function DashboardWarga() {const [wargaList, setWargaList] = useState([]);const [loading, setLoading] = useState(false);const [activeTab, setActiveTab] = useState('list'); // 'list' | 'input' | 'stats'const [searchTerm, setSearchTerm] = useState('');const [filterRT, setFilterRT] = useState('ALL');const [editingId, setEditingId] = useState(null);const [isFirebaseConfigured, setIsFirebaseConfigured] = useState(false);// Form Stateconst [formData, setFormData] = useState({nik: '',noKK: '',nama: '',gender: 'Laki-Laki',tempatLahir: '',tanggalLahir: '',rt: '001',rw: '005',pekerjaan: '',statusWarga: 'Tetap',telepon: '',alamat: ''});// Cek Koneksi Firebase & Load DatauseEffect(() => {const checkAndFetchData = async () => {setLoading(true);if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {setIsFirebaseConfigured(true);try {const querySnapshot = await getDocs(collection(db, 'warga'));const data = querySnapshot.docs.map(doc => ({id: doc.id,...doc.data()}));setWargaList(data);} catch (error) {console.error("Gagal mengambil data Firebase:", error);setWargaList(initialMockData);}} else {// Fallback jika env belum disetsetIsFirebaseConfigured(false);setWargaList(initialMockData);}setLoading(false);};checkAndFetchData();
}, []);const handleInputChange = (e) => {const { name, value } = e.target;setFormData(prev => ({ ...prev, [name]: value }));};const handleSubmit = async (e) => {e.preventDefault();if (!formData.nik || !formData.nama) {alert('NIK dan Nama Wajib Diisi!');return;}setLoading(true);

try {
  if (isFirebaseConfigured) {
    if (editingId) {
      // Update Data di Firestore
      const docRef = doc(db, 'warga', editingId);
      await updateDoc(docRef, { ...formData, updatedAt: serverTimestamp() });
      setWargaList(prev => prev.map(item => item.id === editingId ? { ...formData, id: editingId } : item));
    } else {
      // Tambah Data ke Firestore
      const docRef = await addDoc(collection(db, 'warga'), {
        ...formData,
        createdAt: serverTimestamp()
      });
      setWargaList(prev => [{ ...formData, id: docRef.id }, ...prev]);
    }
  } else {
    // Mock Mode (Local State)
    if (editingId) {
      setWargaList(prev => prev.map(item => item.id === editingId ? { ...formData, id: editingId } : item));
    } else {
      const newEntry = { ...formData, id: Date.now().toString() };
      setWargaList(prev => [newEntry, ...prev]);
    }
  }

  resetForm();
  setActiveTab('list');
  alert(editingId ? 'Data warga berhasil diperbarui!' : 'Data warga berhasil ditambahkan!');
} catch (error) {
  console.error("Error saving document: ", error);
  alert('Terjadi kesalahan saat menyimpan data.');
} finally {
  setLoading(false);
}
};const handleEdit = (warga) => {setFormData(warga);setEditingId(warga.id);setActiveTab('input');};const handleDelete = async (id) => {if (!confirm('Apakah Anda yakin ingin menghapus data warga ini?')) return;setLoading(true);
try {
  if (isFirebaseConfigured) {
    await deleteDoc(doc(db, 'warga', id));
  }
  setWargaList(prev => prev.filter(item => item.id !== id));
  alert('Data warga berhasil dihapus!');
} catch (error) {
  console.error("Error deleting document: ", error);
  alert('Gagal menghapus data.');
} finally {
  setLoading(false);
}
};const resetForm = () => {setFormData({nik: '',noKK: '',nama: '',gender: 'Laki-Laki',tempatLahir: '',tanggalLahir: '',rt: '001',rw: '005',pekerjaan: '',statusWarga: 'Tetap',telepon: '',alamat: ''});setEditingId(null);};// Filter Dataconst filteredWarga = wargaList.filter(item => {const matchesSearch = item.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||item.nik?.includes(searchTerm) ||item.noKK?.includes(searchTerm);const matchesRT = filterRT === 'ALL' || item.rt === filterRT;return matchesSearch && matchesRT;});// Stats Calculationsconst totalWarga = wargaList.length;const totalLaki = wargaList.filter(w => w.gender === 'Laki-Laki').length;const totalPerempuan = wargaList.filter(w => w.gender === 'Perempuan').length;const totalTetap = wargaList.filter(w => w.statusWarga === 'Tetap').length;return ({/* Top Navbar */}RT/RWSistem Pendataan WargaAplikasi Next.js & Firebase Firestore      <div className="flex items-center gap-2">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${isFirebaseConfigured ? 'bg-emerald-500 text-white' : 'bg-amber-400 text-slate-900'}`}>
          <span className={`w-2 h-2 mr-1.5 rounded-full ${isFirebaseConfigured ? 'bg-white animate-pulse' : 'bg-slate-800'}`}></span>
          {isFirebaseConfigured ? 'Firebase Active' : 'Demo Mode (Mock)'}
        </span>
      </div>
    </div>
  </header>

  {/* Main Container */}
  <main className="max-w-7xl mx-auto px-4 py-6">
    
    {/* Metric Cards */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <p className="text-xs text-slate-500 font-semibold uppercase">Total Warga</p>
        <p className="text-2xl font-bold text-slate-800 mt-1">{totalWarga}</p>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <p className="text-xs text-slate-500 font-semibold uppercase">Laki-Laki</p>
        <p className="text-2xl font-bold text-blue-600 mt-1">{totalLaki}</p>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <p className="text-xs text-slate-500 font-semibold uppercase">Perempuan</p>
        <p className="text-2xl font-bold text-pink-600 mt-1">{totalPerempuan}</p>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <p className="text-xs text-slate-500 font-semibold uppercase">Warga Tetap</p>
        <p className="text-2xl font-bold text-emerald-600 mt-1">{totalTetap}</p>
      </div>
    </div>

    {/* Navigation Tabs */}
    <div className="flex border-b border-slate-300 mb-6 bg-white rounded-t-xl px-4 pt-2">
      <button
        onClick={() => { setActiveTab('list'); resetForm(); }}
        className={`py-3 px-5 font-semibold text-sm transition-all border-b-2 ${activeTab === 'list' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
      >
        📋 Daftar Data Warga
      </button>
      <button
        onClick={() => setActiveTab('input')}
        className={`py-3 px-5 font-semibold text-sm transition-all border-b-2 ${activeTab === 'input' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
      >
        {editingId ? '✏️ Edit Data Warga' : '➕ Input Warga Baru'}
      </button>
    </div>

    {/* TAB 1: LIST DATA WARGA */}
    {activeTab === 'list' && (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Filter & Search Bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row gap-3 justify-between items-center">
          <div className="w-full md:w-72">
            <input
              type="text"
              placeholder="Cari Nama, NIK, No. KK..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <label className="text-xs font-semibold text-slate-600">Filter RT:</label>
            <select
              value={filterRT}
              onChange={(e) => setFilterRT(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="ALL">Semua RT</option>
              <option value="001">RT 001</option>
              <option value="002">RT 002</option>
              <option value="003">RT 003</option>
            </select>

            <button
              onClick={() => { resetForm(); setActiveTab('input'); }}
              className="ml-auto bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
            >
              + Tambah
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-100 text-slate-700 uppercase text-xs font-semibold">
              <tr>
                <th className="p-3 border-b">No</th>
                <th className="p-3 border-b">NIK / No. KK</th>
                <th className="p-3 border-b">Nama Lengkap</th>
                <th className="p-3 border-b">L/P</th>
                <th className="p-3 border-b">RT / RW</th>
                <th className="p-3 border-b">Pekerjaan</th>
                <th className="p-3 border-b">Status</th>
                <th className="p-3 border-b text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-slate-500">Memuat data...</td>
                </tr>
              ) : filteredWarga.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-slate-500">Data tidak ditemukan.</td>
                </tr>
              ) : (
                filteredWarga.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    <td className="p-3 text-slate-500">{index + 1}</td>
                    <td className="p-3">
                      <div className="font-mono text-slate-900 font-medium">{item.nik}</div>
                      <div className="font-mono text-xs text-slate-400">KK: {item.noKK || '-'}</div>
                    </td>
                    <td className="p-3 font-semibold text-slate-800">{item.nama}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${item.gender === 'Laki-Laki' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                        {item.gender === 'Laki-Laki' ? 'L' : 'P'}
                      </span>
                    </td>
                    <td className="p-3">RT {item.rt} / RW {item.rw}</td>
                    <td className="p-3 text-slate-600">{item.pekerjaan || '-'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.statusWarga === 'Tetap' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {item.statusWarga}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="px-2 py-1 text-xs bg-amber-500 hover:bg-amber-600 text-white rounded transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    )}

    {/* TAB 2: INPUT & EDIT FORM */}
    {activeTab === 'input' && (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-slate-200">
          {editingId ? 'Edit Data Warga' : 'Form Input Data Warga Baru'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">NIK (Nomor Induk Kependudukan) *</label>
              <input
                type="text"
                name="nik"
                maxLength={16}
                required
                value={formData.nik}
                onChange={handleInputChange}
                placeholder="16 Digit NIK"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">No. Kartu Keluarga (KK)</label>
              <input
                type="text"
                name="noKK"
                maxLength={16}
                value={formData.noKK}
                onChange={handleInputChange}
                placeholder="16 Digit No. KK"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap *</label>
              <input
                type="text"
                name="nama"
                required
                value={formData.nama}
                onChange={handleInputChange}
                placeholder="Nama Sesuai KTP"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Jenis Kelamin</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="Laki-Laki">Laki-Laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tempat Lahir</label>
              <input
                type="text"
                name="tempatLahir"
                value={formData.tempatLahir}
                onChange={handleInputChange}
                placeholder="Kota Lahir"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Lahir</label>
              <input
                type="date"
                name="tanggalLahir"
                value={formData.tanggalLahir}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">RT / RW</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="rt"
                  value={formData.rt}
                  onChange={handleInputChange}
                  placeholder="RT (contoh: 001)"
                  className="w-1/2 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  name="rw"
                  value={formData.rw}
                  onChange={handleInputChange}
                  placeholder="RW (contoh: 005)"
                  className="w-1/2 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Pekerjaan</label>
              <input
                type="text"
                name="pekerjaan"
                value={formData.pekerjaan}
                onChange={handleInputChange}
                placeholder="Pekerjaan Warga"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nomor HP / WhatsApp</label>
              <input
                type="text"
                name="telepon"
                value={formData.telepon}
                onChange={handleInputChange}
                placeholder="08xxxxxxxxxx"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status Tempat Tinggal</label>
              <select
                name="statusWarga"
                value={formData.statusWarga}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="Tetap">Tetap</option>
                <option value="Kontrak/Sewa">Kontrak / Sewa</option>
                <option value="Kos">Kos</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat Lengkap</label>
            <textarea
              name="alamat"
              rows={3}
              value={formData.alamat}
              onChange={handleInputChange}
              placeholder="Nama jalan, nomor rumah, detail alamat..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Tambah Warga'}
            </button>
            <button
              type="button"
              onClick={() => { resetForm(); setActiveTab('list'); }}
              className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-semibold px-6 py-2.5 rounded-lg transition"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    )}
  </main>
</div>
);}