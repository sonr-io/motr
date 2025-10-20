import { forwardRef } from 'react';
import Lottie from 'lottie-react';
import type { LucideProps } from 'lucide-react';

export interface LottieIconProps extends Omit<LucideProps, 'ref'> {
  animationData: object;
  loop?: boolean;
  autoplay?: boolean;
}

export const LottieIcon = forwardRef<SVGSVGElement, LottieIconProps>(
  ({ animationData, size = 24, loop = true, autoplay = true, className, style }, _ref) => (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
    >
      <Lottie
        animationData={animationData}
        loop={loop}
        autoplay={autoplay}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  )
);

LottieIcon.displayName = 'LottieIcon';
