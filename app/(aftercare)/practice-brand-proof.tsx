import styles from "./practice-brand-proof.module.css";

interface PracticeBrandProofProps {
  displayName: string;
}

export function PracticeBrandProof({ displayName }: PracticeBrandProofProps) {
  return (
    <header className={styles.header}>
      <p className={styles.kicker}>Aftercare</p>
      <p className={styles.name}>{displayName}</p>
    </header>
  );
}
