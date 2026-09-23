/** Static studio facts (DESIGN.md §9). Values mirror the approved mockups 1:1. */
export type RoomFact = {
  id: number;
  code: 'a' | 'b' | 'c' | 'd';
  name: string;
  size_label: string;
  price_idr: number;
  specs: string;
  status: 'free' | 'booked';
  slotNote: string;
  gearNote: string;
  detailMeta: string;
  acoustic: string;
  monitoring: string;
  gear: string[];
};

export const STUDIO = {
  name: 'Ruang Gema Studio',
  area: 'Kemang, Jakarta Selatan',
  address: 'Jl. Kemang Selatan VIII No. 12, Jakarta Selatan',
  hours: 'Setiap Hari · 09.00 – 23.00 WIB',
  phone: '021-7194-2260',
  phoneHref: '02171942260',
  dpRatio: 0.5,
  holdMinutes: 15,
  rooms: [
    {
      id: 1, code: 'a', name: 'Studio A', size_label: '6 × 5 METER', price_idr: 150000,
      specs: 'Full backline, drum premium, 2 gitar amp tabung, bass rig, 3 vocal mic, AC dingin.',
      status: 'free', slotNote: '19.00 Kosong', gearNote: 'Full backline',
      detailMeta: 'Kapasitas 6–8 Personil · Dimensi 6 × 5 Meter · AC 2 PK',
      acoustic: 'Rockwool 80kg/m³ + double drywall, zero bleed antar studio.',
      monitoring: '2× Active floor wedge 12" + mixer 16 channel AUX independen.',
      gear: [
        'Tama Superstar Hyperdrive 5-piece Drum Kit',
        'Marshall JCM900 Tube Head + 1960A 4×12 Cabinet',
        'Fender Twin Reverb 2×12 Guitar Amp',
        'Ampeg SVT-4PRO + 8×10 Bass Cabinet',
        '3× Shure SM58 Vocal Microphones + Stand',
        'Roland KC-550 Keyboard Amplifier',
      ],
    },
    {
      id: 2, code: 'b', name: 'Studio B', size_label: '5 × 4 METER', price_idr: 120000,
      specs: 'Drum set solid + 2 amplifier gitar & bass, 2 mic vokal, cocok untuk latihan rutin band 4–5 personil.',
      status: 'free', slotNote: '20.00 Kosong', gearNote: 'Drum & bass rig',
      detailMeta: 'Kapasitas 4–5 Personil · Dimensi 5 × 4 Meter · AC 1.5 PK',
      acoustic: 'Rockwool 60kg/m³ + drywall ganda, redam gema untuk latihan rutin.',
      monitoring: '2× Active floor wedge 10" + mixer 12 channel AUX independen.',
      gear: [
        'Pearl Export 5-piece Drum Kit',
        'Marshall DSL40 Guitar Amp Combo',
        'Hartke HD500 Bass Amp + 4×10 Cabinet',
        '2× Shure SM58 Vocal Microphones + Stand',
        'Roland KC-400 Keyboard Amplifier',
      ],
    },
    {
      id: 3, code: 'c', name: 'Studio C', size_label: '4 × 3 METER', price_idr: 90000,
      specs: 'Akustik intim, keyboard stereo, amplifier latihan, pas buat format duet atau jamming santai.',
      status: 'booked', slotNote: '19.00 Terisi', gearNote: 'Akustik & keyboard',
      detailMeta: 'Kapasitas 2–3 Personil · Dimensi 4 × 3 Meter · AC 1 PK',
      acoustic: 'Panel akustik kayu + gorden berat, karakter ruang hangat untuk vokal.',
      monitoring: '2× Studio monitor aktif 8" + mixer 8 channel.',
      gear: [
        'Yamaha Stage Custom Bop Kit',
        'Fender Blues Junior Guitar Amp',
        'Roland KC-220 Keyboard Amplifier',
        '2× Audio-Technica AT2020 Vocal Microphone',
      ],
    },
    {
      id: 4, code: 'd', name: 'Studio D', size_label: '7 × 6 METER', price_idr: 250000,
      specs: 'Recording-ready dengan ruang kontrol terpisah, live tracking multitrack, dan backline panggung besar.',
      status: 'free', slotNote: '21.00 Kosong', gearNote: 'Recording-ready',
      detailMeta: 'Kapasitas 8–10 Personil · Dimensi 7 × 6 Meter · AC 2 PK + ruang kontrol',
      acoustic: 'Rockwool 100kg/m³ + floating floor + diffuser, siap live tracking.',
      monitoring: '4× Active floor wedge 12" + mixer 32 channel + monitor mix terpisah.',
      gear: [
        'DW Performance Series 5-piece Drum Kit',
        'Mesa Boogie Dual Rectifier + 4×12 Cabinet',
        'Fender Deluxe Reverb 1×12 Guitar Amp',
        'Markbass Little Mark + 4×10 Bass Cabinet',
        '4× Shure SM58 + 2× Sennheiser e906',
        'Nord Stage 3 Keyboard + Motion Sound Amp',
      ],
    },
  ] as RoomFact[],
  faq: [
    {
      q: 'Berapa DP yang harus dibayar?',
      a: 'Uang muka sebesar 50% dari total durasi sewa, dibayar online saat slot ditahan. Sisa 50% dilunasi di studio.',
    },
    {
      q: 'Berapa lama slot ditahan sebelum bayar?',
      a: 'Slot ditahan selama 15 menit. Jika dalam 15 menit DP belum dibayar, sistem otomatis membatalkan dan slot kembali dibuka.',
    },
    {
      q: 'Bagaimana jika jadwal bentrok saat memesan?',
      a: 'Jika ada musisi lain yang menahan slot tepat di detik yang sama, sistem langsung menampilkan pesan transparan dan meminta memilih jam terdekat.',
    },
  ],
} as const;
