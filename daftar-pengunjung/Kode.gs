const SPREADSHEET_ID = "1dvr5gsxQghPgoGliNBUK2vz0f0P_BfqTiI6WxnKqGKI";

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle("Perpustakaan SMPN 15 Banjarbaru");
}

function getSiswa() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName("DataSiswa");

  const data = sheet.getRange(2,1,sheet.getLastRow()-1,2).getValues();

  return data.map(r => ({
    nama:r[0],
    kelas:r[1]
  }));
}

function simpanKunjungan(data){

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName("Kunjungan");

  sheet.appendRow([
    new Date(),
    data.jenis,
    data.nama,
    data.kelas,
    data.keperluan
  ]);

  return true;
}

function getStatistik(){

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName("Kunjungan");

  const values = sheet.getDataRange().getValues();

  let siswa=0;
  let umum=0;

  const today = Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone(),
    "yyyy-MM-dd"
  );

  values.slice(1).forEach(row=>{

    const tanggal = Utilities.formatDate(
      new Date(row[0]),
      Session.getScriptTimeZone(),
      "yyyy-MM-dd"
    );

    if(tanggal===today){

      if(row[1]==="Siswa") siswa++;
      if(row[1]==="Umum") umum++;

    }

  });

  return {
    siswa,
    umum,
    total:siswa+umum
  };

}
