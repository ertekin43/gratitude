# Şükür Günlüğü — Son Sürüm Takibi

## Tamamlananlar

- [x] Arka planda TTS geçişinde bekleme süresi korunacak şekilde oynatma akışı düzeltildi.
- [x] Tekil Android oynatma bildirimi korunarak bildirim yığılması engellendi.
- [x] Bulut yedeği Ayarlar’dan kaldırıldı; JSON dışarı aktarma ve içeri aktarma eklendi.
- [x] Sayısal Ayarlar alanları büyütüldü ve okunaklı hale getirildi.
- [x] 20 saniyelik altı döngüsel atmosfer preset’i eklendi: orman, şömine, deniz, yağmur, dere ve rüzgar.
- [x] Atmosfer seslerinde önizleme ve seçme düğmeleri eklendi.
- [x] Mahremiyet kilidi Android biyometrik/cihaz kilidi doğrulamasına bağlandı.
- [x] On tema seçeneği ve günlük şükran sıralaması eklendi.
- [x] Günlük ekranındaki gereksiz başlık/özet kaldırıldı; hedef tamamlanınca ikon ve aşım rengi değişiyor.
- [x] Profil düzenleme, fotoğraf seçme, seviye ve son 21 günlük satranç rütbesi eklendi.
- [x] Şah rütbesi 1260 kayıt eşiğine bağlandı; yıllık istatistik görünümü eklendi.
- [x] Geçmiş araması, tüm sonuçları dinleme, ayrı gün detayları, popup düzenleme ve silme mevcut.

## Platform notu

Expo managed Android katmanında gerçek Spotify kilit ekranı medya oturumu ve native medya düğmeleri standart bildirim API’siyle tam olarak sunulamıyor. Uygulama güncel şükran metnini tekil Android bildiriminde göstermeye devam ediyor. Atmosfer sesleri paketli yerel dosyalardır.

## Doğrulama

- [x] `pnpm test` — 9 test başarılı, 1 auth testi atlandı.
- [x] `pnpm check` — TypeScript hatası yok.
- [x] `pnpm lint` — hata yok; yalnızca mevcut paket modül tipi uyarısı var.
- [ ] Checkpoint ve güncel Expo Android APK derlemesi.
