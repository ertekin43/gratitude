# Şükür Günlüğü — Geliştirme Takibi

## Bu turda tamamlananlar

- [x] Android odaklı yerel şükür günlüğü ve 1001 karakter metin desteği.
- [x] Günlük hedefi Ayarlar’a taşındı; varsayılan hedef 5 ve günlük sayfasında yalnızca ilerleme barı gösteriliyor.
- [x] Hedef aşımında hedef çizgisi ve daha koyu aşım bölümü gösteriliyor.
- [x] Bulut yedeği Profil’den Ayarlar’a taşındı; hesap OAuth/Google giriş butonu Ayarlar’da.
- [x] Profilde ad, e-posta ve avatar gösterimi korunuyor.
- [x] Mini çalar büyütüldü; durdurma atmosferi de durduruyor, kapatma mini çaları gizliyor.
- [x] Hızlı geçişlerde bildirim yığılması engellendi; güncel şükran bildirimi tutuluyor.
- [x] Arka planda TTS geçişinde zamanlayıcıya takılmayan ilerleme akışı eklendi.
- [x] Spotify benzeri tam ekran oynatıcı; küçük metin ve yumuşak hareketli dekoratif motifler.
- [x] Hızlı şükran modalı Android klavyesinin üzerinde açılıyor.
- [x] Geçmişte arama, arama sonuçlarını tümüyle dinleme ve büyütülmüş rastgele dinleme kartı.
- [x] Günler ayrı detay sayfalarında açılıyor; popup düzenleme ve silme işlemleri mevcut.

## Bilinen platform notları

- [ ] Android Expo Speech callback’leri işletim sistemi tarafından askıya alınırsa TTS’in arka planda kesintisiz sürmesi Expo managed katmanının sınırına takılabilir; geçiş mantığı bu durumda bir sonraki maddede doğrudan devam etmeyi deniyor.
- [ ] Atmosfer müziği cihazda yerel kalır; bulut yedeğine ses dosyası dahil edilmez.
- [ ] Android bildirimde çalan şükranın başlığı ve metni gösterilir; gerçek Spotify medya butonları için native medya oturumu gerekir.

## Doğrulama

- [x] `pnpm test` — 7 test başarılı, 1 auth testi atlandı.
- [x] `pnpm check` — TypeScript hatası yok.
- [x] `pnpm lint` — hata yok; yalnızca paket modül tipi uyarısı var.
- [ ] Güncel EAS Android APK derlemesi ve indirme bağlantısı.
