/** Ana sayfa SSS — hem görünen bölüm (FAQSection) hem FAQPage şeması (page.tsx) buradan beslenir. */
export interface FAQ {
  question: string;
  answer: string;
}

export const DEFAULT_FAQS: FAQ[] = [
  { question: 'Kurumsal İngilizce eğitim programları ne kadar sürer?', answer: 'Programlarımız şirketinizin ihtiyaçlarına ve çalışanların başlangıç seviyesine göre genellikle 3 ila 12 ay arasında değişir. Her şirket için ücretsiz seviye tespit değerlendirmesi yaparak en uygun program süresini ve yoğunluğunu birlikte belirliyoruz. Haftada 2–3 ders ile sürdürülebilir ve ölçülebilir ilerleme sağlıyoruz.' },
  { question: 'Eğitmenleriniz kimlerden oluşuyor?', answer: "Eğitmenlerimiz İngilizce öğretiminde deneyimli, iş dünyasını tanıyan profesyonellerdir. Her eğitmen, şirketinizin sektörüne ve çalışanlarınızın seviyesine göre seçilir." },
  { question: 'Şirketimize özel içerik hazırlanıyor mu?', answer: 'Evet, programlarımızın tamamı şirketinizin sektörüne, kullandığı terminolojiye ve çalışanların iş rollerine göre özelleştirilmektedir. Finans, teknoloji, sağlık, üretim, lojistik gibi pek çok sektörde sektör odaklı vaka çalışmaları ve gerçek iş senaryoları kullanıyoruz.' },
  { question: 'Kaç kişilik gruplarla çalışıyorsunuz?', answer: "En etkili öğrenme deneyimi için grup derslerimizi maksimum 6 kişi ile sınırlı tutuyoruz. Bire bir (birebir) özel dersler de sunuyoruz. Çalışan sayısı 20'yi aşan şirketler için seviye grupları oluşturarak hem maliyeti optimize ediyor hem de homojen sınıf yapısını koruyoruz." },
  { question: 'Eğitimin etkisini nasıl ölçüyorsunuz?', answer: 'Her ay detaylı ilerleme raporu sunuyoruz. Çalışanların konuşma akıcılığı, yazılı iletişim, kelime dağarcığı ve iş İngilizcesi kullanımı gibi kriterlerde somut verilerle gelişimini takip ediyoruz. Oxford University Press müfredat kaynaklarıyla uygulanan standart testler aracılığıyla başlangıç ve bitiş seviyeleri karşılaştırmalı olarak raporlanır.' },
  { question: 'Online eğitim yüz yüze eğitim kadar etkili mi?', answer: 'Araştırmalar, yapılandırılmış online dil eğitiminin yüz yüze eğitimle eşdeğer hatta bazı alanlarda daha etkili olduğunu göstermektedir. Çalışanlar istedikleri yerden katılabildiği için devamsızlık oranı düşüyor, öğrenme sürekliliği artıyor. Canlı video derslerimiz, interaktif alıştırmalar ve yapay zeka destekli telaffuz antrenörümüz sayesinde öğrenme daha verimli hale geliyor.' },
  { question: 'İngilizce seviyesi belirleme süreci nasıl işliyor?', answer: "Programa başlamadan önce her çalışan için ücretsiz kapsamlı bir seviye tespit sınavı yapıyoruz. Bu değerlendirme; yazılı, sözlü ve dinleme becerilerini CEFR standartları (A1'den C2'ye) çerçevesinde ölçüyor. Sonuçlara göre çalışanlar uygun seviye grubuna yerleştiriliyor ve kişiselleştirilmiş öğrenme hedefleri belirleniyor." },
  { question: 'Teklif almak ve demo randevusu ayarlamak için ne yapmalıyız?', answer: 'Web sitemizden randevu formumuzu doldurmanız yeterli. 24 saat içinde kurumsal danışmanımız sizi arayarak şirketinizin ihtiyaçlarını dinler ve ücretsiz demo dersi ile birlikte size özel bir teklif hazırlar. Herhangi bir taahhüt gerektirmiyor; deneyip karar verebilirsiniz.' },
];
