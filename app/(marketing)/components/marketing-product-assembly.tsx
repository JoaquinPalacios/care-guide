import styles from "../marketing.module.css";

export function MarketingProductAssembly() {
  return (
    <div
      className={styles.productCanvas}
      data-mk-product-canvas=""
      aria-hidden="true"
    >
      <div className={styles.productInputs}>
        <div className={styles.productFragment}>
          <p className={styles.productFragmentLabel}>Approved guide</p>
          <span className={styles.guideBar} />
          <span className={`${styles.guideBar} ${styles.guideBarMid}`} />
          <span className={`${styles.guideBar} ${styles.guideBarShort}`} />
        </div>
        <span className={styles.productPlus}>+</span>
        <div className={styles.productFragment}>
          <p className={styles.productFragmentLabel}>Clinic brand</p>
          <p className={styles.productClinicName} translate="no">
            Riverside Dental
          </p>
          <div className={styles.productSwatchRow}>
            <span className={styles.productSwatchItem}>
              <span className={`${styles.swatch} ${styles.swatchTeal}`} />
              Primary
            </span>
            <span className={styles.productSwatchItem}>
              <span
                className={`${styles.swatch} ${styles.swatchClinicAccent}`}
              />
              Accent
            </span>
          </div>
        </div>
      </div>
      <div className={styles.productMerge}>
        <span className={styles.productMergeLine} />
        <span className={styles.productMergeArrow} />
      </div>
      <div className={styles.productResult}>
        <p className={styles.productResultClinic} translate="no">
          Riverside Dental
        </p>
        <p className={styles.productResultTerm}>Post-treatment instructions</p>
        <p className={styles.productResultGuide}>
          Tooth Extraction
          <span className={styles.productResultArrow}>→</span>
        </p>
      </div>
    </div>
  );
}
