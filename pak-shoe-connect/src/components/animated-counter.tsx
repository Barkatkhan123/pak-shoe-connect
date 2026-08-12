import { useAnimatedCounter } from "@/hooks/use-animated-counter";

type Props = {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  duration?: number;
  delay?: number;
};

export function AnimatedCounter({ value, suffix = "", prefix = "", label, duration = 2000, delay = 0 }: Props) {
  const { count, ref } = useAnimatedCounter(value, duration, delay);

  const display = value >= 1000
    ? (count >= 1000 ? `${(count / 1000).toFixed(count >= 10000 ? 0 : 1)}K` : `${count}`)
    : `${count}`;

  return (
    <div ref={ref} className="text-center">
      <div className="font-display text-3xl font-bold text-primary sm:text-4xl md:text-5xl">
        {prefix}{display}{suffix}
      </div>
      <div className="mt-1 text-sm text-muted-foreground">{label}</div>
    </div>
  );
}
