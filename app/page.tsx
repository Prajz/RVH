"use client";
import React, { useState } from "react";
import styles from "./Dashboard.module.css";


type Mandala = {
  name: string;
  hymns: number;
};

interface HymnsByMandala {
  [key: string]: Hymn[];
}

type Hymn = {
  title: string;
  subtitle: string;
};

const mandalas: Mandala[] = [
  { name: "Mandala I", hymns: 191 },
  { name: "Mandala II", hymns: 43 },
  { name: "Mandala III", hymns: 62 },
  { name: "Mandala IV", hymns: 58 },
  { name: "Mandala V", hymns: 87 },
  { name: "Mandala VI", hymns: 75 },
  { name: "Mandala VII", hymns: 104 },
  { name: "Mandala VIII", hymns: 103 },
  { name: "Mandala IX", hymns: 114 },
  { name: "Mandala X", hymns: 191 },
];

const hymnsByMandala: HymnsByMandala = {
  "Mandala I": [
    { title: "Hymn 1: Agni", subtitle: "अग्निमीळे पुरोहितं" },
    { title: "Hymn 2: Vayu", subtitle: "वायवा याहि दर्शते" },
    { title: "Hymn 3: Ashvins", subtitle: "अश्विना यज्वरीरिषो" },
    { title: "Hymn 4: Indra", subtitle: "सुतस्यानुप्रयुच्छन" },
    { title: "Hymn 5: Indra", subtitle: "आ त्वा ति चंद्रमस्मि" },
    { title: "Hymn 6: Maruts", subtitle: "युज्यति क्रनमर्तं" },
    { title: "Hymn 7: Indra", subtitle: "इन्द्रमित्रायो हृद" },
  ],
  "Mandala II": [],
  "Mandala III": [],
  "Mandala IV": [],
  "Mandala V": [],
  "Mandala VI": [],
  "Mandala VII": [],
  "Mandala VIII": [],
  "Mandala IX": [],
  "Mandala X": [],
};

export default function Page() {
  const [selectedMandala, setSelectedMandala] = useState<string | null>(null);
  const [selectedHymnIdx, setSelectedHymnIdx] = useState<number | null>(null);
  const hymns: Hymn[] = selectedMandala ? hymnsByMandala[selectedMandala] || [] : [];

    // Example Sanskrit, transliteration, and translation for demo
    const hymnContent = {
      sanskrit: [
        "ॐ असतो मा सद्गमय ।",
        "तमसो मा ज्योतिर्गमय ।",
        "मृत्योर् मा अमृतं गमय ।",
        "ॐ शान्तिः शान्तिः शान्तिः ॥",
      ],
      transliteration: [
        "Om Asato Ma Sadgamaya",
        "Tamaso Ma Jyotirgamaya",
        "Mrityorma Amritam Gamaya",
        "Om Shanti, Shanti, Shanti",
      ],
      translation: [
        "From falsehood lead me to truth,",
        "From darkness lead me to light,",
        "From death lead me to immortality.",
        "Om peace, peace, peace.",
      ],
    };

    // Show mandala grid if nothing is selected
    const showMandalaGrid = selectedMandala === null && selectedHymnIdx === null;

  return (
    <div className={styles.dashboardWrapper}>
      {/* Center Content */}
      <main className={styles.centerContent}>
        {showMandalaGrid ? (
          <div style={{ width: '100%', maxWidth: 900 }}>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 700, marginBottom: '2rem', textAlign: 'center' }}>Select a Mandala</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '2rem' }}>
              {mandalas.map((mandala, idx) => (
                <div
                  key={mandala.name}
                  style={{
                    background: '#18120d',
                    borderRadius: 18,
                    boxShadow: '0 2px 16px rgba(0,0,0,0.10)',
                    padding: '32px 0 18px 0',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer',
                    border: '2px solid #2c221b',
                  }}
                  onClick={() => setSelectedMandala(mandala.name)}
                >
                  {/* Placeholder for mandala image */}
                  <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#2c221b', marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, color: '#bfae9f' }}>
                    {/* Blank placeholder, you can add an image src here later */}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 6 }}>{mandala.name}</div>
                  <div style={{ color: '#bfae9f', fontSize: 14 }}>{mandala.hymns} hymns</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          selectedMandala !== null && selectedHymnIdx !== null ? (
            <div className={styles.hymnBox}>
              <h1 className={styles.hymnTitle}>{hymns[selectedHymnIdx]?.title || "Select a Hymn"}</h1>
              <div>
                {hymnContent.sanskrit.map((line, i) => (
                  <div key={i} className={styles.sanskrit}>{line}</div>
                ))}
              </div>
              <div className={styles.transliteration}>
                {hymnContent.transliteration.map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </div>
              <div className={styles.translation}>
                {hymnContent.translation.map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </div>
            </div>
          ) : (
            selectedMandala !== null ? (
              <div style={{ textAlign: 'center', color: '#bfae9f', fontSize: 22 }}>Select a Hymn from the right tab</div>
            ) : null
          )
        )}
      </main>

      {/* Right Sidebar: Mandala & Hymn Selection */}
      <aside className={styles.rightSidebar}>
        <div className={styles.mandalaTitle}>Select a Hymn</div>
        <div className={styles.mandalaList}>
          {mandalas.map((mandala) => (
            <div key={mandala.name}>
              <div
                className={
                  selectedMandala === mandala.name
                    ? `${styles.mandalaItem} ${styles.selected}`
                    : styles.mandalaItem
                }
                onClick={() => { setSelectedMandala(mandala.name); setSelectedHymnIdx(null); }}
              >
                {mandala.name} <span className="text-xs" style={{ color: '#bfae9f' }}>{mandala.hymns} hymns</span>
              </div>
              {/* Hymns for selected mandala */}
              {selectedMandala === mandala.name && (
                <div className={styles.hymnList}>
                  {hymns.map((hymn, idx) => (
                    <div
                      key={hymn.title}
                      className={
                        selectedHymnIdx === idx
                          ? `${styles.hymnItem} ${styles.selected}`
                          : styles.hymnItem
                      }
                      onClick={() => setSelectedHymnIdx(idx)}
                    >
                      {hymn.title}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

