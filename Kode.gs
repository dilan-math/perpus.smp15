const SPREADSHEET_ID = "1dvr5gsxQghPgoGliNBUK2vz0f0P_BfqTiI6WxnKqGKI";

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle("Perpustakaan SMPN 15 Banjarbaru")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// GANTI FUNGSI cariBuku DI Kode.gs DENGAN INI
function cariBuku(keyword) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName("Ketersediaan_Buku");
  if (!sheet) return [];
  
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];
  
  // Ambil header untuk mapping kolom secara dinamis (tidak sensitif huruf besar/kecil)
  const headers = values[0].map(h => h.toString().toLowerCase().trim());
  
  const idxKode = headers.indexOf("kode buku");
  const idxJudul = headers.indexOf("judul");
  const idxPengarang = headers.indexOf("pengarang");
  const idxStok = headers.indexOf("total stok");
  const idxPinjam = headers.indexOf("sedang dipinjam");
  const idxTersedia = headers.indexOf("tersedia");
  
  // Default indeks jika nama kolom tidak pas secara spesifik
  const cKode = idxKode !== -1 ? idxKode : 0;
  const cJudul = idxJudul !== -1 ? idxJudul : 1;
  const cPengarang = idxPengarang !== -1 ? idxPengarang : 2;
  const cStok = idxStok !== -1 ? idxStok : 3;
  const cPinjam = idxPinjam !== -1 ? idxPinjam : 4;
  const cTersedia = idxTersedia !== -1 ? idxTersedia : 5;
  
  const hasil = [];
  const searchKey = keyword.toLowerCase();
  
  values.slice(1).forEach(row => {
    const kode = row[cKode] ? row[cKode].toString() : "-";
    const judul = row[cJudul] ? row[cJudul].toString() : "";
    const pengarang = row[cPengarang] ? row[cPengarang].toString() : "-";
    const stok = row[cStok] !== "" ? row[cStok].toString() : "0";
    const pinjam = row[cPinjam] !== "" ? row[cPinjam].toString() : "0";
    const tersedia = row[cTersedia] !== "" ? row[cTersedia].toString() : "0";
    
    // Cari berdasarkan Judul atau Pengarang
    if (judul.toLowerCase().includes(searchKey) || pengarang.toLowerCase().includes(searchKey)) {
      hasil.push({ kode, judul, pengarang, stok, pinjam, tersedia });
    }
  });
  
  return hasil;
}
// 2. FUNGSI TOP KUNJUNGAN & PEMINJAMAN
function getTopData() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // Hitung Top Peminjam dari sheet "Data Peminjam"
  const sheetPinjam = ss.getSheetByName("Data Peminjam");
  let topPeminjam = [];
  
  if (sheetPinjam) {
    const values = sheetPinjam.getDataRange().getValues();
    if (values.length > 1) {
      const namaCounts = {};
      const headers = values[0].map(h => h.toString().toLowerCase());
      const idxNama = headers.indexOf("nama");
      const nCol = idxNama !== -1 ? idxNama : 0; // default kolom pertama
      
      values.slice(1).forEach(row => {
        const nama = row[nCol] ? row[nCol].toString().trim() : "";
        if (nama) {
          namaCounts[nama] = (namaCounts[nama] || 0) + 1;
        }
      });
      
      topPeminjam = Object.keys(namaCounts).map(nama => ({
        nama: nama,
        jumlah: namaCounts[nama]
      }));
      
      // Urutkan dari terbanyak dan ambil top 5
      topPeminjam.sort((a, b) => b.jumlah - a.jumlah);
      topPeminjam = topPeminjam.slice(0, 5);
    }
  }
  
  // Hitung Top Pengunjung Hari Ini dari sheet "Kunjungan" (Opsional/Pendukung)
  const sheetKunjungan = ss.getSheetByName("Kunjungan");
  let totalKunjungan = 0;
  if (sheetKunjungan) {
    totalKunjungan = Math.max(0, sheetKunjungan.getLastRow() - 1);
  }
  
  // Hitung Total Buku dari sheet "Ketersediaan_Buku"
  const sheetBuku = ss.getSheetByName("Ketersediaan_Buku");
  let totalBuku = 0;
  if (sheetBuku) {
    totalBuku = Math.max(0, sheetBuku.getLastRow() - 1);
  }

  return {
    topPeminjam: topPeminjam,
    stats: {
      totalKunjungan: totalKunjungan,
      totalBuku: totalBuku,
      digitalKoleksi: 120 // Data statis/default ebook internal
    }
  };
}