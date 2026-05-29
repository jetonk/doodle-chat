import styles from './Spinner.module.css';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  'aria-hidden'?: boolean;
}

export function Spinner({ size = 'md', label = 'Loading…', 'aria-hidden': ariaHidden }: SpinnerProps) {
  if (ariaHidden) {
    return <span className={`${styles.spinner} ${styles[size]}`} aria-hidden="true" />;
  }
  return (
    <span className={`${styles.spinner} ${styles[size]}`} role="status" aria-label={label} />
  );
}
