import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import {
  Ruler,
  Scissors,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  Info,
  Flame,
  Shirt,
  MessageCircle,
  Feather,
} from 'lucide-react';
import styles from './SizeGuide.module.css';

function WhatsAppIcon({ size = 18, color = 'currentColor', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.457h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 00-3.48-8.413z" />
    </svg>
  );
}

export default function SizeGuide() {
  const [activeTab, setActiveTab] = useState('sarees');
  const [unit, setUnit] = useState('in'); // 'in' or 'cm'

  // Blouse & Kurti data (Inches / CM)
  const BLOUSE_SIZES = [
    {
      size: 'XS (34)',
      bustIn: '34"',
      bustCm: '86 cm',
      waistIn: '28"',
      waistCm: '71 cm',
      shoulderIn: '13.5"',
      shoulderCm: '34 cm',
      armholeIn: '14.5"',
      armholeCm: '37 cm',
    },
    {
      size: 'S (36)',
      bustIn: '36"',
      bustCm: '91 cm',
      waistIn: '30"',
      waistCm: '76 cm',
      shoulderIn: '14"',
      shoulderCm: '36 cm',
      armholeIn: '15.5"',
      armholeCm: '39 cm',
    },
    {
      size: 'M (38)',
      bustIn: '38"',
      bustCm: '96 cm',
      waistIn: '32"',
      waistCm: '81 cm',
      shoulderIn: '14.5"',
      shoulderCm: '37 cm',
      armholeIn: '16.5"',
      armholeCm: '42 cm',
    },
    {
      size: 'L (40)',
      bustIn: '40"',
      bustCm: '102 cm',
      waistIn: '34"',
      waistCm: '86 cm',
      shoulderIn: '15"',
      shoulderCm: '38 cm',
      armholeIn: '17.5"',
      armholeCm: '44 cm',
    },
    {
      size: 'XL (42)',
      bustIn: '42"',
      bustCm: '107 cm',
      waistIn: '36"',
      waistCm: '91 cm',
      shoulderIn: '15.5"',
      shoulderCm: '39 cm',
      armholeIn: '18.5"',
      armholeCm: '47 cm',
    },
    {
      size: 'XXL (44)',
      bustIn: '44"',
      bustCm: '112 cm',
      waistIn: '38"',
      waistCm: '96 cm',
      shoulderIn: '16"',
      shoulderCm: '41 cm',
      armholeIn: '19.5"',
      armholeCm: '50 cm',
    },
    {
      size: '3XL (46)',
      bustIn: '46"',
      bustCm: '117 cm',
      waistIn: '40"',
      waistCm: '102 cm',
      shoulderIn: '16.5"',
      shoulderCm: '42 cm',
      armholeIn: '20.5"',
      armholeCm: '52 cm',
    },
  ];

  // Men's Kurta & Dhoti data
  const MEN_SIZES = [
    {
      size: 'S (38)',
      chestIn: '38" - 40"',
      chestCm: '96 - 101 cm',
      waistIn: '32" - 34"',
      waistCm: '81 - 86 cm',
      lengthIn: '38"',
      lengthCm: '96 cm',
      dhotiMatch: '4 Muzham (2.0 m Single)',
    },
    {
      size: 'M (40)',
      chestIn: '40" - 42"',
      chestCm: '101 - 106 cm',
      waistIn: '34" - 36"',
      waistCm: '86 - 91 cm',
      lengthIn: '40"',
      lengthCm: '101 cm',
      dhotiMatch: '4 Muzham / 8 Muzham',
    },
    {
      size: 'L (42)',
      chestIn: '42" - 44"',
      chestCm: '106 - 112 cm',
      waistIn: '36" - 38"',
      waistCm: '91 - 96 cm',
      lengthIn: '41"',
      lengthCm: '104 cm',
      dhotiMatch: '8 Muzham (3.8 m Double)',
    },
    {
      size: 'XL (44)',
      chestIn: '44" - 46"',
      chestCm: '112 - 117 cm',
      waistIn: '38" - 40"',
      waistCm: '96 - 101 cm',
      lengthIn: '42"',
      lengthCm: '107 cm',
      dhotiMatch: '8 Muzham (3.8 m Double)',
    },
    {
      size: 'XXL (46)',
      chestIn: '46" - 48"',
      chestCm: '117 - 122 cm',
      waistIn: '40" - 42"',
      waistCm: '101 - 107 cm',
      lengthIn: '43"',
      lengthCm: '109 cm',
      dhotiMatch: '8 Muzham (3.8 m Double)',
    },
  ];

  // Brass Vilakku Dimensions
  const BRASS_SIZES = [
    {
      type: 'Kamakshi Vilakku (Small)',
      height: '4.5 inches (11.5 cm)',
      baseDiameter: '2.8 inches',
      weight: '380 - 450 grams',
      capacity: '40 ml',
      bestFor: 'Daily Pooja & Home Altar',
    },
    {
      type: 'Kamakshi Vilakku (Medium)',
      height: '6.5 inches (16.5 cm)',
      baseDiameter: '3.6 inches',
      weight: '750 - 900 grams',
      capacity: '85 ml',
      bestFor: 'Grihapravesam & Festival Pooja',
    },
    {
      type: 'Kamakshi Vilakku (Grand)',
      height: '8.5 inches (21.5 cm)',
      baseDiameter: '4.8 inches',
      weight: '1.4 - 1.7 kg',
      capacity: '150 ml',
      bestFor: 'Auspicious Gifting & Temples',
    },
    {
      type: 'Kuthu Vilakku (Pair - 2 ft)',
      height: '24 inches (61 cm)',
      baseDiameter: '6.5 inches',
      weight: '4.5 - 5.2 kg (pair)',
      capacity: '180 ml per lamp (5 wicks)',
      bestFor: 'Living Room & Festive Decor',
    },
    {
      type: 'Kuthu Vilakku (Pair - 3 ft)',
      height: '36 inches (91 cm)',
      baseDiameter: '8.5 inches',
      weight: '9.0 - 10.5 kg (pair)',
      capacity: '320 ml per lamp (5 wicks)',
      bestFor: 'Traditional Wedding & Mandapam',
    },
    {
      type: 'Annam Vilakku (Hanging)',
      height: '14 inches + 3ft Chain',
      baseDiameter: '5.2 inches cup',
      weight: '2.2 - 2.6 kg',
      capacity: '200 ml',
      bestFor: 'Entrance & Foyer Ceiling Hang',
    },
  ];

  return (
    <PageWrapper>
      {/* ══════════════════════════════════════════════════════════════════════
          1. DESKTOP VIEW (> 768px) - 100% UNTOUCHED ORIGINAL LAYOUT
          ══════════════════════════════════════════════════════════════════════ */}
      <div className={styles.desktopView}>
        <div className={styles.pageWrapper}>
          {/* Executive Hero Banner */}
          <section className={styles.hero}>
            <div className={styles.heroContent}>
              <div className={styles.badge}>
                <Ruler size={15} /> Picky Craft Sizing &amp; Measurement Center
              </div>
              <h1 className={styles.title}>
                Find Your <span className={styles.titleHighlight}>Perfect Fit &amp; Dimensions</span>
              </h1>
              <p className={styles.subtitle}>
                Clear, transparent sizing tables for Madurai Sungudi sarees, stitched blouses, traditional dhotis, and solid brass temple crafts.
              </p>
            </div>
          </section>

          {/* Main Content Area */}
          <main className={styles.container}>
            {/* Navigation Bar */}
            <div className={styles.categoryBar}>
              <button
                type="button"
                onClick={() => setActiveTab('sarees')}
                className={`${styles.categoryTab} ${
                  activeTab === 'sarees' ? styles.categoryTabActive : ''
                }`}
              >
                <Sparkles size={17} /> Sarees &amp; Handlooms
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('blouse')}
                className={`${styles.categoryTab} ${
                  activeTab === 'blouse' ? styles.categoryTabActive : ''
                }`}
              >
                <Scissors size={17} /> Blouse &amp; Kurti Chart
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('mens')}
                className={`${styles.categoryTab} ${
                  activeTab === 'mens' ? styles.categoryTabActive : ''
                }`}
              >
                <Shirt size={17} /> Men's Dhoti &amp; Kurta
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('brass')}
                className={`${styles.categoryTab} ${
                  activeTab === 'brass' ? styles.categoryTabActive : ''
                }`}
              >
                <Flame size={17} /> Brass Vilakku &amp; Idols
              </button>
            </div>

            {/* TAB 1: SAREES & HANDLOOMS */}
            {activeTab === 'sarees' && (
              <div className={styles.contentCard}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}>
                    <Sparkles size={22} color="#7c3aed" /> Traditional Handloom Saree Specifications
                  </h2>
                  <p className={styles.cardSubtitle}>
                    Every Picky saree is woven to official handloom standards, offering graceful fall and ample pleats for all heights.
                  </p>
                </div>

                <div className={styles.infoGrid}>
                  <div className={styles.infoBox}>
                    <div className={styles.infoBoxIcon}>
                      <Ruler size={22} />
                    </div>
                    <h3 className={styles.infoBoxTitle}>Total Length: 6.30 Meters</h3>
                    <p className={styles.infoBoxText}>
                      Standard 5.5 meters of seamless saree drape plus 0.8 meter of attached matching unstitched blouse piece in running weave.
                    </p>
                    <span className={styles.infoBoxHighlight}>5.5 m Saree + 0.8 m Blouse</span>
                  </div>

                  <div className={styles.infoBox}>
                    <div className={styles.infoBoxIcon}>
                      <Scissors size={22} />
                    </div>
                    <h3 className={styles.infoBoxTitle}>Saree Width (Panna): 45 - 47 Inches</h3>
                    <p className={styles.infoBoxText}>
                      Full traditional width ensuring comfortable floor-length drape for individuals between 4'10" and 5'10" with standard heels or flat footwear.
                    </p>
                    <span className={styles.infoBoxHighlight}>45 to 47 Inch Width (116 cm)</span>
                  </div>

                  <div className={styles.infoBox}>
                    <div className={styles.infoBoxIcon}>
                      <CheckCircle2 size={22} />
                    </div>
                    <h3 className={styles.infoBoxTitle}>Sungudi Cotton Weight: ~500 Grams</h3>
                    <p className={styles.infoBoxText}>
                      Breathable 100% combed cotton woven with pure zari border. Lightweight, airy, and naturally crisp for South Indian summers.
                    </p>
                    <span className={styles.infoBoxHighlight}>Featherlight ~480 - 520g</span>
                  </div>
                </div>

                {/* Saree Drape Guide */}
                <div style={{ marginTop: '2.5rem' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e1b4b', marginBottom: '1rem' }}>
                    Saree Parts &amp; Measurement Breakdown
                  </h3>
                  <div className={styles.tableContainer}>
                    <table className={styles.sizeTable}>
                      <thead>
                        <tr>
                          <th>Saree Element</th>
                          <th>Standard Dimension</th>
                          <th>Artisan Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td><strong>Main Body (Udal)</strong></td>
                          <td>4.7 Meters</td>
                          <td>Authentic Madurai tie-and-dye knot motifs or zari buttas.</td>
                        </tr>
                        <tr>
                          <td><strong>Pallu (Munthi)</strong></td>
                          <td>0.8 Meter (80 cm)</td>
                          <td>Grand woven temple zari stripes with tassel-ready edge.</td>
                        </tr>
                        <tr>
                          <td><strong>Blouse Piece</strong></td>
                          <td>0.8 Meter (80 cm)</td>
                          <td>Unstitched running fabric with matching zari border for sleeves.</td>
                        </tr>
                        <tr>
                          <td><strong>Zari Border Height</strong></td>
                          <td>2.5 to 5 Inches</td>
                          <td>Traditional Rettai Pettu, Getti Pettu or Temple Ganga-Jamuna borders.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Care advice */}
                <div className={styles.careCard}>
                  <Info size={24} className={styles.careIcon} />
                  <div>
                    <h4 className={styles.careTitle}>Sungudi Cotton &amp; Silk Care Advice</h4>
                    <p className={styles.careText}>
                      For first wash of natural hand-dyed Madurai Sungudi sarees, gentle cold water dip with mild rock salt is recommended to fix the herbal dye. Do not wring or tumble dry; dry in shade to maintain vivid color brilliance.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: BLOUSE & KURTI SIZE CHART */}
            {activeTab === 'blouse' && (
              <div className={styles.contentCard}>
                <div className={styles.cardHeader}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <h2 className={styles.cardTitle}>
                        <Scissors size={22} color="#7c3aed" /> Ready-to-Wear Blouse &amp; Kurti Size Chart
                      </h2>
                      <p className={styles.cardSubtitle}>
                        Measure your body comfortably without pulling the measuring tape too tight.
                      </p>
                    </div>

                    {/* Unit Toggle */}
                    <div className={styles.unitToggle}>
                      <button
                        type="button"
                        onClick={() => setUnit('in')}
                        className={`${styles.unitBtn} ${unit === 'in' ? styles.unitBtnActive : ''}`}
                      >
                        Inches (in)
                      </button>
                      <button
                        type="button"
                        onClick={() => setUnit('cm')}
                        className={`${styles.unitBtn} ${unit === 'cm' ? styles.unitBtnActive : ''}`}
                      >
                        Centimeters (cm)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Data Table */}
                <div className={styles.tableContainer}>
                  <table className={styles.sizeTable}>
                    <thead>
                      <tr>
                        <th>Size Label</th>
                        <th>Bust / Chest</th>
                        <th>Waist (Underbust)</th>
                        <th>Shoulder Width</th>
                        <th>Armhole</th>
                      </tr>
                    </thead>
                    <tbody>
                      {BLOUSE_SIZES.map((row, idx) => (
                        <tr key={idx}>
                          <td>
                            <span className={styles.sizeBadge}>{row.size}</span>
                          </td>
                          <td><strong>{unit === 'in' ? row.bustIn : row.bustCm}</strong></td>
                          <td>{unit === 'in' ? row.waistIn : row.waistCm}</td>
                          <td>{unit === 'in' ? row.shoulderIn : row.shoulderCm}</td>
                          <td>{unit === 'in' ? row.armholeIn : row.armholeCm}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* How to measure step cards */}
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e1b4b', marginBottom: '0.5rem', marginTop: '1.5rem' }}>
                  How to Measure Yourself Accurately
                </h3>
                <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                  For the best fit, wear your regular undergarments and keep the measuring tape level.
                </p>

                <div className={styles.stepsGrid}>
                  <div className={styles.stepCard}>
                    <div className={styles.stepNum}>1</div>
                    <h4 className={styles.stepTitle}>Bust Measurement</h4>
                    <p className={styles.stepDesc}>
                      Wrap the measuring tape across the fullest part of your chest, keeping tape horizontal around shoulder blades.
                    </p>
                  </div>

                  <div className={styles.stepCard}>
                    <div className={styles.stepNum}>2</div>
                    <h4 className={styles.stepTitle}>Waist / Underbust</h4>
                    <p className={styles.stepDesc}>
                      Measure directly below your bust line where the blouse band naturally sits firmly against the ribcage.
                    </p>
                  </div>

                  <div className={styles.stepCard}>
                    <div className={styles.stepNum}>3</div>
                    <h4 className={styles.stepTitle}>Shoulder Width</h4>
                    <p className={styles.stepDesc}>
                      Measure from the outer bone tip of one shoulder across the base of neck to the tip of the other shoulder.
                    </p>
                  </div>

                  <div className={styles.stepCard}>
                    <div className={styles.stepNum}>4</div>
                    <h4 className={styles.stepTitle}>Armhole Circumference</h4>
                    <p className={styles.stepDesc}>
                      Place tape at top of shoulder and wrap down under the armpit and back up with 1 finger allowance for movement.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: MEN'S DHOTI & KURTA */}
            {activeTab === 'mens' && (
              <div className={styles.contentCard}>
                <div className={styles.cardHeader}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <h2 className={styles.cardTitle}>
                        <Shirt size={22} color="#7c3aed" /> Men's Traditional Wear &amp; Dhoti Specifications
                      </h2>
                      <p className={styles.cardSubtitle}>
                        Authentic South Indian Muzham sizing and regular cotton kurta measurement chart.
                      </p>
                    </div>

                    <div className={styles.unitToggle}>
                      <button
                        type="button"
                        onClick={() => setUnit('in')}
                        className={`${styles.unitBtn} ${unit === 'in' ? styles.unitBtnActive : ''}`}
                      >
                        Inches (in)
                      </button>
                      <button
                        type="button"
                        onClick={() => setUnit('cm')}
                        className={`${styles.unitBtn} ${unit === 'cm' ? styles.unitBtnActive : ''}`}
                      >
                        Centimeters (cm)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Kurta Table */}
                <div className={styles.tableContainer}>
                  <table className={styles.sizeTable}>
                    <thead>
                      <tr>
                        <th>Kurta Size</th>
                        <th>Chest Measurement</th>
                        <th>Waist Line</th>
                        <th>Kurta Length</th>
                        <th>Recommended Dhoti</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MEN_SIZES.map((row, idx) => (
                        <tr key={idx}>
                          <td>
                            <span className={styles.sizeBadge}>{row.size}</span>
                          </td>
                          <td><strong>{unit === 'in' ? row.chestIn : row.chestCm}</strong></td>
                          <td>{unit === 'in' ? row.waistIn : row.waistCm}</td>
                          <td>{unit === 'in' ? row.lengthIn : row.lengthCm}</td>
                          <td>
                            <span style={{ fontSize: '0.88rem', color: '#6d28d9', fontWeight: 600 }}>
                              {row.dhotiMatch}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Dhoti / Veshti Explanation */}
                <div className={styles.infoGrid} style={{ marginTop: '2rem' }}>
                  <div className={styles.infoBox}>
                    <h3 className={styles.infoBoxTitle}>4 Muzham Dhoti (Single Veshti)</h3>
                    <p className={styles.infoBoxText}>
                      Length: 2.0 Meters (approx 78 inches). Ideal for casual daily pooja, temple visits, and light wrap. Features 1-inch or 2-inch Mayilkan / Kasavu border.
                    </p>
                    <span className={styles.infoBoxHighlight}>2.0 Meters Single</span>
                  </div>

                  <div className={styles.infoBox}>
                    <h3 className={styles.infoBoxTitle}>8 Muzham Dhoti (Double Veshti)</h3>
                    <p className={styles.infoBoxText}>
                      Length: 3.8 to 4.0 Meters (approx 150 inches). Folded into double layer for wedding ceremonies, auspicious functions, and Panchakacham tying.
                    </p>
                    <span className={styles.infoBoxHighlight}>3.8 - 4.0 Meters Double</span>
                  </div>

                  <div className={styles.infoBox}>
                    <h3 className={styles.infoBoxTitle}>Angavastram / Shawl</h3>
                    <p className={styles.infoBoxText}>
                      Length: 1.8 to 2.0 Meters with matching zari borders to drape over the shoulder, completing the authentic South Indian attire.
                    </p>
                    <span className={styles.infoBoxHighlight}>Matching Zari Shawl</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: BRASS VILAKKU & DECOR */}
            {activeTab === 'brass' && (
              <div className={styles.contentCard}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}>
                    <Flame size={22} color="#7c3aed" /> Brass Vilakku (Lamps) &amp; Temple Idol Dimensions
                  </h2>
                  <p className={styles.cardSubtitle}>
                    Pure solid virgin brass hand-castings from Nachiarkoil &amp; Swamimalai artisan clusters.
                  </p>
                </div>

                <div className={styles.tableContainer}>
                  <table className={styles.sizeTable}>
                    <thead>
                      <tr>
                        <th>Lamp / Idol Type</th>
                        <th>Height</th>
                        <th>Base Diameter</th>
                        <th>Approx Solid Weight</th>
                        <th>Oil Capacity</th>
                        <th>Ideal Usage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {BRASS_SIZES.map((item, idx) => (
                        <tr key={idx}>
                          <td><strong>{item.type}</strong></td>
                          <td>{item.height}</td>
                          <td>{item.baseDiameter}</td>
                          <td>
                            <span className={styles.sizeBadge}>{item.weight}</span>
                          </td>
                          <td>{item.capacity}</td>
                          <td style={{ fontSize: '0.88rem', color: '#4b5563' }}>{item.bestFor}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className={styles.careCard} style={{ background: '#fdf4ff', borderColor: '#f0abfc' }}>
                  <Sparkles size={24} style={{ color: '#c026d3', flexShrink: 0, marginTop: '0.2rem' }} />
                  <div>
                    <h4 className={styles.careTitle} style={{ color: '#86198f' }}>Picky Brass Lustre Guarantee</h4>
                    <p className={styles.careText} style={{ color: '#701a75' }}>
                      All Picky brass lamps are cast using heavy virgin brass ingot alloy and finished with a micro-thin transparent organic seal. For cleaning, use natural tamarind paste or Pitambari powder with a soft cotton cloth; avoid steel scrubbers to protect the fine engravings.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Sizing Assistance Banner */}
            <div style={{
              background: 'linear-gradient(135deg, #1e1b4b 0%, #311042 100%)',
              borderRadius: '18px',
              padding: '2rem 2.5rem',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1.5rem',
              marginTop: '2rem'
            }}>
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 0.35rem 0', color: '#fff' }}>
                  Confused about your size or custom stitching?
                </h3>
                <p style={{ margin: 0, color: '#e9d5ff', fontSize: '0.92rem' }}>
                  Our in-house master tailors and craft advisors can guide you via WhatsApp with live measurements.
                </p>
              </div>
              <a
                href="https://wa.me/918300295721"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{
                  borderRadius: '12px',
                  padding: '0.75rem 1.4rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  textDecoration: 'none'
                }}
              >
                <MessageCircle size={18} /> WhatsApp Sizing Help
              </a>
            </div>
          </main>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          2. MOBILE VIEW (<= 768px) - CLEAN SVG ICONS, 0 EMOJIS, STRICT TYPOGRAPHY
          ══════════════════════════════════════════════════════════════════════ */}
      <div className={styles.mobileView}>
        {/* Mobile Hero */}
        <header className={styles.mobileHero}>
          <div className={styles.badgePill}>
            <Ruler size={13} color="#E9D5FF" />
            <span>Picky Craft Sizing &amp; Measurement Center</span>
          </div>
          <h1 className={styles.heroTitle}>
            Find Your <span className={styles.heroTitleHighlight}>Perfect Fit &amp;</span><br />
            Dimensions
          </h1>
          <p className={styles.heroSubtitle}>
            Clear, transparent sizing tables for Madurai Sungudi sarees, stitched blouses, traditional dhotis, and solid brass temple crafts.
          </p>
        </header>

        {/* Mobile Category Tab Navigation Rail */}
        <nav className={styles.mobileCategoryRail} aria-label="Sizing Categories">
          <button
            type="button"
            onClick={() => setActiveTab('sarees')}
            className={`${styles.tabPill} ${activeTab === 'sarees' ? styles.tabPillActive : ''}`}
          >
            <Sparkles size={14} />
            <span>Sarees &amp; Handlooms</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('blouse')}
            className={`${styles.tabPill} ${activeTab === 'blouse' ? styles.tabPillActive : ''}`}
          >
            <Scissors size={14} />
            <span>Blouse &amp; Kurti Chart</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('mens')}
            className={`${styles.tabPill} ${activeTab === 'mens' ? styles.tabPillActive : ''}`}
          >
            <Shirt size={14} />
            <span>Men's Dhoti &amp; Kurta</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('brass')}
            className={`${styles.tabPill} ${activeTab === 'brass' ? styles.tabPillActive : ''}`}
          >
            <Flame size={14} />
            <span>Brass Vilakku &amp; Idols</span>
          </button>
        </nav>

        {/* Mobile Content Section */}
        <main className={styles.mobileContent}>
          {/* TAB 1: SAREES & HANDLOOMS (PRIMARY FOCUS) */}
          {activeTab === 'sarees' && (
            <>
              {/* 1. Section Header */}
              <div className={styles.sectionHeader}>
                <div className={styles.sectionTitleRow}>
                  <Sparkles size={16} strokeWidth={2.4} color="#8738F5" />
                  <h2 className={styles.sectionTitle}>Traditional Handloom Saree Specifications</h2>
                </div>
                <p className={styles.sectionDesc}>
                  Every Picky saree is woven to official handloom standards, offering graceful fall and ample pleats for all heights.
                </p>
              </div>

              {/* 2. Core Specification Cards */}
              <div className={styles.specCardsList}>
                {/* Spec Card 1: Total Length */}
                <div className={styles.specCard}>
                  <div className={`${styles.specIconWrap} ${styles.iconPurple}`}>
                    <Ruler size={18} strokeWidth={2.4} />
                  </div>
                  <div className={styles.specCardBody}>
                    <h4 className={styles.specTitle}>Total Length: 6.30 Meters</h4>
                    <p className={styles.specDesc}>
                      Standard 5.5 meters of seamless saree drape plus 0.8 meter of attached matching unstitched blouse piece in running weave.
                    </p>
                    <span className={styles.specTagPill}>
                      5.5 m Saree + 0.8 m Blouse
                    </span>
                  </div>
                </div>

                {/* Spec Card 2: Saree Width (Panna) */}
                <div className={styles.specCard}>
                  <div className={`${styles.specIconWrap} ${styles.iconPink}`}>
                    <Scissors size={18} strokeWidth={2.4} />
                  </div>
                  <div className={styles.specCardBody}>
                    <h4 className={styles.specTitle}>Saree Width (Panna): 45 – 47 Inches</h4>
                    <p className={styles.specDesc}>
                      Full traditional width ensuring comfortable floor-length drape for individuals between 4'10" and 5'10" with standard heels or flat footwear.
                    </p>
                    <span className={styles.specTagPill}>
                      45 to 47 Inch Width (116 cm)
                    </span>
                  </div>
                </div>

                {/* Spec Card 3: Sungudi Cotton Weight */}
                <div className={styles.specCard}>
                  <div className={`${styles.specIconWrap} ${styles.iconAmber}`}>
                    <Feather size={18} strokeWidth={2.4} />
                  </div>
                  <div className={styles.specCardBody}>
                    <h4 className={styles.specTitle}>Sungudi Cotton Weight: ~500 Grams</h4>
                    <p className={styles.specDesc}>
                      Breathable 100% combed cotton woven with pure zari border. Lightweight, airy, and naturally crisp for South Indian summers.
                    </p>
                    <span className={styles.specTagPill}>
                      Featherlight ~480 – 520g
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. Saree Parts & Measurement Breakdown Section */}
              <div className={styles.breakdownSection}>
                <div className={styles.breakdownHeader}>
                  <h3 className={styles.breakdownTitle}>Saree Parts &amp; Measurement Breakdown</h3>
                  <span className={styles.componentsCountPill}>4 Components</span>
                </div>

                <div className={styles.componentCardsList}>
                  {/* Component 1: Main Body */}
                  <div className={styles.componentCard}>
                    <div className={styles.componentRow}>
                      <div className={styles.componentName}>
                        <span className={styles.componentDot}></span>
                        <span>Main Body (Udal)</span>
                      </div>
                      <span className={styles.dimensionPill}>4.7 Meters</span>
                    </div>
                    <p className={styles.componentDetails}>
                      <strong className={styles.artisanLabel}>Artisan Details:</strong> Authentic Madurai tie-and-dye knot motifs or zari buttas.
                    </p>
                  </div>

                  {/* Component 2: Pallu */}
                  <div className={styles.componentCard}>
                    <div className={styles.componentRow}>
                      <div className={styles.componentName}>
                        <span className={styles.componentDot}></span>
                        <span>Pallu (Munthi)</span>
                      </div>
                      <span className={styles.dimensionPill}>0.8 Meter (80 cm)</span>
                    </div>
                    <p className={styles.componentDetails}>
                      <strong className={styles.artisanLabel}>Artisan Details:</strong> Grand woven temple zari stripes with tassel-ready edge.
                    </p>
                  </div>

                  {/* Component 3: Blouse Piece */}
                  <div className={styles.componentCard}>
                    <div className={styles.componentRow}>
                      <div className={styles.componentName}>
                        <span className={styles.componentDot}></span>
                        <span>Blouse Piece</span>
                      </div>
                      <span className={styles.dimensionPill}>0.8 Meter (80 cm)</span>
                    </div>
                    <p className={styles.componentDetails}>
                      <strong className={styles.artisanLabel}>Artisan Details:</strong> Unstitched running fabric with matching zari border for sleeves.
                    </p>
                  </div>

                  {/* Component 4: Zari Border Height */}
                  <div className={styles.componentCard}>
                    <div className={styles.componentRow}>
                      <div className={styles.componentName}>
                        <span className={styles.componentDot}></span>
                        <span>Zari Border Height</span>
                      </div>
                      <span className={styles.dimensionPill}>2.5 to 5 Inches</span>
                    </div>
                    <p className={styles.componentDetails}>
                      <strong className={styles.artisanLabel}>Artisan Details:</strong> Traditional Rettai Pettu, Getti Pettu or Temple Ganga-Jamuna borders.
                    </p>
                  </div>
                </div>
              </div>

              {/* 4. Sungudi Cotton & Silk Care Advice Callout */}
              <div className={styles.careAdviceCard}>
                <Info size={17} strokeWidth={2.4} className={styles.careAdviceIcon} />
                <div>
                  <h4 className={styles.careAdviceTitle}>Sungudi Cotton &amp; Silk Care Advice</h4>
                  <p className={styles.careAdviceDesc}>
                    For first wash of natural hand-dyed Madurai Sungudi sarees, gentle cold water dip with mild rock salt is recommended to fix the herbal dye. Do not wring or tumble dry; dry in shade to maintain vivid color brilliance.
                  </p>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: BLOUSE & KURTI SIZE CHART */}
          {activeTab === 'blouse' && (
            <div className={styles.componentCardsList}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Ready-to-Wear Blouse &amp; Kurti Size Chart</h2>
                <p className={styles.sectionDesc}>Comfortable body measurements in {unit === 'in' ? 'inches' : 'centimeters'}.</p>
                <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setUnit('in')}
                    style={{
                      padding: '0.3rem 0.75rem',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: 700,
                      background: unit === 'in' ? '#8738F5' : '#ffffff',
                      color: unit === 'in' ? '#ffffff' : '#4B5563',
                      border: '1px solid #E9E4F5'
                    }}
                  >
                    Inches
                  </button>
                  <button
                    type="button"
                    onClick={() => setUnit('cm')}
                    style={{
                      padding: '0.3rem 0.75rem',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: 700,
                      background: unit === 'cm' ? '#8738F5' : '#ffffff',
                      color: unit === 'cm' ? '#ffffff' : '#4B5563',
                      border: '1px solid #E9E4F5'
                    }}
                  >
                    Centimeters
                  </button>
                </div>
              </div>
              {BLOUSE_SIZES.map((row, idx) => (
                <div key={idx} className={styles.componentCard}>
                  <div className={styles.componentRow}>
                    <span style={{ fontWeight: 700, fontSize: '13px', color: '#19152B' }}>{row.size}</span>
                    <span className={styles.dimensionPill}>Bust: {unit === 'in' ? row.bustIn : row.bustCm}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.35rem', marginTop: '0.5rem', fontSize: '11px', color: '#64748B' }}>
                    <div>Waist: <strong style={{ color: '#19152B' }}>{unit === 'in' ? row.waistIn : row.waistCm}</strong></div>
                    <div>Shoulder: <strong style={{ color: '#19152B' }}>{unit === 'in' ? row.shoulderIn : row.shoulderCm}</strong></div>
                    <div>Armhole: <strong style={{ color: '#19152B' }}>{unit === 'in' ? row.armholeIn : row.armholeCm}</strong></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: MEN'S DHOTI & KURTA */}
          {activeTab === 'mens' && (
            <div className={styles.componentCardsList}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Men's Traditional Wear &amp; Dhoti Specifications</h2>
                <p className={styles.sectionDesc}>Muzham sizing &amp; regular cotton kurta measurements.</p>
              </div>
              {MEN_SIZES.map((row, idx) => (
                <div key={idx} className={styles.componentCard}>
                  <div className={styles.componentRow}>
                    <span style={{ fontWeight: 700, fontSize: '13px', color: '#19152B' }}>{row.size}</span>
                    <span className={styles.dimensionPill}>Chest: {unit === 'in' ? row.chestIn : row.chestCm}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.35rem', marginTop: '0.5rem', fontSize: '11px', color: '#64748B' }}>
                    <div>Waist: <strong style={{ color: '#19152B' }}>{unit === 'in' ? row.waistIn : row.waistCm}</strong></div>
                    <div>Length: <strong style={{ color: '#19152B' }}>{unit === 'in' ? row.lengthIn : row.lengthCm}</strong></div>
                  </div>
                  <p style={{ margin: '0.4rem 0 0', fontSize: '11px', color: '#8738F5', fontWeight: 600 }}>
                    Matching: {row.dhotiMatch}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: BRASS VILAKKU & IDOLS */}
          {activeTab === 'brass' && (
            <div className={styles.componentCardsList}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Brass Vilakku &amp; Temple Idol Dimensions</h2>
                <p className={styles.sectionDesc}>Pure solid virgin brass hand-castings from Nachiarkoil.</p>
              </div>
              {BRASS_SIZES.map((item, idx) => (
                <div key={idx} className={styles.componentCard}>
                  <div className={styles.componentRow}>
                    <strong style={{ fontSize: '12.5px', color: '#19152B' }}>{item.type}</strong>
                    <span className={styles.dimensionPill}>{item.weight}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.35rem', marginTop: '0.5rem', fontSize: '11px', color: '#64748B' }}>
                    <div>Height: <strong style={{ color: '#19152B' }}>{item.height}</strong></div>
                    <div>Base: <strong style={{ color: '#19152B' }}>{item.baseDiameter}</strong></div>
                  </div>
                  <p style={{ margin: '0.4rem 0 0', fontSize: '11px', color: '#64748B' }}>
                    <strong style={{ color: '#374151' }}>Best For:</strong> {item.bestFor}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* 5. Interactive WhatsApp Tailor & Sizing Help CTA Banner */}
          <div className={styles.whatsappCtaCard}>
            <h3 className={styles.whatsappCtaTitle}>Confused about your size or custom stitching?</h3>
            <p className={styles.whatsappCtaSubtitle}>
              Our in-house master tailors and craft advisors can guide you via WhatsApp with live measurements.
            </p>
            <a
              href="https://wa.me/918300295721"
              target="_blank"
              rel="noreferrer"
              className={styles.whatsappCtaBtn}
            >
              <WhatsAppIcon size={16} color="#ffffff" />
              <span>WhatsApp Sizing Help</span>
            </a>
          </div>
        </main>
      </div>
    </PageWrapper>
  );
}
