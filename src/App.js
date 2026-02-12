import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [kisiler, setKisiler] = useState(() => {
    try {
      const kayit = localStorage.getItem("kisiler");
      return kayit ? JSON.parse(kayit) : {};
    } catch (e) {
      return {};
    }
  });

  const [isim, setIsim] = useState("");
  const [miktar, setMiktar] = useState("");
  const [seciliKisi, setSeciliKisi] = useState(null);
  const [tip, setTip] = useState("borcAl");
  const [onayKisi, setOnayKisi] = useState(null);
  const [arama, setArama] = useState("");

  const [geceModu, setGeceModu] = useState(() => {
    try {
      const kayit = localStorage.getItem("geceModu");
      return kayit ? JSON.parse(kayit) : false;
    } catch (e) {
      return false;
    }
  });

  const [bildirim, setBildirim] = useState(null);

  const gosterBildirim = (mesaj) => {
    setBildirim(mesaj);
    setTimeout(() => setBildirim(null), 2000);
  };

  // localStorage’a kaydet
  useEffect(() => {
    localStorage.setItem("kisiler", JSON.stringify(kisiler));
  }, [kisiler]);

  useEffect(() => {
    localStorage.setItem("geceModu", JSON.stringify(geceModu));
  }, [geceModu]);

  const kisiEkle = () => {
    if (!isim.trim()) return gosterBildirim("İsim girin!");
    if (!kisiler[isim]) {
      setKisiler({ ...kisiler, [isim]: { toplam: 0, hareketler: [] } });
      gosterBildirim(`${isim} eklendi!`);
    }
    setIsim("");
  };

  const kisiSilOnay = (k) => {
    setOnayKisi(k);
  };

  const onaylaSil = () => {
    if (!onayKisi) return;
    const yeniKisiler = { ...kisiler };
    delete yeniKisiler[onayKisi];
    setKisiler(yeniKisiler);
    if (seciliKisi === onayKisi) setSeciliKisi(null);
    gosterBildirim(`${onayKisi} silindi!`);
    setOnayKisi(null);
  };

  const iptalSil = () => setOnayKisi(null);

  const hareketEkle = () => {
    if (!seciliKisi) return gosterBildirim("Önce bir kişi seçin!");
    if (!miktar) return gosterBildirim("Miktar girin!");
    const miktarSayi = parseFloat(miktar);
    if (isNaN(miktarSayi)) return gosterBildirim("Geçerli bir sayı girin!");

    const now = new Date();
    const tarihSaat = `${String(now.getDate()).padStart(2,"0")}/${String(now.getMonth()+1).padStart(2,"0")}/${now.getFullYear()} ${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;

    const yeniHareketler = [
      ...kisiler[seciliKisi].hareketler,
      { tip, miktar: miktarSayi, tarih: tarihSaat }
    ];

    const yeniToplam = tip === "borcAl"
      ? kisiler[seciliKisi].toplam - miktarSayi
      : kisiler[seciliKisi].toplam + miktarSayi;

    setKisiler({
      ...kisiler,
      [seciliKisi]: { toplam: yeniToplam, hareketler: yeniHareketler }
    });

    gosterBildirim(`${seciliKisi} için hareket eklendi!`);
    setMiktar("");
  };

  return (
    <div className={`App ${geceModu ? "gece-modu" : ""}`}>
      <h1>Akıllı Borç Notu</h1>

      <button
        className="gece-toggle buton-anim"
        onClick={() => setGeceModu(!geceModu)}
      >
        {geceModu ? "☀️ Açık Mod" : "🌙 Gece Modu"}
      </button>

      {bildirim && <div className="bildirim">{bildirim}</div>}

      <div className="form-group">
        <input
          placeholder="Kişi adı"
          value={isim}
          onChange={(e) => setIsim(e.target.value)}
        />
        <button onClick={kisiEkle} className="buton-anim">
          Kişi Ekle
        </button>
      </div>

      <input
        className="arama-input"
        placeholder="Kişi ara..."
        value={arama}
        onChange={(e) => setArama(e.target.value)}
      />

      <h2>Kişiler</h2>
      <ul>
        {Object.keys(kisiler)
          .filter((k) => k.toLowerCase().includes(arama.toLowerCase()))
          .map((k) => (
            <li key={k} className="kisi-card">
              <span
                className="kisi-isim"
                onClick={() =>
                  setSeciliKisi(seciliKisi === k ? null : k)
                }
              >
                {k}
              </span>
              <span
                className={`borc-status ${
                  kisiler[k].toplam > 0
                    ? "alacak"
                    : kisiler[k].toplam < 0
                    ? "borc"
                    : "notr"
                }`}
              >
                {kisiler[k].toplam}₺ —{" "}
                {kisiler[k].toplam > 0
                  ? "Alacağım var"
                  : kisiler[k].toplam < 0
                  ? "Borçluyum"
                  : "Nötr"}
              </span>
              <button
                className="kisi-sil buton-anim"
                onClick={() => kisiSilOnay(k)}
              >
                ×
              </button>
            </li>
          ))}
      </ul>

      {seciliKisi && (
        <div>
          <h3>{seciliKisi} Hareketler</h3>
          <div className="hareket-form">
            <input
              placeholder="Miktar"
              value={miktar}
              onChange={(e) => setMiktar(e.target.value)}
            />
            <select value={tip} onChange={(e) => setTip(e.target.value)}>
              <option value="borcAl">Borç Alındı (+)</option>
              <option value="borcVer">Borç Verildi (-)</option>
            </select>
            <button onClick={hareketEkle} className="buton-anim">
              Ekle
            </button>
          </div>

          <ul>
            {kisiler[seciliKisi].hareketler.map((h, i) => (
              <li key={i} className="hareket-card">
                <span>
                  {h.tip === "borcAl" ? "Borç Alındı: " : "Borç Verildi: "}
                  {h.miktar}₺
                </span>
                <span>{h.tarih}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {onayKisi && (
        <div className="onay-bildirim">
          <p>{onayKisi} isimli kişiyi silmek istediğine emin misin?</p>
          <button className="onay-evet buton-anim" onClick={onaylaSil}>
            ✅ Evet
          </button>
          <button className="onay-hayir buton-anim" onClick={iptalSil}>
            ❌ Hayır
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
