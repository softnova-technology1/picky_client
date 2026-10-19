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
  MessageCircle
} from 'lucide-react';
import styles from './SizeGuide.module.css';

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
      <div className={styles.pageWrapper}>
        {/* Executive Hero Banner */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <div className={styles.badge}>
              <Ruler size={15} /> Picky Craft Sizing & Measurement Center
            </div>
            <h1 className={styles.title}>
              Find Your <span className={styles.titleHighlight}>Perfect Fit & Dimensions</span>
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
              <Sparkles size={17} /> Sarees & Handlooms
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('blouse')}
              className={`${styles.categoryTab} ${
                activeTab === 'blouse' ? styles.categoryTabActive : ''
              }`}
            >
              <Scissors size={17} /> Blouse & Kurti Chart
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('mens')}
              className={`${styles.categoryTab} ${
                activeTab === 'mens' ? styles.categoryTabActive : ''
              }`}
            >
              <Shirt size={17} /> Men's Dhoti & Kurta
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('brass')}
              className={`${styles.categoryTab} ${
                activeTab === 'brass' ? styles.categoryTabActive : ''
              }`}
            >
              <Flame size={17} /> Brass Vilakku & Idols
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
                  Saree Parts & Measurement Breakdown
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
                  <h4 className={styles.careTitle}>Sungudi Cotton & Silk Care Advice</h4>
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
                      <Scissors size={22} color="#7c3aed" /> Ready-to-Wear Blouse & Kurti Size Chart
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
                      <Shirt size={22} color="#7c3aed" /> Men's Traditional Wear & Dhoti Specifications
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
                  <Flame size={22} color="#7c3aed" /> Brass Vilakku (Lamps) & Temple Idol Dimensions
                </h2>
                <p className={styles.cardSubtitle}>
                  Pure solid virgin brass hand-castings from Nachiarkoil & Swamimalai artisan clusters.
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
              href="https://wa.me/919876543210?text=Hi%20Picky,%20I%20need%20help%20choosing%20my%20size"
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
    </PageWrapper>
  );
}
